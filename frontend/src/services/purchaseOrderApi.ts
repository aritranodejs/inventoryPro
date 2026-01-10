import { api } from './api';
import type { ApiResponse, POStatus, PurchaseOrder } from '../types';

export const purchaseOrderApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getPurchaseOrders: builder.query<ApiResponse<PurchaseOrder[]>, { search?: string; status?: string }>({
            query: (params) => ({
                url: 'purchase-orders',
                params,
            }),
            providesTags: ['PurchaseOrder'],
        }),
        getPurchaseOrder: builder.query<ApiResponse<PurchaseOrder>, string>({
            query: (id) => `purchase-orders/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'PurchaseOrder', id }],
        }),
        createPurchaseOrder: builder.mutation<ApiResponse<PurchaseOrder>, Partial<PurchaseOrder>>({
            query: (body) => ({
                url: 'purchase-orders',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['PurchaseOrder'],
        }),
        updatePOStatus: builder.mutation<ApiResponse<PurchaseOrder>, { id: string; status: POStatus }>({
            query: ({ id, status }) => ({
                url: `purchase-orders/${id}/status`,
                method: 'PUT',
                body: { status },
            }),
            invalidatesTags: ['PurchaseOrder'],
        }),
        receivePOItems: builder.mutation<ApiResponse<PurchaseOrder>, { id: string; items: { productId: string; variantSku: string; quantity: number }[] }>({
            query: ({ id, items }) => ({
                url: `purchase-orders/${id}/receive`,
                method: 'PUT',
                body: { receivedItems: items },
            }),
            invalidatesTags: ['PurchaseOrder', 'Product', 'Dashboard'],
        }),
    }),
});

export const {
    useGetPurchaseOrdersQuery,
    useGetPurchaseOrderQuery,
    useCreatePurchaseOrderMutation,
    useUpdatePOStatusMutation,
    useReceivePOItemsMutation,
} = purchaseOrderApi;
