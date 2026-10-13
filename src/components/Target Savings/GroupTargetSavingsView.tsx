"use client";

import React, { useMemo, useState } from "react";
import {
  HiOutlineSearch,
  HiOutlineExternalLink,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineCurrencyDollar,
  HiOutlineCalendar,
  HiOutlineShieldCheck,
  HiOutlineRefresh,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi";

import { useGetTargetSavingsQuery } from "@/services/padiApi/adminApi";

type SavingsStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "PAUSED"
  | "CANCELLED"
  | string;

type GroupTargetSavings = {
  id: string;
  name?: string | null;
  status?: SavingsStatus | null;
  targetAmount?: string | number | bigint | null;
  balance?: string | number | bigint | null;
  contributionAmount?: string | number | bigint | null;
  frequency?: string | null;
  currency?: string | null;
  targetDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  userId?: string | null;
  user?: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  groupSize?: number | null;
  members?: unknown[];
  description?: string | null;
};

type StatusFilter = "ALL" | "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED";

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "All statuses", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Paused", value: "PAUSED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-100",
  COMPLETED: "bg-blue-50 text-blue-700 border-blue-100",
  PAUSED: "bg-amber-50 text-amber-700 border-amber-100",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-100",
};

const formatMoney: any = (
  value?: string | number | bigint | null,
  currency = "NGN",
) => {
  if (value === undefined || value === null || value === "") {
    return currency === "NGN" ? "₦0.00" : `${currency} 0.00`;
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return currency === "NGN" ? "₦0.00" : `${currency} 0.00`;
  }

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 100);
  } catch {
    return `${currency} ${(amount / 100).toFixed(2)}`;
  }
};

