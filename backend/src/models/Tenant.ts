import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
    companyName: string;
    email: string;
    phone: string;
    address?: string;
    status: 'active' | 'inactive';
    createdAt: Date;
}

const TenantSchema: Schema = new Schema({
    companyName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITenant>('Tenant', TenantSchema);
