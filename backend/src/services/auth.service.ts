import jwt from 'jsonwebtoken';
import { TenantRepository } from '../repositories/tenant.repository';
import { UserRepository } from '../repositories/user.repository';
import { UserRole } from '../types';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
    private tenantRepo: TenantRepository;
    private userRepo: UserRepository;

    constructor() {
        this.tenantRepo = new TenantRepository();
        this.userRepo = new UserRepository();
    }

    async register(data: {
        companyName: string;
        email: string;
        phone: string;
        address?: string;
        ownerName: string;
        ownerEmail: string;
        password: string;
    }) {
        const existingTenant = await this.tenantRepo.findByEmail(data.email);
        if (existingTenant) {
            throw new AppError('Company email already registered', 400);
        }

        const tenant = await this.tenantRepo.create({
            companyName: data.companyName,
            email: data.email,
            phone: data.phone,
            address: data.address
        });

        const user = await this.userRepo.create({
            tenantId: tenant._id,
            name: data.ownerName,
            email: data.ownerEmail,
            password: data.password,
            role: UserRole.OWNER
        } as any);

        const token = this.generateToken(user._id.toString(), tenant._id.toString(), user.role);

        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                tenantId: tenant._id,
                companyName: tenant.companyName
            }
        };
    }

    async login(email: string, password: string) {
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401);
        }

        const tenant: any = user.tenantId;
        const token = this.generateToken(user._id.toString(), tenant._id.toString(), user.role);

        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                tenantId: tenant._id,
                companyName: tenant.companyName
            }
        };
    }

    async inviteUser(
        tenantId: string,
        data: { name: string; email: string; password: string; role: UserRole; phone?: string }
    ) {
        const existingUser = await this.userRepo.findByTenantAndEmail(tenantId, data.email);
        if (existingUser) {
            throw new AppError('User already exists in this tenant', 400);
        }

        const user = await this.userRepo.create({
            tenantId,
            ...data
        } as any);

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };
    }

    async getCurrentUser(userId: string) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        const tenant: any = user.tenantId;

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            companyName: tenant.companyName
        };
    }

    private generateToken(userId: string, tenantId: string, role: string): string {
        return jwt.sign(
            { userId, tenantId, role },
            process.env.JWT_SECRET || 'your_super_secret_jwt_key_123',
            { expiresIn: (process.env.JWT_EXPIRE || '24h') as any }
        );
    }
}
