import mongoose, { Schema, Document } from 'mongoose';
import { POStatus } from '../types';

interface IPOItem {
    productId: mongoose.Types.ObjectId;
    variantSku: string;
    orderedQuantity: number;
    receivedQuantity: number;
    price: number;
}

export interface IPurchaseOrder extends Document {
    tenantId: mongoose.Types.ObjectId;
    supplierId: mongoose.Types.ObjectId;
    poNumber: string;
    status: POStatus;
    items: IPOItem[];
    expectedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    totalAmount: number;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const POItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantSku: { type: String, required: true },
    orderedQuantity: { type: Number, required: true, min: 1 },
    receivedQuantity: { type: Number, default: 0, min: 0 },
    price: { type: Number, required: true, min: 0 }
}, { _id: false });

const PurchaseOrderSchema: Schema = new Schema({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    poNumber: { type: String, required: true },
    status: { type: String, enum: Object.values(POStatus), default: POStatus.DRAFT },
    items: [POItemSchema],
    expectedDeliveryDate: { type: Date },
    actualDeliveryDate: { type: Date },
    totalAmount: { type: Number, required: true },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

PurchaseOrderSchema.index({ tenantId: 1, poNumber: 1 }, { unique: true });
PurchaseOrderSchema.index({ tenantId: 1, status: 1 });

export default mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);
