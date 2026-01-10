import { api } from './api';
import type { ApiResponse, OrderStatus } from '../types';

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

export const orderApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getOrders: builder.query<ApiResponse<Order[]>, { page?: number; status?: string; search?: string }>({
            query: (params) => {
                // Filter out empty status to avoid filtering by empty string
                const cleanParams = { ...params };
                if (!cleanParams.status) {
                    delete cleanParams.status;
                }
                return {
                    url: 'orders',
                    params: cleanParams,
                };
            },
            providesTags: ['Order'],
        }),
        createOrder: builder.mutation<ApiResponse<Order>, Partial<Order>>({
            query: (body) => ({
                url: 'orders',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Order', 'Product', 'Dashboard'],
        }),
        updateOrderStatus: builder.mutation<ApiResponse<Order>, { id: string; status: OrderStatus }>({
            query: ({ id, status }) => ({
                url: `orders/${id}/status`,
                method: 'PUT',
                body: { status },
            }),
            invalidatesTags: ['Order', 'Product', 'Dashboard'],
        }),
        fulfillOrder: builder.mutation<ApiResponse<Order>, string>({
            query: (id) => ({
                url: `orders/${id}/fulfill`,
                method: 'PUT',
            }),
            invalidatesTags: ['Order', 'Product', 'Dashboard'],
        }),
        cancelOrder: builder.mutation<ApiResponse<Order>, string>({
            query: (id) => ({
                url: `orders/${id}/cancel`,
                method: 'PUT',
            }),
            invalidatesTags: ['Order', 'Product', 'Dashboard'],
        }),
        fulfillOrderItems: builder.mutation<ApiResponse<Order>, { id: string; items: Array<{ variantSku: string; quantity: number }> }>({
            query: ({ id, items }) => ({
                url: `orders/${id}/fulfill-items`,
                method: 'PUT',
                body: { items },
            }),
            invalidatesTags: ['Order', 'Product', 'Dashboard'],
        }),
    }),
});

export const {
    useGetOrdersQuery,
    useCreateOrderMutation,
    useUpdateOrderStatusMutation,
    useFulfillOrderMutation,
    useCancelOrderMutation,
    useFulfillOrderItemsMutation,
} = orderApi;
