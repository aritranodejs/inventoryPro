import { Response } from 'express';
import { SupplierService } from '../services/supplier.service';
import { AuthRequest } from '../types';
import { ResponseHelper } from '../utils/response';
import redisClient from '../config/redis';

export class SupplierController {
    private supplierService: SupplierService;

    constructor() {
        this.supplierService = new SupplierService();
    }

    createSupplier = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const tenantId = req.user!.tenantId;
            const supplier = await this.supplierService.createSupplier(tenantId, req.body);
            await redisClient.del(`suppliers:${tenantId}`);
            return ResponseHelper.created(res, supplier, 'Supplier created successfully');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    getSuppliers = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const tenantId = req.user!.tenantId;
            const { page = 1, limit = 20, search } = req.query;

            const filters = { search: search as string };
            const pagination = { page: Number(page), limit: Number(limit) };

            const cacheKey = `suppliers:${tenantId}:${JSON.stringify(filters)}:${JSON.stringify(pagination)}`;
            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                return ResponseHelper.success(res, parsedData.suppliers, {
                    page: pagination.page,
                    limit: pagination.limit,
                    total: parsedData.total
                });
            }

            const { suppliers, total } = await this.supplierService.getSuppliers(tenantId, filters, pagination);

            // Cache for 5 minutes
            await redisClient.setex(cacheKey, 300, JSON.stringify({ suppliers, total }));

            return ResponseHelper.success(
                res,
                suppliers,
                { page: pagination.page, limit: pagination.limit, total }
            );
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    getSupplierById = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const tenantId = req.user!.tenantId;
            const supplier = await this.supplierService.getSupplierById(id, tenantId);
            return ResponseHelper.success(res, supplier);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    updateSupplier = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const tenantId = req.user!.tenantId;
            const supplier = await this.supplierService.updateSupplier(id, tenantId, req.body);
            const keys = await redisClient.keys(`suppliers:${tenantId}:*`);
            if (keys.length > 0) await redisClient.del(keys);

            return ResponseHelper.success(res, supplier, 'Supplier updated successfully');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    deleteSupplier = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const tenantId = req.user!.tenantId;
            await this.supplierService.deleteSupplier(id, tenantId);
            const keys = await redisClient.keys(`suppliers:${tenantId}:*`);
            if (keys.length > 0) await redisClient.del(keys);

            return ResponseHelper.success(res, null, 'Supplier deleted successfully');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };
}
