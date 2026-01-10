import { api } from './api';
import type { LoginResponse, User } from '../types';

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, any>({
            query: (credentials) => ({
                url: 'auth/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['User'],
        }),
        register: builder.mutation<any, any>({
            query: (data) => ({
                url: 'auth/register',
                method: 'POST',
                body: data,
            }),
        }),
        getMe: builder.query<{ user: User }, void>({
            query: () => 'auth/me',
            providesTags: ['User'],
        }),
        logout: builder.mutation<void, void>({
            query: () => ({
                url: 'auth/logout',
                method: 'POST',
            }),
        }),
    }),
});

export const { useLoginMutation, useRegisterMutation, useGetMeQuery, useLogoutMutation } = authApi;
