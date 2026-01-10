import { SupplierRepository } from '../repositories/supplier.repository';
import { AppError } from '../middleware/errorHandler';

export class SupplierService {
    private supplierRepo: SupplierRepository;

    constructor() {
        this.supplierRepo = new SupplierRepository();
    }

    async createSupplier(tenantId: string, data: any) {
        return await this.supplierRepo.create({
            tenantId,
            ...data
        } as any);
    }

    async getSuppliers(tenantId: string, pagination: { page: number; limit: number }) {
        return await this.supplierRepo.findAll(tenantId, pagination);
    }

    async getSupplierById(id: string, tenantId: string) {
        const supplier = await this.supplierRepo.findById(id, tenantId);
        if (!supplier) {
            throw new AppError('Supplier not found', 404);
        }
        return supplier;
    }

    async updateSupplier(id: string, tenantId: string, data: any) {
        const supplier = await this.supplierRepo.update(id, tenantId, data);
        if (!supplier) {
            throw new AppError('Supplier not found', 404);
        }
        return supplier;
    }

    async deleteSupplier(id: string, tenantId: string) {
        const supplier = await this.supplierRepo.delete(id, tenantId);
        if (!supplier) {
            throw new AppError('Supplier not found', 404);
        }
        return supplier;
    }
}
