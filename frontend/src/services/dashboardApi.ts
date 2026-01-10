import { api } from './api';
import type { ApiResponse } from '../types';

export interface DashboardStats {
    inventoryValue: number;
    lowStockCount: number;
    pendingPOCount: number;
    totalProducts: number;
}

export interface TopSeller {
    name: string;
    totalQuantity: number;
    totalRevenue: number;
}

export interface StockMovementStat {
    date: string;
    in: number;
    out: number;
}

export const dashboardApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardStats: builder.query<ApiResponse<DashboardStats>, void>({
            query: () => 'dashboard/stats',
            providesTags: ['Dashboard', 'Product', 'Order', 'PurchaseOrder'],
        }),
        getTopSellers: builder.query<ApiResponse<TopSeller[]>, void>({
            query: () => 'dashboard/top-sellers',
            providesTags: ['Dashboard', 'Order'],
        }),
        getStockMovementStats: builder.query<ApiResponse<StockMovementStat[]>, void>({
            query: () => 'dashboard/stock-movement',
            providesTags: ['Dashboard', 'Product'],
        }),
    }),
});

export const {
    useGetDashboardStatsQuery,
    useGetTopSellersQuery,
    useGetStockMovementStatsQuery,
} = dashboardApi;
