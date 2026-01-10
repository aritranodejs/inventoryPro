import { Response } from 'express';
import { StockMovementService } from '../services/stockMovement.service';
import { AuthRequest } from '../types';
import { ResponseHelper } from '../utils/response';

export class StockMovementController {
    private stockMovementService: StockMovementService;

    constructor() {
        this.stockMovementService = new StockMovementService();
    }

    getStockMovements = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const tenantId = req.user!.tenantId;
            const { page = 1, limit = 20, type } = req.query;

            const pagination = {
                page: Number(page),
                limit: Number(limit)
            };

            const result = await this.stockMovementService.getStockMovements(
                tenantId,
                pagination,
                type as string
            );

            const movements = result.movements.map((m: any) => ({
                ...m.toObject(),
                productName: m.productId?.name,
                userName: m.userId?.name
            }));

            return ResponseHelper.success(
                res,
                movements,
                { page: pagination.page, limit: pagination.limit, total: result.total }
            );
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };
}
