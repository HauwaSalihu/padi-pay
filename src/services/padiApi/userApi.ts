import { baseApi } from './baseApi';
import type { AuthResponse } from './authApi';

export interface UserNextOfKin {
  name: string | null;
  email: string | null;
  phone: string | null;
  relationship: string | null;
}

export interface StellersPassthroughAccount {
  id: string;
  status: boolean;
  accountNumber: string | null;
  accountName: string | null;
  accountReference: string | null;
  stellersReference: string | null;
  walletId: string;
}

export interface PaystackMandate {
  id: string;
  nuban: string | null;
  bank_code: string | null;
  bank_name: string | null;
  account_name: string | null;
  paystack_customer_id: string;
  paystack_reference: string | null;
  paystack_access_code: string | null;
  paystack_auth_code: string | null;
  paystack_signature: string | null;
  type: string;
  isCreated: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  stellersPassthroughAccounts: StellersPassthroughAccount | null;
  paystackMandates: PaystackMandate[];
  nextOfKin: UserNextOfKin | null;
  wallet?: {
    balance: number;
    id?: string | null;
  };
}

export interface AdminStatusResponse {
  isAdmin: boolean;
  adminRole?: string;
  permissions?: string[];
  pageKeys?: string[];
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
