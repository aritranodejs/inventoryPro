import { Response } from 'express';
import { PurchaseOrderService } from '../services/purchaseOrder.service';
import { AuthRequest, POStatus } from '../types';
import { ResponseHelper } from '../utils/response';

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
            return ResponseHelper.created(res, purchaseOrder, 'Purchase order created successfully');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    getPurchaseOrders = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const tenantId = req.user!.tenantId;
            const { page = 1, limit = 20, status } = req.query;

            const filters = { status: status as string };
            const pagination = { page: Number(page), limit: Number(limit) };

            const { purchaseOrders, total } = await this.poService.getPurchaseOrders(tenantId, filters, pagination);

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
            return ResponseHelper.success(res, purchaseOrder, 'Items received successfully');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };
}
