import PurchaseOrder, { IPurchaseOrder } from '../models/PurchaseOrder';
import mongoose from 'mongoose';

export class PurchaseOrderRepository {
    async create(data: Partial<IPurchaseOrder>, session?: mongoose.ClientSession): Promise<IPurchaseOrder> {
        const [po] = await PurchaseOrder.create([data], { session });
        return po;
    }

    async findById(id: string, tenantId: string, session?: mongoose.ClientSession): Promise<IPurchaseOrder | null> {
        return await PurchaseOrder.findOne({ _id: id, tenantId }, null, { session })
            .populate('supplierId', 'name')
            .populate('items.productId', 'name');
    }

    async findAll(
        tenantId: string,
        filters: { status?: string; search?: string },
        pagination: { page: number; limit: number }
    ): Promise<{ purchaseOrders: IPurchaseOrder[]; total: number }> {
        const query: any = { tenantId };
        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.search) {
            query.poNumber = { $regex: filters.search, $options: 'i' };
        }

        const purchaseOrders = await PurchaseOrder.find(query)
            .populate('supplierId', 'name')
            .populate('items.productId', 'name')
            .limit(pagination.limit)
            .skip((pagination.page - 1) * pagination.limit)
            .sort({ createdAt: -1 });

        const total = await PurchaseOrder.countDocuments(query);

        return { purchaseOrders, total };
    }

    async findPending(tenantId: string): Promise<IPurchaseOrder[]> {
        return await PurchaseOrder.find({
            tenantId,
            status: { $in: ['SENT', 'CONFIRMED'] }
        });
    }

    async countByTenant(tenantId: string): Promise<number> {
        return await PurchaseOrder.countDocuments({ tenantId });
    }

    async update(
        id: string,
        tenantId: string,
        data: Partial<IPurchaseOrder>,
        session?: mongoose.ClientSession
    ): Promise<IPurchaseOrder | null> {
        return await PurchaseOrder.findOneAndUpdate(
            { _id: id, tenantId },
            { ...data, updatedAt: new Date() },
            { new: true, runValidators: true, session }
        );
    }
}
