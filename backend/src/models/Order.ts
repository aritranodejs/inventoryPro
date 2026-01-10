import mongoose, { Schema, Document } from 'mongoose';
import { OrderStatus } from '../types';

interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    variantSku: string;
    quantity: number;
    price: number;
    fulfilledQuantity: number;
}

export interface IOrder extends Document {
    tenantId: mongoose.Types.ObjectId;
    orderNumber: string;
    status: OrderStatus;
    items: IOrderItem[];
    totalAmount: number;
    customerName?: string;
    customerEmail?: string;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantSku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    fulfilledQuantity: { type: Number, default: 0, min: 0 }
}, { _id: false });

const OrderSchema: Schema = new Schema({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    orderNumber: { type: String, required: true },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    customerName: { type: String },
    customerEmail: { type: String },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

OrderSchema.index({ tenantId: 1, orderNumber: 1 }, { unique: true });
OrderSchema.index({ tenantId: 1, status: 1 });
OrderSchema.index({ tenantId: 1, createdAt: -1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
