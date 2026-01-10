import { Response } from 'express';
import { OrderService } from '../services/order.service';
import { AuthRequest } from '../types';
import { ResponseHelper } from '../utils/response';

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
            return ResponseHelper.created(res, order, 'Order created successfully');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    getOrders = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const tenantId = req.user!.tenantId;
            const { page = 1, limit = 20, status } = req.query;

            const filters = { status: status as string };
            const pagination = { page: Number(page), limit: Number(limit) };

            const { orders, total } = await this.orderService.getOrders(tenantId, filters, pagination);

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
            return ResponseHelper.success(res, order, 'Order fulfilled successfully');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };
}
