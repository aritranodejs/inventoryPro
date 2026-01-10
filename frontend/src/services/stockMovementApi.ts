import { api } from './api';
import type { ApiResponse } from '../types';
import { socket } from './socket';

export const MovementType = {
    PURCHASE: 'PURCHASE',
    SALE: 'SALE',
    RETURN: 'RETURN',
    ADJUSTMENT: 'ADJUSTMENT',
} as const;
export type MovementType = typeof MovementType[keyof typeof MovementType];

export interface StockMovement {
    _id: string;
    productId: string;
    productName?: string;
    variantSku: string;
    type: MovementType;
    quantity: number;
    reason?: string;
    referenceId?: string; // OrderId or POId
    userName?: string;
    createdAt: string;
}

export const stockMovementApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getStockMovements: builder.query<ApiResponse<StockMovement[]>, { productId?: string; variantSku?: string; type?: string; page?: number }>({
            query: (params) => ({
                url: 'stock-movements',
                params,
            }),
            providesTags: ['Product'],
            async onCacheEntryAdded(_arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                try {
                    await cacheDataLoaded;
                    socket.on('stock_movement', (movement: StockMovement) => {
                        updateCachedData((draft) => {
                            if (draft.data) {
                                draft.data.unshift(movement);
                                if (draft.data.length > 50) draft.data.pop();
                            }
                        });
                    });
                } catch { }
                await cacheEntryRemoved;
                socket.off('stock_movement');
            },
        }),
    }),
});

export const {
    useGetStockMovementsQuery,
} = stockMovementApi;
