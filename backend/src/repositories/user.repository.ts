import User, { IUser } from '../models/User';
import mongoose from 'mongoose';

export class UserRepository {
    async create(data: Partial<IUser>): Promise<IUser> {
        return await User.create(data);
    }

    async findById(id: string, selectPassword: boolean = false): Promise<IUser | null> {
        const query = User.findById(id);
        if (!selectPassword) {
            query.select('-password');
        }
        return await query.populate('tenantId');
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email, isActive: true }).populate('tenantId');
    }

    async findByTenantAndEmail(tenantId: string, email: string): Promise<IUser | null> {
        return await User.findOne({ tenantId, email });
    }

    async findByTenant(tenantId: string): Promise<IUser[]> {
        return await User.find({ tenantId, isActive: true }).select('-password');
    }

    async update(id: string, tenantId: string, data: Partial<IUser>): Promise<IUser | null> {
        return await User.findOneAndUpdate(
            { _id: id, tenantId },
            data,
            { new: true, runValidators: true }
        ).select('-password');
    }

    async delete(id: string, tenantId: string): Promise<IUser | null> {
        return await User.findOneAndUpdate(
            { _id: id, tenantId },
            { isActive: false },
            { new: true }
        );
    }
}
