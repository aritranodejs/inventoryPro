import Product, { IProduct } from '../models/Product';
import mongoose from 'mongoose';

export class ProductRepository {
    async create(data: Partial<IProduct>): Promise<IProduct> {
        return await Product.create(data);
    }

    async findById(id: string, tenantId: string, session?: mongoose.ClientSession): Promise<IProduct | null> {
        return await Product.findOne({ _id: id, tenantId }, null, { session });
    }

    async findAll(
        tenantId: string,
        filters: { search?: string; category?: string },
        pagination: { page: number; limit: number }
    ): Promise<{ products: IProduct[]; total: number }> {
        const query: any = { tenantId };

        if (filters.search) {
            query.name = { $regex: filters.search, $options: 'i' };
        }

        if (filters.category) {
            query.category = filters.category;
        }

        const products = await Product.find(query)
            .limit(pagination.limit)
            .skip((pagination.page - 1) * pagination.limit)
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(query);

        return { products, total };
    }

    async findAllByTenant(tenantId: string): Promise<IProduct[]> {
        return await Product.find({ tenantId });
    }

    async update(id: string, tenantId: string, data: Partial<IProduct>): Promise<IProduct | null> {
        return await Product.findOneAndUpdate(
            { _id: id, tenantId },
            { ...data, updatedAt: new Date() },
            { new: true, runValidators: true }
        );
    }

    async delete(id: string, tenantId: string): Promise<IProduct | null> {
        return await Product.findOneAndDelete({ _id: id, tenantId });
    }

    async updateVariantStock(
        productId: string,
        variantSku: string,
        quantity: number,
        tenantId: string,
        session?: mongoose.ClientSession
    ): Promise<IProduct | null> {
        return await Product.findOneAndUpdate(
            { _id: productId, tenantId, 'variants.sku': variantSku },
            { $inc: { 'variants.$.stock': quantity } },
            { new: true, session }
        );
    }

    async deductVariantStock(
        productId: string,
        variantSku: string,
        quantity: number,
        tenantId: string,
        session?: mongoose.ClientSession
    ): Promise<IProduct | null> {
        // Enforce that stock cannot go below zero atomically
        const result = await Product.findOneAndUpdate(
            {
                _id: productId,
                tenantId,
                'variants': {
                    $elemMatch: {
                        sku: variantSku,
                        stock: { $gte: quantity }
                    }
                }
            },
            { $inc: { 'variants.$.stock': -quantity } },
            { new: true, session }
        );
        return result;
    }
}