const formatStatus = (status?: string | null) => {
  if (!status) return "Unknown";

  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatFrequency = (frequency?: string | null) => {
  if (!frequency) return "Not specified";

  return frequency
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatDate = (value?: string | null) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getStatusClass = (status?: string | null) =>
  STATUS_STYLES[status ?? ""] ??
  "bg-gray-50 text-gray-600 border-gray-100";

const getProgress = (item: GroupTargetSavings) => {
  const target = Number(item.targetAmount);
  const balance = Number(item.balance);

  if (!Number.isFinite(target) || target <= 0) return 0;
  if (!Number.isFinite(balance) || balance <= 0) return 0;

  return Math.min(100, Math.max(0, (balance / target) * 100));
};

const getRemainingAmount = (item: GroupTargetSavings) => {
  const target = Number(item.targetAmount);
  const balance = Number(item.balance);

  if (!Number.isFinite(target) || !Number.isFinite(balance)) return 0;

  return Math.max(0, target - balance);
};

const getFullName = (user?: GroupTargetSavings["user"]) => {
  if (!user) return "Unknown user";

  const name = [user.first_name, user.last_name]
    .filter((part) => part?.trim())
    .join(" ")
    .trim();

  return name || "Unknown user";
};

const getInitials = (user?: GroupTargetSavings["user"]) => {
  const name = getFullName(user);

  if (name === "Unknown user") return "G";

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

function StatusBadge({ status }: { status?: string | null }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
        status,
      )}`}
    >
      {formatStatus(status)}
    </span>
  );
}

export default function GroupTargetSavingsView() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetTargetSavingsQuery({
    page,
    limit,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  /*
   * IMPORTANT:
   * This currently uses the target savings list hook you provided.
   * Replace it with your group target savings endpoint once available.
   */
  const groups = (data?.data ?? []) as GroupTargetSavings[];

  const meta = data?.meta ?? {
    page,
    limit,
    total: 0,
    totalPages: 0,
  };

  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return groups;

    return groups.filter((group) => {
      const values = [
        group.id,
        group.name,
        group.status,
        group.frequency,
        group.currency,
        group.userId,
        group.user?.first_name,
        group.user?.last_name,
        group.user?.email,
        group.user?.phone,
      ];

      return values.some((value) =>
        String(value ?? "").toLowerCase().includes(query),
      );
    });
  }, [groups, searchQuery]);

  const summary = useMemo(() => {
    return groups.reduce(
      (result, group) => {
        result.total += 1;

        if (group.status === "ACTIVE") result.active += 1;
        if (group.status === "COMPLETED") result.completed += 1;
        if (group.status === "PAUSED") result.paused += 1;
        if (group.status === "CANCELLED") result.cancelled += 1;

        const balance = Number(group.balance);
        const target = Number(group.targetAmount);

        if (Number.isFinite(balance)) result.balance += balance;
        if (Number.isFinite(target)) result.target += target;

        return result;
      },
      {
        total: 0,
        active: 0,
        completed: 0,
        paused: 0,
        cancelled: 0,
        balance: 0,
        target: 0,
      },
    );
  }, [groups]);

  const overallProgress =
    summary.target > 0
      ? Math.min(100, Math.max(0, (summary.balance / summary.target) * 100))
      : 0;

  const selectedGroup: any = groups.find((group) => group.id === selectedGroupId);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleStatus = (value: string) => {
    setStatusFilter(value as StatusFilter);
    setPage(1);
  };

  const hasPreviousPage = page > 1;
  const hasNextPage = page < meta.totalPages;

  const previousPage = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const nextPage = () => {
    setPage((current) =>
      Math.min(Math.max(meta.totalPages, 1), current + 1),
    );
  };

  const errorMessage =
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    (error as { data?: { message?: string } }).data?.message
      ? String(
          (error as { data?: { message?: string } }).data?.message,
        )
      : "Something went wrong while fetching group target savings.";

  return (
    <div className="relative space-y-6 font-satoshi">
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0.9; }
          to { transform: translateX(0); opacity: 1; }
        }
        .drawer-animate {
          animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* PAGE HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[#181B25]">
              Group Target Savings
            </h2>

            {!isLoading && !isError && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#68123D]/15 bg-[#68123D]/10 px-3.5 py-1.5 text-xs font-semibold text-[#68123D]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#68123D]" />
                {meta.total.toLocaleString("en-NG")} Group
                {meta.total === 1 ? "" : "s"}
              </span>
            )}
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Monitor group savings goals, member activity, contributions,
            balances, and target completion across the platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white/60 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-white disabled:opacity-60 sm:self-auto"
        >
          <HiOutlineRefresh
            size={16}
            className={isFetching ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Groups"
          value={summary.total.toLocaleString("en-NG")}
          description="Groups on this page"
          icon={<HiOutlineUsers size={19} />}
          iconClass="bg-[#68123D]/10 text-[#68123D]"
        />

        <SummaryCard
          label="Active Groups"
          value={summary.active.toLocaleString("en-NG")}
          description="Currently in progress"
          icon={<HiOutlineRefresh size={19} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <SummaryCard
          label="Completed Groups"
          value={summary.completed.toLocaleString("en-NG")}
          description="Savings goals reached"
          icon={<HiOutlineCheckCircle size={19} />}
          iconClass="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          label="Total Saved"
          value={formatMoney(summary.balance)}
          description="Current page balance"
          icon={<HiOutlineCurrencyDollar size={19} />}
          iconClass="bg-amber-50 text-amber-600"
        />
      </div>

      {/* PROGRESS OVERVIEW */}

      <div className="rounded-2xl border border-white/70 bg-white/50 p-5 shadow-sm backdrop-blur-lg sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-semibold text-[#181B25]">
              Group Savings Progress
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Compare group balances with their target amounts.
            </p>
          </div>

          <p className="text-xl font-bold text-[#68123D]">
            {overallProgress.toFixed(1)}%
          </p>
        </div>

        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-[#68123D] transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        <div className="mt-3 flex flex-col justify-between gap-1 text-xs text-gray-500 sm:flex-row">
          <span>Saved: {formatMoney(summary.balance)}</span>
          <span>Target: {formatMoney(summary.target)}</span>
        </div>
      </div>

      {/* SEARCH AND FILTER TOOLBAR */}

      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/45 p-4 shadow-sm backdrop-blur-md sm:flex-row">
        <div className="relative w-full sm:max-w-md sm:flex-1">
          <HiOutlineSearch
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Search group, owner, email or ID..."
            className="w-full rounded-xl border border-gray-200/50 bg-white/40 py-2.5 pl-10 pr-4 text-sm text-gray-800 shadow-inner outline-none transition placeholder:text-gray-400 hover:bg-white/60 focus:border-[#68123D]/40 focus:bg-white/80 focus:ring-4 focus:ring-[#68123D]/5"
          />
        </div>

        <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
          <select
            value={statusFilter}
            onChange={(event) => handleStatus(event.target.value)}
            aria-label="Filter groups by status"
            className="min-w-36 cursor-pointer rounded-xl border border-gray-200/50 bg-white/50 p-2.5 text-xs font-medium text-gray-700 outline-none transition hover:bg-white focus:border-[#68123D]/40"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={limit}
            onChange={(event) => {
              setLimit(Number(event.target.value));
              setPage(1);
            }}
            aria-label="Groups per page"
            className="cursor-pointer rounded-xl border border-gray-200/50 bg-white/50 p-2.5 text-xs font-medium text-gray-700 outline-none transition hover:bg-white focus:border-[#68123D]/40"
          >
            {[5, 10, 20, 50].map((value) => (
              <option key={value} value={value}>
                {value} per page
              </option>
            ))}
          </select>
        </div>
      </div>

      {(searchQuery || statusFilter !== "ALL") && (
        <div className="-mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">Active filters:</span>

          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearch("")}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/60 px-3 py-1.5 text-xs text-gray-600 transition hover:bg-white"
            >
              Search: {searchQuery}
              <HiOutlineX size={13} />
            </button>
          )}

          {statusFilter !== "ALL" && (
            <button
              type="button"
              onClick={() => handleStatus("ALL")}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/60 px-3 py-1.5 text-xs text-gray-600 transition hover:bg-white"
            >
              Status: {formatStatus(statusFilter)}
              <HiOutlineX size={13} />
            </button>
          )}
        </div>
      )}

      {/* ERROR */}

      {isError && (
        <ErrorState
          title="Failed to load group target savings"
          description={errorMessage}
          onRetry={() => refetch()}
        />
      )}

      {/* DESKTOP TABLE */}

      <div className="hidden overflow-hidden rounded-2xl border border-white/70 bg-white/50 shadow-sm backdrop-blur-lg lg:block">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100/50 px-6 py-4">
          <div>
            <h3 className="font-semibold text-[#181B25]">
              Group Savings Plans
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Select a group to review its available details.
            </p>
          </div>

          {isFetching && !isLoading && (
            <span className="text-xs text-gray-400">Updating records...</span>
          )}
        </div>

        {isLoading ? (
          <LoadingState text="Loading group target savings..." />
        ) : !isError && filteredGroups.length === 0 ? (
          <EmptyState text="No groups match your current search or filters." />
        ) : !isError ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-100/50 bg-gray-50/30 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    <th className="px-5 py-4">Group</th>
                    <th className="px-5 py-4">Group Owner</th>
                    <th className="px-5 py-4">Target Amount</th>
                    <th className="px-5 py-4">Balance / Progress</th>
                    <th className="px-5 py-4">Contribution</th>
                    <th className="px-5 py-4">Frequency</th>
                    <th className="px-5 py-4">Target Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100/30 text-sm">
                  {filteredGroups.map((group) => {
                    const progress = getProgress(group);

                    return (
                      <tr
                        key={group.id}
                        className="group transition-colors hover:bg-white/45"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#68123D]/10 bg-[#68123D]/10 text-[#68123D]">
                              <HiOutlineUsers size={17} />
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-44 truncate text-sm font-semibold text-gray-800">
                                {group.name || "Untitled group"}
                              </p>
                              <p
                                title={group.id}
                                className="mt-1 max-w-44 truncate font-mono text-[10px] text-gray-400"
                              >
                                {group.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex min-w-44 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#68123D]/10 bg-[#68123D]/10 text-xs font-bold text-[#68123D]">
                              {getInitials(group.user)}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-48 truncate text-xs font-semibold text-gray-800">
                                {getFullName(group.user)}
                              </p>
                              <p className="mt-1 max-w-48 truncate text-[10px] text-gray-400">
                                {group.user?.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="text-xs font-bold text-gray-800">
                            {formatMoney(group.targetAmount, group.currency)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="whitespace-nowrap text-xs font-bold text-gray-800">
                            {formatMoney(group.balance, group.currency)}
                          </p>

                          <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-[#68123D]"
                              style={{ width: `${progress}%` }}
                            />
                          </div>

                          <p className="mt-1 text-[10px] text-gray-400">
                            {progress.toFixed(1)}% saved
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="text-xs font-medium text-gray-700">
                            {formatMoney(
                              group.contributionAmount,
                              group.currency,
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-xs font-medium text-gray-700">
                            {formatFrequency(group.frequency)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="whitespace-nowrap text-xs font-medium text-gray-700">
                            {formatDate(group.targetDate)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={group.status} />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedGroupId(group.id)}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800"
                          >
                            View Details
                            <HiOutlineExternalLink size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              limit={limit}
              total={meta.total}
              totalPages={meta.totalPages}
              itemCount={filteredGroups.length}
              onPrevious={previousPage}
              onNext={nextPage}
            />
          </>
        ) : null}
      </div>

      {/* MOBILE CARDS */}

      <div className="space-y-4 lg:hidden">
        <div className="flex items-center justify-between gap-3 px-1">
          <div>
            <h3 className="font-semibold text-[#181B25]">Group Savings Plans</h3>
            <p className="mt-1 text-xs text-gray-500">
              {meta.total.toLocaleString("en-NG")} total records
            </p>
          </div>

          {isFetching && !isLoading && (
            <span className="text-xs text-gray-400">Updating...</span>
          )}
        </div>

        {isLoading ? (
          <LoadingState text="Loading group target savings..." />
        ) : !isError && filteredGroups.length === 0 ? (
          <EmptyState text="No groups match your current search or filters." />
        ) : !isError ? (
          <>
            <div className="space-y-4">
              {filteredGroups.map((group: any) => {
                const progress = getProgress(group);

                return (
                  <article
                    key={group.id}
                    className="space-y-4 rounded-2xl border border-white/70 bg-white/60 p-5 shadow-sm backdrop-blur-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#68123D]/10 bg-[#68123D]/10 text-[#68123D]">
                          <HiOutlineUsers size={19} />
                        </div>

                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-semibold text-gray-800">
                            {group.name || "Untitled group"}
                          </h4>
                          <p className="mt-1 truncate text-[10px] text-gray-400">
                            ID: {group.id}
                          </p>
                        </div>
                      </div>

                      <StatusBadge status={group.status} />
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-gray-100/70 bg-white/50 p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#68123D]/10 text-xs font-bold text-[#68123D]">
                        {getInitials(group.user)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-gray-800">
                          {getFullName(group.user)}
                        </p>
                        <p className="mt-1 truncate text-[10px] text-gray-400">
                          {group.user?.email || "No email provided"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-y border-gray-100/70 py-4">
                      <DetailItem
                        label="Target Amount"
                        value={formatMoney(group.targetAmount, group.currency)}
                        highlight
                      />
                      <DetailItem
                        label="Current Balance"
                        value={formatMoney(group.balance, group.currency)}
                        highlight
                      />
                      <DetailItem
                        label="Contribution"
                        value={formatMoney(
                          group.contributionAmount,
                          group.currency,
                        )}
                      />
                      <DetailItem
                        label="Frequency"
                        value={formatFrequency(group.frequency)}
                      />
                      <DetailItem
                        label="Target Date"
                        value={formatDate(group.targetDate)}
                      />
                      <DetailItem
                        label="Members"
                        value={
                          group.groupSize !== undefined &&
                          group.groupSize !== null
                            ? String(group.groupSize)
                            : "N/A"
                        }
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-gray-500">
                          Savings progress
                        </span>
                        <span className="text-xs font-bold text-[#68123D]">
                          {progress.toFixed(1)}%
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-[#68123D] transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <p className="mt-2 text-xs text-gray-500">
                        {formatMoney(
                          getRemainingAmount(group),
                          group.currency,
                        )}{" "}
                        remaining to reach target
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedGroupId(group.id)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800"
                    >
                      View Group Details
                      <HiOutlineExternalLink size={14} />
                    </button>
                  </article>
                );
              })}
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/50 shadow-sm">
              <Pagination
                page={page}
                limit={limit}
                total={meta.total}
                totalPages={meta.totalPages}
                itemCount={filteredGroups.length}
                onPrevious={previousPage}
                onNext={nextPage}
              />
            </div>
          </>
        ) : null}
      </div>

      {/* DETAILS DRAWER */}

      {selectedGroupId && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/15 backdrop-blur-md"
            onClick={() => setSelectedGroupId(null)}
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Group target savings details"
            className="drawer-animate fixed bottom-4 right-4 top-4 z-50 flex w-[calc(100%-2rem)] flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/95 text-sm text-[#181B25] shadow-[0_24px_60px_rgba(0,0,0,0.12)] backdrop-blur-2xl md:w-full md:max-w-2xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-gray-100/50 p-5 sm:p-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#68123D]/10 text-[#68123D]">
                  <HiOutlineUsers size={21} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">
                    Group Details
                  </h2>
                  <p className="mt-1 truncate font-mono text-[10px] text-gray-400 sm:text-xs">
                    {selectedGroupId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedGroupId(null)}
                aria-label="Close group details"
                className="shrink-0 rounded-full bg-gray-100/60 p-2.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <HiOutlineX size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
              {!selectedGroup ? (
                <EmptyState text="The selected group is not on the current page. Close the drawer and locate the group again." />
              ) : (
                <>
                  <div className="rounded-2xl border border-[#68123D]/10 bg-[#68123D]/5 p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#68123D]/10 text-[#68123D]">
                        <HiOutlineUsers size={25} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words text-lg font-bold text-gray-900">
                            {selectedGroup.name || "Untitled group"}
                          </h3>
                          <StatusBadge status={selectedGroup.status} />
                        </div>

                        <p className="mt-2 text-xs leading-relaxed text-gray-500">
                          Group target savings overview.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4">
                      <DetailItem
                        label="Target Amount"
                        value={formatMoney(
                          selectedGroup.targetAmount,
                          selectedGroup.currency,
                        )}
                        highlight
                      />
                      <DetailItem
                        label="Current Balance"
                        value={formatMoney(
                          selectedGroup.balance,
                          selectedGroup.currency,
                        )}
                        highlight
                      />
                      <DetailItem
                        label="Contribution"
                        value={formatMoney(
                          selectedGroup.contributionAmount,
                          selectedGroup.currency,
                        )}
                      />
                      <DetailItem
                        label="Remaining Amount"
                        value={formatMoney(
                          getRemainingAmount(selectedGroup),
                          selectedGroup.currency,
                        )}
                      />
                    </div>

                    <div className="mt-5 border-t border-[#68123D]/10 pt-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-gray-500">
                          Goal Progress
                        </span>
                        <span className="text-sm font-bold text-[#68123D]">
                          {getProgress(selectedGroup).toFixed(1)}%
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/80">
                        <div
                          className="h-full rounded-full bg-[#68123D]"
                          style={{
                            width: `${getProgress(selectedGroup)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <DetailSection
                    icon={<HiOutlineUser size={16} />}
                    title="Group Owner"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#68123D]/10 bg-[#68123D]/10 text-sm font-bold text-[#68123D]">
                        {getInitials(selectedGroup.user)}
                      </div>

                      <div className="min-w-0">
                        <h3 className="break-words text-sm font-bold text-gray-900">
                          {getFullName(selectedGroup.user)}
                        </h3>
                        <p className="mt-1 break-all text-xs text-gray-500">
                          {selectedGroup.user?.email || "No email provided"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {selectedGroup.user?.phone || "No phone provided"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 border-t border-gray-100/70 pt-3 sm:grid-cols-2">
                      <DetailItem
                        label="Owner User ID"
                        value={selectedGroup.userId || "N/A"}
                      />
                      <DetailItem
                        label="Group ID"
                        value={selectedGroup.id}
                      />
                    </div>
                  </DetailSection>

                  <DetailSection
                    icon={<HiOutlineCurrencyDollar size={16} />}
                    title="Savings Goal"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <DetailItem
                        label="Target Amount"
                        value={formatMoney(
                          selectedGroup.targetAmount,
                          selectedGroup.currency,
                        )}
                        highlight
                      />
                      <DetailItem
                        label="Current Balance"
                        value={formatMoney(
                          selectedGroup.balance,
                          selectedGroup.currency,
                        )}
                      />
                      <DetailItem
                        label="Contribution Amount"
                        value={formatMoney(
                          selectedGroup.contributionAmount,
                          selectedGroup.currency,
                        )}
                      />
                      <DetailItem
                        label="Frequency"
                        value={formatFrequency(selectedGroup.frequency)}
                      />
                      <DetailItem
                        label="Group Size"
                        value={
                          selectedGroup.groupSize !== undefined &&
                          selectedGroup.groupSize !== null
                            ? String(selectedGroup.groupSize)
                            : "N/A"
                        }
                      />
                      <DetailItem
                        label="Currency"
                        value={selectedGroup.currency || "NGN"}
                      />
                    </div>
                  </DetailSection>

                  <DetailSection
                    icon={<HiOutlineCalendar size={16} />}
                    title="Group Timeline"
                  >
                    <DetailRow
                      label="Created"
                      value={formatDateTime(selectedGroup.createdAt)}
                    />
                    <DetailRow
                      label="Last Updated"
                      value={formatDateTime(selectedGroup.updatedAt)}
                    />
                    <DetailRow
                      label="Target Date"
                      value={formatDate(selectedGroup.targetDate)}
                    />
                    <DetailRow
                      label="Group Status"
                      value={formatStatus(selectedGroup.status)}
                    />
                  </DetailSection>

                  <DetailSection
                    icon={<HiOutlineShieldCheck size={16} />}
                    title="Record Information"
                  >
                    <DetailRow label="Group ID" value={selectedGroup.id} />
                    <DetailRow
                      label="Owner User ID"
                      value={selectedGroup.userId}
                    />
                    <DetailRow
                      label="Created At"
                      value={formatDateTime(selectedGroup.createdAt)}
                    />
                    <DetailRow
                      label="Updated At"
                      value={formatDateTime(selectedGroup.updatedAt)}
                    />
                  </DetailSection>
                </>
              )}
            </div>

            <div className="border-t border-gray-100/50 bg-white/30 p-4 backdrop-blur-md sm:p-6">
              <button
                type="button"
                onClick={() => setSelectedGroupId(null)}
                className="w-full rounded-2xl bg-neutral-900 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
              >
                Close Details
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

/* ================================================================
   REUSABLE COMPONENTS
================================================================ */

function SummaryCard({
  label,
  value,
  description,
  icon,
  iconClass,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/50 p-5 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className={`rounded-xl p-2.5 ${iconClass}`}>{icon}</span>
      </div>

      <p className="mt-4 break-words text-2xl font-bold text-[#181B25]">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </div>
  );
}

function DetailSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-gray-100/60 bg-white/50 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
        <div className="rounded-lg bg-[#68123D]/5 p-1.5 text-[#68123D]">
          {icon}
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}

function DetailItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-0">
      <span className="mb-0.5 block text-[11px] font-medium text-gray-400">
        {label}
      </span>
      <span
        className={`break-words text-sm ${
          highlight
            ? "font-bold text-gray-950"
            : "font-semibold text-gray-800"
        }`}
      >
        {value || "N/A"}
      </span>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100/50 py-3 last:border-b-0">
      <span className="shrink-0 text-xs font-medium text-gray-500 sm:text-sm">
        {label}
      </span>
      <span className="min-w-0 break-words text-right text-xs font-semibold text-gray-800 sm:text-sm">
        {value || "N/A"}
      </span>
    </div>
  );
}

