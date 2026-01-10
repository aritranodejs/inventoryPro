import Order, { IOrder } from '../models/Order';
import mongoose from 'mongoose';

export class OrderRepository {
    async create(data: Partial<IOrder>, session?: mongoose.ClientSession): Promise<IOrder> {
        const [order] = await Order.create([data], { session });
        return order;
    }

    async findById(id: string, tenantId: string, session?: mongoose.ClientSession): Promise<IOrder | null> {
        return await Order.findOne({ _id: id, tenantId }, null, { session }).populate('items.productId', 'name');
    }

    async findAll(
        tenantId: string,
        filters: { status?: string; search?: string },
        pagination: { page: number; limit: number }
    ): Promise<{ orders: IOrder[]; total: number }> {
        const query: any = { tenantId };
        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.search) {
            query.$or = [
                { orderNumber: { $regex: filters.search, $options: 'i' } },
                { customerName: { $regex: filters.search, $options: 'i' } },
                { customerEmail: { $regex: filters.search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(query)
            .populate('items.productId', 'name')
            .limit(pagination.limit)
            .skip((pagination.page - 1) * pagination.limit)
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments(query);

        return { orders, total };
    }

    async countByTenant(tenantId: string): Promise<number> {
        return await Order.countDocuments({ tenantId });
    }

    async update(id: string, tenantId: string, data: Partial<IOrder>, session?: mongoose.ClientSession): Promise<IOrder | null> {
        return await Order.findOneAndUpdate(
            { _id: id, tenantId },
            { ...data, updatedAt: new Date() },
            { new: true, runValidators: true, session }
        );
    }

    async getTopSellers(tenantId: string, days: number = 30, limit: number = 5): Promise<any[]> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const result = await Order.aggregate([
            {
                $match: {
                    tenantId: new mongoose.Types.ObjectId(tenantId),
                    createdAt: { $gte: startDate },
                    status: { $in: ['CONFIRMED', 'FULFILLED'] }
                }
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $project: {
                    productId: '$_id',
                    productName: '$product.name',
                    totalQuantity: 1,
                    totalRevenue: 1
                }
            }
        ]);

        return result;
    }
}
