export const UserRole = {
    OWNER: 'Owner',
    MANAGER: 'Manager',
    STAFF: 'Staff',
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const OrderStatus = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    FULFILLED: 'FULFILLED',
    CANCELLED: 'CANCELLED',
} as const;
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const POStatus = {
    DRAFT: 'DRAFT',
    SENT: 'SENT',
    CONFIRMED: 'CONFIRMED',
    RECEIVED: 'RECEIVED',
} as const;
export type POStatus = typeof POStatus[keyof typeof POStatus];

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface ProductVariant {
    sku: string;
    size?: string;
    color?: string;
    price: number;
    stock: number;
}

export interface Product {
    _id: string;
    name: string;
    description?: string;
    category?: string;
    variants: ProductVariant[];
    lowStockThreshold: number;
    tenantId: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    productId: string;
    variantSku: string;
    productName?: string;
    quantity: number;
    fulfilledQuantity?: number;
    price: number;
}

export interface Order {
    _id: string;
    orderNumber: string;
    customerName: string;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    notes?: string;
    createdAt: string;
}

export interface POItem {
    productId: string;
    variantSku: string;
    productName?: string;
    orderedQuantity: number;
    price: number;
    receivedQuantity: number;
}

export interface PurchaseOrder {
    _id: string;
    poNumber: string;
    supplierId: string;
    supplierName?: string;
    items: POItem[];
    totalAmount: number;
    status: POStatus;
    expectedDate?: string;
    actualDate?: string;
    createdAt: string;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    tenantId: string;
    companyName?: string;
}

export interface Tenant {
    _id: string;
    companyName: string;
    email: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

export interface LoginResponse {
    success: boolean;
    data: {
        token: string;
        user: User;
    };
}

export interface RegisterResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
        user: User;
    };
}
