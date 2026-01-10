import { Response } from 'express';
import { SupplierService } from '../services/supplier.service';
import { AuthRequest } from '../types';
import { ResponseHelper } from '../utils/response';

export class SupplierController {
    private supplierService: SupplierService;

    constructor() {
        this.supplierService = new SupplierService();
    }

    createSupplier = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const tenantId = req.user!.tenantId;
            const supplier = await this.supplierService.createSupplier(tenantId, req.body);
            return ResponseHelper.created(res, supplier, 'Supplier created successfully');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    getSuppliers = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const tenantId = req.user!.tenantId;
            const { page = 1, limit = 20 } = req.query;
            const pagination = { page: Number(page), limit: Number(limit) };

            const { suppliers, total } = await this.supplierService.getSuppliers(tenantId, pagination);

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
            return ResponseHelper.success(res, null, 'Supplier deleted successfully');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };
}
