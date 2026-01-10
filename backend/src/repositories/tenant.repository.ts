import Tenant, { ITenant } from '../models/Tenant';
import mongoose from 'mongoose';

export class TenantRepository {
    async create(data: Partial<ITenant>): Promise<ITenant> {
        return await Tenant.create(data);
    }

    async findById(id: string): Promise<ITenant | null> {
        return await Tenant.findById(id);
    }

    async findByEmail(email: string): Promise<ITenant | null> {
        return await Tenant.findOne({ email });
    }

    async update(id: string, data: Partial<ITenant>): Promise<ITenant | null> {
        return await Tenant.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async delete(id: string): Promise<ITenant | null> {
        return await Tenant.findByIdAndDelete(id);
    }
}
