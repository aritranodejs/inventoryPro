import { api } from './api';
import type { ApiResponse } from '../types';

export interface Supplier {
    _id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address?: string;
    pricingHistory: {
        productId: string;
        variantSku: string;
        price: number;
        date: string;
    }[];
    tenantId: string;
    createdAt: string;
}

export const supplierApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getSuppliers: builder.query<ApiResponse<Supplier[]>, { page?: number; limit?: number; search?: string }>({
            query: (params) => ({
                url: 'suppliers',
                params,
            }),
            providesTags: ['Supplier'],
        }),
        getSupplier: builder.query<ApiResponse<Supplier>, string>({
            query: (id) => `suppliers/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Supplier', id }],
        }),
        createSupplier: builder.mutation<ApiResponse<Supplier>, Partial<Supplier>>({
            query: (body) => ({
                url: 'suppliers',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Supplier'],
        }),
        updateSupplier: builder.mutation<ApiResponse<Supplier>, { id: string; body: Partial<Supplier> }>({
            query: ({ id, body }) => ({
                url: `suppliers/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => ['Supplier', { type: 'Supplier', id }],
        }),
        deleteSupplier: builder.mutation<ApiResponse<void>, string>({
            query: (id) => ({
                url: `suppliers/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Supplier'],
        }),
    }),
});

export const {
    useGetSuppliersQuery,
    useGetSupplierQuery,
    useCreateSupplierMutation,
    useUpdateSupplierMutation,
    useDeleteSupplierMutation,
} = supplierApi;
