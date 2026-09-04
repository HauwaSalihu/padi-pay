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

export interface AppStats {
  signedUpUsers: number;
  activeAjoGroups: number;
  ajoGroupsWaitingActivation: number;
  pendingUsers: number;
}

export interface AppStatsResponse {
  status: string;
  data: AppStats;
}

export interface AdminUser {
  id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email: string;
  phone?: string | null;
  isPadipayAdmin: boolean;
  is_active: boolean;
}

export interface SearchUsersResponse {
  data: AdminUser[];
}

export interface User {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone: string;
  isPadipayAdmin: boolean;
  is_active: boolean;
}

export interface UsersResponse {
  data: User[];
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

    searchUsers: builder.query<SearchUsersResponse, { query: string }>({
      query: ({ query }) => ({
        url: `/admin-dashboard/users/search?q=${encodeURIComponent(query)}`,
        method: "GET",
      }),
    }),

    makeUserAdmin: builder.mutation<
      {
        message: string;
        data: AdminUser;
      },
      { userId: string }
    >({
      query: ({ userId }) => ({
        url: `/admin-dashboard/users/${userId}/make-admin`,
        method: "PUT",
      }),
    }),

    removeUserAsAdmin: builder.mutation<
      {
        message: string;
        data: AdminUser;
      },
      { userId: string }
    >({
      query: ({ userId }) => ({
        url: `/admin-dashboard/users/${userId}/remove-admin`,
        method: "PUT",
      }),
    }),

    getUsers: builder.query<UsersResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/admin-dashboard/users?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["AjoApplications"],
    }),

    getAjoGroups: builder.query<
      {
        data: AjoGroup[];
        meta: PaginationMeta;
      },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/admin-dashboard/ajo-groups?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["AjoGroups"],
    }),
  }),
});

export const {
  useGetPendingAjoApplicationsQuery,
  useHandleAjoApplicationMutation,
  useGetAppStatsQuery,
  useSearchUsersQuery,
  useMakeUserAdminMutation,
  useRemoveUserAsAdminMutation,
  useGetUsersQuery,
  useGetAjoGroupsQuery,
} = adminApi;
