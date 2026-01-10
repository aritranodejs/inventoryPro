import mongoose, { Schema, Document } from 'mongoose';

interface IVariant {
    sku: string;
    attributes: { [key: string]: string };
    price: number;
    stock: number;
}

export interface IProduct extends Document {
    tenantId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    category?: string;
    variants: IVariant[];
    lowStockThreshold: number;
    createdAt: Date;
    updatedAt: Date;
}

const VariantSchema = new Schema({
    sku: { type: String, required: true },
    size: { type: String },
    color: { type: String },
    attributes: { type: Map, of: String },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 }
}, { _id: false });

const ProductSchema: Schema = new Schema({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    variants: [VariantSchema],
    lowStockThreshold: { type: Number, default: 10 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

ProductSchema.index({ tenantId: 1, name: 1 });
ProductSchema.index({ 'variants.sku': 1 });

export default mongoose.model<IProduct>('Product', ProductSchema);
