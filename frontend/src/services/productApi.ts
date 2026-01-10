import { api } from './api';
import type { Product, ApiResponse } from '../types';

export const productApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getProducts: builder.query<ApiResponse<Product[]>, { page?: number; limit?: number; search?: string; category?: string }>({
            query: (params) => ({
                url: 'products',
                params,
            }),
            providesTags: ['Product'],
        }),
        getProduct: builder.query<ApiResponse<Product>, string>({
            query: (id) => `products/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Product', id }],
        }),
        createProduct: builder.mutation<ApiResponse<Product>, Partial<Product>>({
            query: (body) => ({
                url: 'products',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Product'],
        }),
        updateProduct: builder.mutation<ApiResponse<Product>, { id: string; body: Partial<Product> }>({
            query: ({ id, body }) => ({
                url: `products/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => ['Product', { type: 'Product', id }],
        }),
        deleteProduct: builder.mutation<ApiResponse<void>, string>({
            query: (id) => ({
                url: `products/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Product'],
        }),
        getLowStock: builder.query<ApiResponse<Product[]>, void>({
            query: () => 'products/low-stock',
            providesTags: ['Product'],
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetProductQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useGetLowStockQuery,
} = productApi;
