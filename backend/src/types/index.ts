import { Request } from 'express';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        tenantId: string;
        role: string;
    };
}

export enum UserRole {
    OWNER = 'Owner',
    MANAGER = 'Manager',
    STAFF = 'Staff'
}

export enum MovementType {
    PURCHASE = 'PURCHASE',
    SALE = 'SALE',
    RETURN = 'RETURN',
    ADJUSTMENT = 'ADJUSTMENT'
}

export enum POStatus {
    DRAFT = 'DRAFT',
    SENT = 'SENT',
    CONFIRMED = 'CONFIRMED',
    RECEIVED = 'RECEIVED'
}

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    FULFILLED = 'FULFILLED',
    CANCELLED = 'CANCELLED'
}
