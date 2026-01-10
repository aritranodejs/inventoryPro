import { Response } from 'express';
import { PurchaseOrderService } from '../services/purchaseOrder.service';
import { AuthRequest, POStatus } from '../types';
import { ResponseHelper } from '../utils/response';
import redisClient from '../config/redis';

export class PurchaseOrderController {
    private poService: PurchaseOrderService;

    constructor() {
        this.poService = new PurchaseOrderService();
    }

    createPurchaseOrder = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const tenantId = req.user!.tenantId;
            const userId = req.user!.userId;
            const purchaseOrder = await this.poService.createPurchaseOrder(tenantId, userId, req.body);
            const keys = await redisClient.keys(`purchase_orders:${tenantId}:*`);
            if (keys.length > 0) await redisClient.del(keys);
            return ResponseHelper.created(res, purchaseOrder, 'Purchase order created successfully');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    getPurchaseOrders = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const tenantId = req.user!.tenantId;
            const { page = 1, limit = 10, status, search } = req.query;

            const filters = {
                status: status as string,
                search: search as string
            };
            const pagination = { page: Number(page), limit: Number(limit) };

            const cacheKey = `purchase_orders:${tenantId}:${JSON.stringify(filters)}:${JSON.stringify(pagination)}`;
            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                return ResponseHelper.success(res, parsedData.purchaseOrders, {
                    page: pagination.page,
                    limit: pagination.limit,
                    total: parsedData.total
                });
            }

            const { purchaseOrders, total } = await this.poService.getPurchaseOrders(tenantId, filters, pagination);

            // Cache for 5 minutes
            await redisClient.setex(cacheKey, 300, JSON.stringify({ purchaseOrders, total }));

            return ResponseHelper.success(
                res,
                purchaseOrders,
                { page: pagination.page, limit: pagination.limit, total }
            );
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    updatePOStatus = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const tenantId = req.user!.tenantId;
            const purchaseOrder = await this.poService.updatePOStatus(id, tenantId, status as POStatus);

            const keys = await redisClient.keys(`purchase_orders:${tenantId}:*`);
            if (keys.length > 0) await redisClient.del(keys);

            return ResponseHelper.success(res, purchaseOrder, 'Purchase order status updated');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    receiveItems = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const { receivedItems } = req.body;
            const tenantId = req.user!.tenantId;
            const userId = req.user!.userId;
            const purchaseOrder = await this.poService.receiveItems(id, tenantId, userId, receivedItems);

            const keys = await redisClient.keys(`purchase_orders:${tenantId}:*`);
            if (keys.length > 0) await redisClient.del(keys);

            // Stock changed, invalidate product cache
            const productKeys = await redisClient.keys(`products:${tenantId}:*`);
            if (productKeys.length > 0) await redisClient.del(productKeys);

            return ResponseHelper.success(res, purchaseOrder, 'Items received successfully');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };
}
