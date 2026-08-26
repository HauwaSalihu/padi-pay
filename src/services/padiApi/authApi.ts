import { baseApi } from './baseApi';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone: string;
  gender?: 'MALE' | 'FEMALE';
  date_of_birth?: string | null;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isBvnVerified?: boolean;
  isIdentityVerified?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    logout: builder.mutation<any, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
} = authApi;
