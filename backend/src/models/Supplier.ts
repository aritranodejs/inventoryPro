import mongoose, { Schema, Document } from 'mongoose';

interface IPricing {
    productId: mongoose.Types.ObjectId;
    variantSku: string;
    price: number;
    updatedAt: Date;
}

export interface ISupplier extends Document {
    tenantId: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    address?: string;
    pricing: IPricing[];
    paymentTerms?: string;
    rating?: number;
    createdAt: Date;
}

const PricingSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantSku: { type: String, required: true },
    price: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const SupplierSchema: Schema = new Schema({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    contactPerson: { type: String },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    pricing: [PricingSchema],
    paymentTerms: { type: String },
    rating: { type: Number, min: 0, max: 5 },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISupplier>('Supplier', SupplierSchema);
