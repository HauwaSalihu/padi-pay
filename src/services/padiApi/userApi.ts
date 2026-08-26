import { baseApi } from './baseApi';
import type { AuthResponse } from './authApi';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<AuthResponse, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    getMe: builder.query<AuthResponse, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useGetMeQuery,
} = userApi;
