import { baseApi } from "./baseApi";

export interface AjoGroup {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  status: string;
  privacy: string;
  requiresApproval: boolean;
  inviteCode?: string | null;
  groupSize: number;
  contributionAmount: number;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  contributionSchedule: string;
  totalCycles: number;
  targetAmount: number;
  adminId: string;
  createdAt: string;
  updatedAt: string;
  admin?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

export interface AjoMemberApplication {
  id: string;
  ajoId: string;
  userId: string;
  hands?: number | null;
  contributionAmount?: number | null;
  status: "PENDING" | "ACTIVE" | "LEFT" | "REMOVED";
  linkedAccountId?: string | null;
  linkedAccountType: "BUSINESS" | "SALARY";
  bankStatementURL: string;
  businessName?: string | null;
  cacNumber?: string | null;
  totalContributionPaid?: number | null;
  totalRounds?: number | null;
  totalRoundsPaid?: number | null;
  createdAt: string;
  updatedAt: string;
  ajo: AjoGroup;
  user: {
    id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    phone: string;
    gender?: "MALE" | "FEMALE" | null;
    date_of_birth?: string | null;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PendingAjoApplicationsResponse {
  data: AjoMemberApplication[];
  meta: PaginationMeta;
}

export enum AdminRole {
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN",
}

export interface AdminUser {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  date_created: string;
  role: AdminRole | "USER";
}

export interface SearchUsersResponse {
  data: AdminUser[];
}

export interface AppStats {
  signedUpUsers: number;
  activeAjoGroups: number;
  ajoGroupsWaitingActivation: number;
  pendingUsers: number;
}

export interface GetUsersResponse {
  data: AdminUser[];
  meta: PaginationMeta;
}

export interface AppStatsResponse {
  status: string;
  data: AppStats;
}

export interface LedgerSummary {
  totalIncoming: number;
  totalOutgoing: number;
  totalPadiPayFee: number;
  totalPlatformFee: number;
}

export interface LedgerSummaryResponse {
  status: string;
  data: LedgerSummary;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAppStats: builder.query<AppStatsResponse, void>({
      query: () => ({
        url: "/admin-dashboard/stats",
        method: "GET",
      }),
      providesTags: ["AjoApplications"],
    }),
    getLedgerSummary: builder.query<LedgerSummaryResponse, void>({
      query: () => ({
        url: "/admin-dashboard/ledger-summary",
        method: "GET",
      }),
    }),
    getPendingAjoApplications: builder.query<
      PendingAjoApplicationsResponse,
      { page: number; limit: number }
    >({
      query: ({ page, limit }) => ({
        url: `/admin-dashboard/ajo-applications?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["AjoApplications"],
    }),
    handleAjoApplication: builder.mutation<
      any,
      { memberId: string; approve: boolean }
    >({
      query: ({ memberId, approve }) => ({
        url: `/admin-dashboard/ajo-applications/${memberId}`,
        method: "PATCH",
        body: { approve },
      }),
      invalidatesTags: ["AjoApplications"],
    }),
    getUsers: builder.query<GetUsersResponse, { page: number; limit: number }>({
      query: ({ page, limit }) => ({
        url: `/admin-dashboard/users?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    searchUsers: builder.query<AdminUser[], { query: string }>({
      query: ({ query }) => ({
        url: `/admin-dashboard/users/search?query=${encodeURIComponent(query)}`,
        method: "GET",
      }),
    }),
    makeUserAdmin: builder.mutation<
      { message: string; data: AdminUser },
      { userId: string }
    >({
      query: ({ userId }) => ({
        url: `/admin-dashboard/users/${userId}/admin`,
        method: "PATCH",
      }),
      invalidatesTags: ["User"],
    }),

    makeUserSuperAdmin: builder.mutation<
      { message: string; data: AdminUser },
      { userId: string }
    >({
      query: ({ userId }) => ({
        url: `/admin-dashboard/users/${userId}/superadmin`,
        method: "PATCH",
      }),
      invalidatesTags: ["User"],
    }),

    removeUserAsAdmin: builder.mutation<
      { message: string },
      { userId: string }
    >({
      query: ({ userId }) => ({
        url: `/admin-dashboard/users/${userId}/remove-admin`,
        method: "PATCH",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetPendingAjoApplicationsQuery,
  useHandleAjoApplicationMutation,
  useGetAppStatsQuery,
  useGetLedgerSummaryQuery,
  useGetUsersQuery,
  useSearchUsersQuery,
  useMakeUserAdminMutation,
  useMakeUserSuperAdminMutation,
  useRemoveUserAsAdminMutation,
} = adminApi;
