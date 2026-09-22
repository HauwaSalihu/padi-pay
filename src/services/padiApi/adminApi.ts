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
    id?: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  } | null;

  ajoMembers?: AjoMember[];

  ajoCycles?: AjoCycle[];

  ajoContributions?: AjoContribution[];

  slots?: AjoSlot[];
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
  adminId: string | null;
  adminRole: AdminRole | null;
}

export type SearchUsersResponse = AdminUser[];

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

export interface UpdateAdminPermissionsRequest {
  adminId: string;
  role: AdminRole;
  selectedPages: string[];
}

export interface RemoveUserAsAdminRequest {
  userId: string;
  adminId: string;
}

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
  pageKeys: string[];
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

export interface GetAjoGroupsResponse {
  data: AjoGroup[];
  meta: PaginationMeta;
}

export interface AjoUser {
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

export interface AjoMember {
  id: string;
  ajoId?: string;
  userId?: string;

  user?: AjoUser | null;

  contributionAmount?: number | string | null;
  totalContributionPaid?: number | string | null;
  totalRounds?: number | string | null;
  totalRoundsPaid?: number | string | null;

  hands?: number | null;
  status?: string | null;

  linkedAccountId?: string | null;
  linkedAccountType?: string | null;
  linkedAccount?: unknown;

  businessName?: string | null;
  cacNumber?: string | null;
  bankStatementURL?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AjoCycle {
  id: string;
  cycleNumber: number;
  status: string;
  startDate?: string;
  endDate?: string;
  amount?: number;
  payoutAmount?: number;
}

export interface AjoContribution {
  id: string;
  memberName?: string;
  cycleNumber?: number;
  amount: number;
  status: string;
  createdAt?: string;
}

export interface AjoSlot {
  id: string;
  slotNumber: number;
  memberName?: string;
  amount?: number;
  status: string;
}

export interface AjoGroupDetails extends AjoGroup {
  ajoMembers: AjoMember[];
  ajoCycles: AjoCycle[];
  ajoContributions: AjoContribution[];
  slots: AjoSlot[];
}

export interface GetAjoGroupDetailsResponse {
  data: AjoGroupDetails;
}

export interface AdasheUser {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

export interface AdasheAdmin {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

export interface AdasheCycle {
  id: string;
  groupId: string;
  adasheMemberId: string;

  contributionAmount: number;
  amountContributed: number;
  cycleCount: number;

  startDate: string;
  endDate: string;

  status: string;

  createdAt: string;
  updatedAt: string;

  adasheMember?: AdasheMember;
}

export interface AdasheContribution {
  id: string;

  adasheId: string;
  adasheMemberId: string;
  adasheCycleId: string;

  amount: number;
  status: string;

  paidAt?: string | null;

  transactionId?: string | null;
  reference?: string | null;

  createdAt: string;
  updatedAt: string;

  adasheMember?: AdasheMember;
  adasheCycle?: AdasheCycle;
}

export interface AdasheMember {
  id: string;

  groupId: string;
  userId?: string | null;

  name?: string | null;
  phone?: string | null;

  status: string;

  user?: AdasheUser | null;

  adasheCycles?: AdasheCycle[];
  adasheContributions?: AdasheContribution[];
}

export interface AdasheGroup {
  id: string;

  name: string;
  description?: string | null;

  maxGroupSize?: number | null;

  privacy: string;

  minAmount?: number | null;

  adminId: string;

  admin?: AdasheAdmin;

  members?: AdasheMember[];

  adasheCycles?: AdasheCycle[];

  adasheContributions?: AdasheContribution[];

  createdAt: string;
  updatedAt: string;
}

export interface AdasheGroupsResponse {
  data: AdasheGroup[];

  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdasheGroupDetailsResponse {
  data: AdasheGroup;
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
    getAjoGroupDetails: builder.query<GetAjoGroupDetailsResponse, string>({
      query: (id) => `/admin-dashboard/ajo-groups/${id}`,
      providesTags: (_result, _error, id) => [{ type: "AjoGroups", id }],
    }),
    getAjoGroups: builder.query<
      GetAjoGroupsResponse,
      { page: number; limit: number }
    >({
      query: ({ page, limit }) => ({
        url: `/admin-dashboard/ajo-groups?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["AjoGroups"],
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
    updateAdminPermissions: builder.mutation<
      any,
      UpdateAdminPermissionsRequest
    >({
      query: ({ adminId, role, selectedPages }) => ({
        url: `/admin-dashboard/admins/${adminId}/permissions`,
        method: "PATCH",
        body: { role, selectedPages },
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
    getAdasheGroups: builder.query<AdasheGroupsResponse, { page: number; limit: number }>({
      query: ({ page, limit }) => ({
        url: `/admin-dashboard/adashe-groups?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["AdasheGroups"],
    }),
    getAdasheGroupDetails: builder.query<
      AdasheGroupDetailsResponse,
      { groupId: string }
    >({
      query: ({ groupId }) => ({
        url: `/admin-dashboard/adashe-groups/${groupId}`,
        method: "GET",
      }),
      providesTags: ["AdasheGroups"],
    }), 
  }),
});

export const {
  useGetPendingAjoApplicationsQuery,
  useHandleAjoApplicationMutation,
  useGetAjoGroupsQuery,
  useGetAjoGroupDetailsQuery,
  useGetAppStatsQuery,
  useGetLedgerSummaryQuery,
  useGetLedgerEntriesQuery,
  useGetUsersQuery,
  useSearchUsersQuery,
  useGetAdminPermissionsQuery,
  useMakeUserAdminMutation,
  useRemoveUserAsAdminMutation,
  useUpdateAdminPermissionsMutation,
  useGetAdasheGroupsQuery,
  useGetAdasheGroupDetailsQuery,
} = adminApi;
