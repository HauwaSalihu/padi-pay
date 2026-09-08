import { baseApi } from './baseApi';
import type { AuthResponse } from './authApi';

export interface UserNextOfKin {
  name: string | null;
  email: string | null;
  phone: string | null;
  relationship: string | null;
}

export interface UserBankAccount {
  id: string;
  bankName: string | null;
  bankCode: string | null;
  accountName: string | null;
  last4: string | null;
  status: string;
}

// Variable JSONB payload returned from the verification provider (e.g. Paystack).
export type BvnVerificationData = Record<string, unknown> | null;

export interface UserDetails {
  id: string;
  names: {
    first_name: string | null;
    middle_name: string | null;
    last_name: string | null;
  };
  email: string | null;
  phone: string | null;
  verification: {
    isEmailVerified: boolean;
    emailVerifiedAt: string | null;
    isPhoneVerified: boolean;
    phoneVerifiedAt: string | null;
  };
  identity: {
    bvnVerified: boolean;
    bvnLast4: string | null;
    bvnVerifiedAt: string | null;
    bvnVerificationData: BvnVerificationData;
  } | null;
  bankAccounts: UserBankAccount[];
  nextOfKin: UserNextOfKin[];
}

export interface AdminStatusResponse {
  isAdmin: boolean;
  adminRole?: string;
}

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
    getUserDetails: builder.query<UserDetails, string>({
      query: (userId) => `/admin-dashboard/users/${userId}`,
      providesTags: ['User'],
    }),
    getAdminStatus: builder.query<AdminStatusResponse, void>({
      query: () => '/auth/admin-status',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useGetMeQuery,
  useGetUserDetailsQuery,
  useGetAdminStatusQuery,
} = userApi;
