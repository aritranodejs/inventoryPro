import mongoose, { Schema, Document } from 'mongoose';
import { MovementType } from '../types';

export interface IStockMovement extends Document {
    tenantId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    variantSku: string;
    type: MovementType;
    quantity: number;
    userId: mongoose.Types.ObjectId;
    reference?: string;
    notes?: string;
    createdAt: Date;
}

const StockMovementSchema: Schema = new Schema({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantSku: { type: String, required: true },
    type: { type: String, enum: Object.values(MovementType), required: true },
    quantity: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reference: { type: String },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now, index: true }
});

StockMovementSchema.index({ tenantId: 1, createdAt: -1 });
StockMovementSchema.index({ tenantId: 1, productId: 1 });

export default mongoose.model<IStockMovement>('StockMovement', StockMovementSchema);
