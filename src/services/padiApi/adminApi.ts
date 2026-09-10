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
  /** Id of the Admin record, or null when the user is not an admin. */
  adminId: string | null;
  adminRole: AdminRole | null;
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

export interface MakeUserAdminRequest {
  targetUserId: string;
  role: AdminRole;
  selectedPages: string[];
}

export interface RemoveUserAsAdminRequest {
  /** Id of the User whose Admin record should be removed. */
  userId: string;
  /** Id of the Admin record to delete (not the underlying user id). */
  adminId: string;
}

/** A single row from the AdminPermission table. */
export interface AdminPermissionRecord {
  id: string;
  adminId: string;
  pageKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPermissionsData {
  adminId: string;
  role: AdminRole;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
  };
  /** Convenience flat list of granted page keys. */
  pageKeys: string[];
  /** Full AdminPermission records. */
  permissions: AdminPermissionRecord[];
}

export interface GetAdminPermissionsResponse {
  status: string;
  data: AdminPermissionsData;
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

export interface LedgerEntry {
  id: string;
  walletId: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  referenceType: string;
  reference?: string | null;
  balanceAfter: number;
  description?: string | null;
  counterpartyName?: string | null;
  counterpartyAccount?: string | null;
  padiPayFee: number;
  platformFee: number;
  createdAt: string;
  wallet?: {
    id: string;
    currency: string;
    user?: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
    } | null;
  } | null;
}

export interface GetLedgerEntriesResponse {
  data: LedgerEntry[];
  meta: PaginationMeta;
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
    getLedgerEntries: builder.query<
      GetLedgerEntriesResponse,
      { page: number; limit: number }
    >({
      query: ({ page, limit }) => ({
        url: `/admin-dashboard/transactions?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["LedgerSummary" as any],
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
    getAdminPermissions: builder.query<
      GetAdminPermissionsResponse,
      { adminId: string }
    >({
      query: ({ adminId }) => ({
        url: `/admin-dashboard/admins/${adminId}/permissions`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    makeUserAdmin: builder.mutation<any, MakeUserAdminRequest>({
      query: ({ targetUserId, role, selectedPages }) => ({
        url: `/admin-dashboard/users/${targetUserId}/admin`,
        method: "PATCH",
        body: { targetUserId, role, selectedPages },
      }),
      invalidatesTags: ["User"],
    }),
    removeUserAsAdmin: builder.mutation<any, RemoveUserAsAdminRequest>({
      query: ({ userId, adminId }) => ({
        url: `/admin-dashboard/users/${userId}/remove-admin`,
        method: "PATCH",
        body: { adminId },
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
  useGetLedgerEntriesQuery,
  useGetUsersQuery,
  useGetAdminPermissionsQuery,
  useMakeUserAdminMutation,
  useRemoveUserAsAdminMutation,
} = adminApi;
