import StockMovement, { IStockMovement } from '../models/StockMovement';
import mongoose from 'mongoose';

export class StockMovementRepository {
    async create(data: Partial<IStockMovement>, session?: mongoose.ClientSession): Promise<IStockMovement> {
        const [movement] = await StockMovement.create([data], { session });
        return movement;
    }

    async findByTenant(
        tenantId: string,
        pagination: { page: number; limit: number },
        type?: string
    ): Promise<{ movements: any[]; total: number }> {
        const query: any = { tenantId };
        if (type) {
            query.type = type;
        }

        const movements = await StockMovement.find(query)
            .populate('productId', 'name')
            .populate('userId', 'name')
            .limit(pagination.limit)
            .skip((pagination.page - 1) * pagination.limit)
            .sort({ createdAt: -1 });

        const total = await StockMovement.countDocuments(query);

        return { movements, total };
    }

    async findByProduct(productId: string, tenantId: string): Promise<IStockMovement[]> {
        return await StockMovement.find({ productId, tenantId })
            .sort({ createdAt: -1 });
    }

    async getStockMovementData(tenantId: string, days: number = 7): Promise<any[]> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const result = await StockMovement.aggregate([
            {
                $match: {
                    tenantId: new mongoose.Types.ObjectId(tenantId),
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        type: '$type'
                    },
                    totalQuantity: { $sum: { $abs: '$quantity' } }
                }
            },
            {
                $group: {
                    _id: '$_id.date',
                    movements: {
                        $push: {
                            type: '$_id.type',
                            quantity: '$totalQuantity'
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return result.map(day => {
            const inMovement = day.movements.find((m: any) => m.type === 'IN' || m.type === 'PURCHASE' || m.type === 'ADJUSTMENT' && m.quantity > 0);
            const outMovement = day.movements.find((m: any) => m.type === 'OUT' || m.type === 'SALE' || m.type === 'ADJUSTMENT' && m.quantity < 0);

            return {
                date: day._id,
                in: inMovement ? inMovement.quantity : 0,
                out: outMovement ? outMovement.quantity : 0
            };
        });
    }
}
