import { Response } from 'express';
import { OrderService } from '../services/order.service';
import { AuthRequest } from '../types';
import { ResponseHelper } from '../utils/response';
import redisClient from '../config/redis';

export class OrderController {
    private orderService: OrderService;

    constructor() {
        this.orderService = new OrderService();
    }

    createOrder = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const tenantId = req.user!.tenantId;
            const userId = req.user!.userId;
            const order = await this.orderService.createOrder(tenantId, userId, req.body);
            // Invalidate orders cache
            await redisClient.del(`orders:${tenantId}`);
            // Invalidate products cache as stock changed
            const productKeys = await redisClient.keys(`products:${tenantId}:*`);
            if (productKeys.length > 0) await redisClient.del(productKeys);

            return ResponseHelper.created(res, order, 'Order created successfully');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    getOrders = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const tenantId = req.user!.tenantId;
            const { page = 1, limit = 20, status, search } = req.query;

            const filters = {
                status: status as string,
                search: search as string
            };
            const pagination = { page: Number(page), limit: Number(limit) };

            const cacheKey = `orders:${tenantId}:${JSON.stringify(filters)}:${JSON.stringify(pagination)}`;
            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                return ResponseHelper.success(res, parsedData.orders, {
                    page: pagination.page,
                    limit: pagination.limit,
                    total: parsedData.total
                });
            }

            const { orders, total } = await this.orderService.getOrders(tenantId, filters, pagination);

            // Cache for 5 minutes
            await redisClient.setex(cacheKey, 300, JSON.stringify({ orders, total }));

            return ResponseHelper.success(
                res,
                orders,
                { page: pagination.page, limit: pagination.limit, total }
            );
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    cancelOrder = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const tenantId = req.user!.tenantId;
            const userId = req.user!.userId;
            const order = await this.orderService.cancelOrder(id, tenantId, userId);

            const keys = await redisClient.keys(`orders:${tenantId}:*`);
            if (keys.length > 0) await redisClient.del(keys);

            const productKeys = await redisClient.keys(`products:${tenantId}:*`);
            if (productKeys.length > 0) await redisClient.del(productKeys);

            return ResponseHelper.success(res, order, 'Order cancelled successfully');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    fulfillOrder = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const tenantId = req.user!.tenantId;
            const order = await this.orderService.fulfillOrder(id, tenantId);

            const keys = await redisClient.keys(`orders:${tenantId}:*`);
            if (keys.length > 0) await redisClient.del(keys);

            return ResponseHelper.success(res, order, 'Order fulfilled successfully');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    fulfillOrderItems = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const tenantId = req.user!.tenantId;
            const { items } = req.body;
            const order = await this.orderService.fulfillOrderItems(id, tenantId, items);

            const keys = await redisClient.keys(`orders:${tenantId}:*`);
            if (keys.length > 0) await redisClient.del(keys);

            return ResponseHelper.success(res, order, 'Order items fulfilled successfully');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };
}