function Pagination({
  page,
  limit,
  total,
  totalPages,
  itemCount,
  onPrevious,
  onNext,
}: {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  itemCount: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min((page - 1) * limit + itemCount, total);
  const pages = Math.max(totalPages, 1);

  return (
    <div className="flex flex-col justify-between gap-3 border-t border-gray-100/50 bg-white/20 px-4 py-4 text-xs font-medium text-gray-500 sm:flex-row sm:items-center sm:px-6">
      <span>
        Showing <strong className="text-gray-700">{start}</strong> to{" "}
        <strong className="text-gray-700">{end}</strong> of{" "}
        <strong className="text-gray-700">{total}</strong> records
      </span>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <span className="mr-2 whitespace-nowrap">
          Page {page} of {pages}
        </span>

        <button
          type="button"
          onClick={onPrevious}
          disabled={page <= 1}
          aria-label="Previous page"
          className="rounded-xl border border-gray-200/50 bg-white/50 p-2 text-gray-600 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <HiOutlineChevronLeft size={16} />
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages || totalPages === 0}
          aria-label="Next page"
          className="rounded-xl border border-gray-200/50 bg-white/50 p-2 text-gray-600 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <HiOutlineChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function LoadingState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/60 bg-white/45 px-4 py-20 shadow-sm backdrop-blur-md">
      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#68123D]" />
      <p className="text-sm font-medium text-gray-500">{text}</p>
    </div>
  );
}

function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100/70 bg-red-50/30 px-4 py-16 text-center shadow-sm backdrop-blur-md">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
        <HiOutlineX size={22} />
      </div>

      <h3 className="mb-1 text-sm font-semibold text-red-900">{title}</h3>

      <p className="mb-5 max-w-md text-xs leading-5 text-red-700/80">
        {description}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-xl bg-[#68123D] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#68123D]/95"
      >
        <HiOutlineRefresh size={14} />
        Retry Connection
      </button>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-12 text-center">
      <HiOutlineExclamationCircle
        size={24}
        className="mx-auto mb-2 text-gray-300"
      />
      <p className="text-xs leading-5 text-gray-400">{text}</p>
    </div>
  );
}
