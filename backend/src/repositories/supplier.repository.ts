import Supplier, { ISupplier } from '../models/Supplier';

export class SupplierRepository {
    async create(data: Partial<ISupplier>): Promise<ISupplier> {
        return await Supplier.create(data);
    }

    async findById(id: string, tenantId: string): Promise<ISupplier | null> {
        return await Supplier.findOne({ _id: id, tenantId });
    }

    async findAll(
        tenantId: string,
        pagination: { page: number; limit: number }
    ): Promise<{ suppliers: ISupplier[]; total: number }> {
        const suppliers = await Supplier.find({ tenantId })
            .limit(pagination.limit)
            .skip((pagination.page - 1) * pagination.limit)
            .sort({ name: 1 });

        const total = await Supplier.countDocuments({ tenantId });

        return { suppliers, total };
    }

    async update(id: string, tenantId: string, data: Partial<ISupplier>): Promise<ISupplier | null> {
        return await Supplier.findOneAndUpdate(
            { _id: id, tenantId },
            data,
            { new: true, runValidators: true }
        );
    }

    async delete(id: string, tenantId: string): Promise<ISupplier | null> {
        return await Supplier.findOneAndDelete({ _id: id, tenantId });
    }
}
