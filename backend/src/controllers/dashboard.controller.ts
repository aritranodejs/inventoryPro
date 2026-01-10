import { Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { AuthRequest } from '../types';
import { ResponseHelper } from '../utils/response';

export class DashboardController {
    private dashboardService: DashboardService;

    constructor() {
        this.dashboardService = new DashboardService();
    }

    getDashboardStats = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const tenantId = req.user!.tenantId;
            const stats = await this.dashboardService.getDashboardStats(tenantId);
            return ResponseHelper.success(res, stats);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    getTopSellers = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const tenantId = req.user!.tenantId;
            const { days = 30 } = req.query;
            const topSellers = await this.dashboardService.getTopSellers(tenantId, Number(days));
            return ResponseHelper.success(res, topSellers);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    getStockMovementData = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const tenantId = req.user!.tenantId;
            const { days = 7 } = req.query;
            const stockMovement = await this.dashboardService.getStockMovementData(tenantId, Number(days));
            return ResponseHelper.success(res, stockMovement);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };
}
