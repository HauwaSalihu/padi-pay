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
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineArrowLeft,
  HiOutlineShieldCheck,
  HiOutlineCash,
  HiOutlineInformationCircle,
  HiOutlineRefresh,
} from "react-icons/hi";

import {
  useGetTargetSavingsQuery,
  useGetTargetSavingsDetailsQuery,
  TargetSavings,
  TargetSavingsStatus,
} from "@/services/padiApi/adminApi";

/* ================================================================
   TYPES AND CONSTANTS
================================================================ */

type StatusFilter = "ALL" | TargetSavingsStatus;

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

/* ================================================================
   FORMATTERS
================================================================ */

/**
 * Monetary values are stored in kobo.
 * Example: 100000 kobo = ₦1,000.00.
 */
const formatMoney = (
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

  const nairaAmount = amount / 100;

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(nairaAmount);
  } catch {
    return `${currency} ${nairaAmount.toFixed(2)}`;
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

const getFullName = (user?: TargetSavings["user"] | null) => {
  if (!user) return "Unknown user";

  const name = [user.first_name, user.last_name]
    .filter((part) => part?.trim())
    .join(" ")
    .trim();

  return name || "Unknown user";
};

const getInitials = (user?: TargetSavings["user"] | null) => {
  const name = getFullName(user);

  if (name === "Unknown user") return "U";

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const getStatusClass = (status?: string | null) => {
  return (
    STATUS_STYLES[status ?? ""] ?? "bg-gray-50 text-gray-600 border-gray-100"
  );
};

/* ================================================================
   SAVINGS HELPERS
================================================================ */

const getProgress = (savings: TargetSavings) => {
  const target = Number(savings.targetAmount);
  const balance = Number(savings.balance);

  if (!Number.isFinite(target) || target <= 0) return 0;
  if (!Number.isFinite(balance) || balance <= 0) return 0;

  return Math.min(100, Math.max(0, (balance / target) * 100));
};

const getRemainingAmount = (savings: TargetSavings) => {
  const target = Number(savings.targetAmount);
  const balance = Number(savings.balance);

  if (!Number.isFinite(target) || !Number.isFinite(balance)) return 0;

  return Math.max(0, target - balance);
};

const getDaysRemaining = (targetDate?: string | null) => {
  if (!targetDate) return null;

  const target = new Date(targetDate);

  if (Number.isNaN(target.getTime())) return null;

  target.setHours(0, 0, 0, 0);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const getTargetDateLabel = (savings: TargetSavings) => {
  if (savings.status === "COMPLETED") return "Goal completed";
  if (savings.status === "CANCELLED") return "Cancelled";
  if (savings.status === "PAUSED") return "Paused";
  if (!savings.targetDate) return "No target date";

  const days = getDaysRemaining(savings.targetDate);

  if (days === null) return "Date unavailable";
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "1 day remaining";

  return `${days} days remaining`;
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: { message?: string } }).data;

    if (data?.message) {
      return Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message;
    }
  }

  if (typeof error === "object" && error !== null && "error" in error) {
    const message = (error as { error?: string }).error;

    if (message) return message;
  }

  return "Something went wrong while fetching target savings.";
};

/* ================================================================
   STATUS BADGE
================================================================ */

function StatusBadge({ status }: { status?: string | null }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${getStatusClass(
        status,
      )}`}
    >
      {formatStatus(status)}
    </span>
  );
}

/* ================================================================
   MAIN COMPONENT
================================================================ */

export default function IndividualTargetSavingsView() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedSavingsId, setSelectedSavingsId] = useState<string | null>(
    null,
  );

  /* ================================================================
     LIST API
  ================================================================ */

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetTargetSavingsQuery({
      page,
      limit,
      status: statusFilter === "ALL" ? undefined : statusFilter,
    });

  /* ================================================================
     DETAILS API
  ================================================================ */

  const {
    data: detailsResponse,
    isLoading: isDetailsLoading,
    isFetching: isDetailsFetching,
    isError: isDetailsError,
    error: detailsError,
    refetch: refetchDetails,
  } = useGetTargetSavingsDetailsQuery(selectedSavingsId ?? "", {
    skip: !selectedSavingsId,
  });

  const savings = data?.data ?? [];

  const meta = data?.meta ?? {
    page,
    limit,
    total: 0,
    totalPages: 0,
  };

  const selectedSavings = detailsResponse?.data;

  /* ================================================================
   SEARCH AND SUMMARY
================================================================ */

  const filteredSavings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return savings.filter((item) => {
      // Apply status filter locally as well.
      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      // Apply search filter.
      const searchableValues = [
        item.id,
        item.name,
        item.user?.first_name,
        item.user?.last_name,
        item.user?.email,
        item.user?.phone,
        item.status,
        item.frequency,
        item.currency,
      ];

      const matchesSearch =
        !normalizedQuery ||
        searchableValues.some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(normalizedQuery),
        );

      return matchesStatus && matchesSearch;
    });
  }, [savings, searchQuery, statusFilter]);

  const summary = useMemo(() => {
    return savings.reduce(
      (accumulator, item) => {
        const balance = Number(item.balance);
        const target = Number(item.targetAmount);

        accumulator.totalPlans += 1;

        if (item.status === "ACTIVE") accumulator.active += 1;
        if (item.status === "COMPLETED") accumulator.completed += 1;
        if (item.status === "PAUSED") accumulator.paused += 1;
        if (item.status === "CANCELLED") accumulator.cancelled += 1;

        if (Number.isFinite(balance)) {
          accumulator.totalBalance += balance;
        }

        if (Number.isFinite(target)) {
          accumulator.totalTarget += target;
        }

        return accumulator;
      },
      {
        totalPlans: 0,
        active: 0,
        completed: 0,
        paused: 0,
        cancelled: 0,
        totalBalance: 0,
        totalTarget: 0,
      },
    );
  }, [savings]);

  const overallProgress =
    summary.totalTarget > 0
      ? Math.min(
          100,
          Math.max(0, (summary.totalBalance / summary.totalTarget) * 100),
        )
      : 0;

  /* ================================================================
     HANDLERS
  ================================================================ */

  const openDetails = (id: string) => {
    setSelectedSavingsId(id);
  };

  const closeDetails = () => {
    setSelectedSavingsId(null);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as StatusFilter);
    setPage(1);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const goToPreviousPage = () => {
    setPage((currentPage) => Math.max(1, currentPage - 1));
  };

  const goToNextPage = () => {
    setPage((currentPage) =>
      Math.min(Math.max(meta.totalPages, 1), currentPage + 1),
    );
  };

  const hasPreviousPage = page > 1;
  const hasNextPage = page < meta.totalPages;

  /* ================================================================
     RENDER
  ================================================================ */

  return (
    <div className="relative min-w-0 w-full max-w-full space-y-6 overflow-x-clip font-satoshi">
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0.9;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .drawer-animate {
          animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* ============================================================
          PAGE HEADING
      ============================================================ */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[#181B25]">
              Individual Target Savings
            </h2>

            {!isLoading && !isError && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#68123D]/15 bg-[#68123D]/10 px-3.5 py-1.5 text-xs font-semibold text-[#68123D]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#68123D]" />
                {meta.total.toLocaleString("en-NG")} Plan
                {meta.total === 1 ? "" : "s"}
              </span>
            )}
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Monitor individual savings goals, account balances, scheduled
            contributions, and target completion across the platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white/60 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
        >
          <HiOutlineRefresh
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* ============================================================
          SUMMARY CARDS
      ============================================================ */}

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Plans"
          value={summary.totalPlans.toLocaleString("en-NG")}
          description="Plans on this page"
          icon={<HiOutlineShieldCheck size={19} />}
          iconClass="bg-[#68123D]/10 text-[#68123D]"
        />

        <SummaryCard
          label="Active Plans"
          value={summary.active.toLocaleString("en-NG")}
          description="Currently in progress"
          icon={<HiOutlineRefresh size={19} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <SummaryCard
          label="Completed Plans"
          value={summary.completed.toLocaleString("en-NG")}
          description="Goals successfully reached"
          icon={<HiOutlineCheckCircle size={19} />}
          iconClass="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          label="Total Saved"
          value={formatMoney(summary.totalBalance)}
          description="Current page balance"
          icon={<HiOutlineCash size={19} />}
          iconClass="bg-amber-50 text-amber-600"
        />
      </div>

      {/* ============================================================
          SAVINGS PROGRESS
      ============================================================ */}

      <div className="rounded-2xl border border-white/70 bg-white/50 p-5 shadow-sm backdrop-blur-lg sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-semibold text-[#181B25]">
              Savings Progress Overview
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Compare current balances with target amounts on this page.
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
          <span>Saved: {formatMoney(summary.totalBalance)}</span>
          <span>Target: {formatMoney(summary.totalTarget)}</span>
        </div>
      </div>

      {/* ============================================================
          SEARCH AND FILTER TOOLBAR
      ============================================================ */}

      <div className="flex min-w-0 flex-col items-stretch justify-between gap-4 rounded-2xl border border-white/60 bg-white/45 p-3 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:p-4">
        <div className="relative w-full min-w-0 sm:max-w-md sm:flex-1">
          <HiOutlineSearch
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search savings, user, email, phone or ID..."
            className="w-full rounded-xl border border-gray-200/50 bg-white/40 py-2.5 pl-10 pr-4 text-sm text-gray-800 shadow-inner outline-none transition-all placeholder:text-gray-400 hover:bg-white/60 focus:border-[#68123D]/40 focus:bg-white/80 focus:ring-4 focus:ring-[#68123D]/5"
          />
        </div>

        <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
          <select
            value={statusFilter}
            onChange={(event) => handleStatusChange(event.target.value)}
            aria-label="Filter target savings by status"
            className="min-w-36 cursor-pointer rounded-xl border border-gray-200/50 bg-white/50 p-2.5 text-xs font-medium text-gray-700 outline-none transition-all hover:bg-white focus:border-[#68123D]/40"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400">Show</span>

            <select
              value={limit}
              onChange={(event) =>
                handleLimitChange(Number(event.target.value))
              }
              aria-label="Savings plans per page"
              className="cursor-pointer rounded-xl border border-gray-200/50 bg-white/50 p-2.5 text-xs font-medium text-gray-700 outline-none transition-all hover:bg-white focus:border-[#68123D]/40"
            >
              {[5, 10, 20, 50].map((value) => (
                <option key={value} value={value}>
                  {value} per page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ACTIVE FILTERS */}

      {(searchQuery || statusFilter !== "ALL") && (
        <div className="-mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">Active filters:</span>

          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/60 px-3 py-1.5 text-xs text-gray-600 transition hover:bg-white"
            >
              Search: {searchQuery}
              <HiOutlineX size={13} />
            </button>
          )}

          {statusFilter !== "ALL" && (
            <button
              type="button"
              onClick={() => handleStatusChange("ALL")}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/60 px-3 py-1.5 text-xs text-gray-600 transition hover:bg-white"
            >
              Status: {formatStatus(statusFilter)}
              <HiOutlineX size={13} />
            </button>
          )}
        </div>
      )}

      {/* ============================================================
          LIST ERROR
      ============================================================ */}

      {isError && (
        <ErrorState
          title="Failed to load target savings"
          description={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      )}

      {/* ============================================================
          DESKTOP TABLE
      ============================================================ */}

      <div className="hidden min-w-0 max-w-full overflow-hidden rounded-2xl border border-white/70 bg-white/50 shadow-sm backdrop-blur-lg lg:block">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100/50 px-6 py-4">
          <div>
            <h3 className="font-semibold text-[#181B25]">
              Individual Savings Plans
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Select a savings plan to review its full details.
            </p>
          </div>

          {isFetching && !isLoading && (
            <span className="text-xs text-gray-400">Updating records...</span>
          )}
        </div>

        {isLoading ? (
          <LoadingState text="Loading target savings..." />
        ) : !isError && filteredSavings.length === 0 ? (
          <EmptyState text="No savings plans match your current search or filters." />
        ) : !isError ? (
          <>
            <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
              <table className="w-full min-w-[1150px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-100/50 bg-gray-50/30 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    <th className="px-5 py-4">Savings Plan</th>
                    <th className="px-5 py-4">Account Holder</th>
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
                  {filteredSavings.map((item) => {
                    const progress = getProgress(item);

                    return (
                      <tr
                        key={item.id}
                        className="group transition-all duration-150 hover:bg-white/45"
                      >
                        {/* SAVINGS PLAN */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#68123D]/10 bg-[#68123D]/10 text-[#68123D]">
                              <HiOutlineCash size={17} />
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-40 truncate text-sm font-semibold text-gray-800">
                                {item.name || "Untitled savings"}
                              </p>

                              <p
                                title={item.id}
                                className="mt-1 max-w-40 truncate font-mono text-[10px] text-gray-400"
                              >
                                {item.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* ACCOUNT HOLDER */}

                        <td className="px-5 py-4">
                          <div className="flex min-w-44 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#68123D]/10 bg-[#68123D]/10 text-xs font-bold text-[#68123D]">
                              {getInitials(item.user)}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-48 truncate text-xs font-semibold text-gray-800">
                                {getFullName(item.user)}
                              </p>

                              <p className="mt-1 max-w-48 truncate text-[10px] text-gray-400">
                                {item.user?.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* TARGET */}

                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="text-xs font-bold text-gray-800">
                            {formatMoney(item.targetAmount, item.currency)}
                          </span>
                        </td>

                        {/* BALANCE / PROGRESS */}

                        <td className="px-5 py-4">
                          <p className="whitespace-nowrap text-xs font-bold text-gray-800">
                            {formatMoney(item.balance, item.currency)}
                          </p>

                          <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-[#68123D] transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>

                          <p className="mt-1 text-[10px] text-gray-400">
                            {progress.toFixed(1)}% saved
                          </p>
                        </td>

                        {/* CONTRIBUTION */}

                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="text-xs font-medium text-gray-700">
                            {formatMoney(
                              item.contributionAmount,
                              item.currency,
                            )}
                          </span>
                        </td>

                        {/* FREQUENCY */}

                        <td className="px-5 py-4">
                          <span className="text-xs font-medium text-gray-700">
                            {formatFrequency(item.frequency)}
                          </span>
                        </td>

                        {/* TARGET DATE */}

                        <td className="px-5 py-4">
                          <p className="whitespace-nowrap text-xs font-medium text-gray-700">
                            {formatDate(item.targetDate)}
                          </p>

                          <p className="mt-1 whitespace-nowrap text-[10px] text-gray-400">
                            {getTargetDateLabel(item)}
                          </p>
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          <StatusBadge status={item.status} />
                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => openDetails(item.id)}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-neutral-800"
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
              meta={meta}
              page={page}
              itemCount={filteredSavings.length}
              onPrevious={goToPreviousPage}
              onNext={goToNextPage}
            />
          </>
        ) : null}
      </div>

      {/* ============================================================
          MOBILE AND TABLET CARDS
      ============================================================ */}

      <div className="min-w-0 space-y-4 lg:hidden">
        <div className="flex items-center justify-between gap-3 px-1">
          <div>
            <h3 className="font-semibold text-[#181B25]">
              Individual Savings Plans
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              {meta.total.toLocaleString("en-NG")} total records
            </p>
          </div>

          {isFetching && !isLoading && (
            <span className="text-xs text-gray-400">Updating...</span>
          )}
        </div>

        {isLoading ? (
          <LoadingState text="Loading target savings..." />
        ) : !isError && filteredSavings.length === 0 ? (
          <EmptyState text="No savings plans match your current search or filters." />
        ) : !isError ? (
          <>
            <div className="space-y-4">
              {filteredSavings.map((item) => {
                const progress = getProgress(item);

                return (
                  <article
                    key={item.id}
                    className="space-y-4 min-w-0 max-w-full rounded-2xl border border-white/70 bg-white/60 p-5 shadow-sm backdrop-blur-md"
                  >
                    {/* CARD HEADER */}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#68123D]/10 bg-[#68123D]/10 text-[#68123D]">
                          <HiOutlineCash size={19} />
                        </div>

                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-semibold text-gray-800">
                            {item.name || "Untitled savings"}
                          </h4>

                          <p className="mt-1 truncate text-[10px] text-gray-400">
                            ID: {item.id}
                          </p>
                        </div>
                      </div>

                      <StatusBadge status={item.status} />
                    </div>

                    {/* USER */}

                    <div className="flex items-center gap-3 rounded-xl border border-gray-100/70 bg-white/50 p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#68123D]/10 text-xs font-bold text-[#68123D]">
                        {getInitials(item.user)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-gray-800">
                          {getFullName(item.user)}
                        </p>

                        <p className="mt-1 truncate text-[10px] text-gray-400">
                          {item.user?.email || "No email provided"}
                        </p>
                      </div>
                    </div>

                    {/* FINANCIAL DETAILS */}

                    <div className="grid grid-cols-2 gap-4 border-y border-gray-100/70 py-4">
                      <DetailItem
                        label="Target Amount"
                        value={formatMoney(item.targetAmount, item.currency)}
                        highlight
                      />

                      <DetailItem
                        label="Current Balance"
                        value={formatMoney(item.balance, item.currency)}
                        highlight
                      />

                      <DetailItem
                        label="Contribution"
                        value={formatMoney(
                          item.contributionAmount,
                          item.currency,
                        )}
                      />

                      <DetailItem
                        label="Frequency"
                        value={formatFrequency(item.frequency)}
                      />

                      <DetailItem
                        label="Target Date"
                        value={formatDate(item.targetDate)}
                      />

                      <DetailItem
                        label="Schedule"
                        value={getTargetDateLabel(item)}
                      />
                    </div>

                    {/* PROGRESS */}

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
                          className="h-full rounded-full bg-[#68123D] transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <p className="mt-2 text-xs text-gray-500">
                        {formatMoney(getRemainingAmount(item), item.currency)}{" "}
                        remaining to reach target
                      </p>
                    </div>

                    {/* ACTION */}

                    <button
                      type="button"
                      onClick={() => openDetails(item.id)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-neutral-800"
                    >
                      View Savings Details
                      <HiOutlineExternalLink size={14} />
                    </button>
                  </article>
                );
              })}
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/50 shadow-sm">
              <Pagination
                meta={meta}
                page={page}
                itemCount={filteredSavings.length}
                onPrevious={goToPreviousPage}
                onNext={goToNextPage}
              />
            </div>
          </>
        ) : null}
      </div>

      {/* ============================================================
          DETAILS DRAWER
      ============================================================ */}

      {selectedSavingsId && (
        <>
          {/* BACKDROP */}

          <div
            className="fixed inset-0 z-40 bg-black/15 backdrop-blur-md"
            onClick={closeDetails}
          />

          {/* DRAWER */}

          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Individual target savings details"
            className="drawer-animate fixed inset-y-2 left-2 right-2 z-50 flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/50 bg-white/95 text-sm text-[#181B25] shadow-[0_24px_60px_rgba(0,0,0,0.12)] backdrop-blur-2xl sm:inset-y-4 sm:left-4 sm:right-4 sm:rounded-3xl md:left-auto md:right-4 md:w-full md:max-w-2xl"
          >
            {/* HEADER */}

            <div className="flex items-center justify-between gap-3 border-b border-gray-100/50 p-5 sm:p-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#68123D]/10 text-[#68123D]">
                  <HiOutlineCash size={21} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">
                    Savings Details
                  </h2>

                  <p className="mt-1 truncate font-mono text-[10px] text-gray-400 sm:text-xs">
                    {selectedSavingsId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                aria-label="Close savings details"
                className="shrink-0 rounded-full bg-gray-100/60 p-2.5 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900"
              >
                <HiOutlineX size={18} />
              </button>
            </div>

            {/* DRAWER CONTENT */}

            <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
              {isDetailsLoading || isDetailsFetching ? (
                <LoadingState text="Loading savings details..." />
              ) : isDetailsError ? (
                <ErrorState
                  title="Failed to load savings details"
                  description={getErrorMessage(detailsError)}
                  onRetry={() => refetchDetails()}
                />
              ) : !selectedSavings ? (
                <EmptyState text="No details are available for this savings plan." />
              ) : (
                <>
                  {/* ==================================================
                      SAVINGS OVERVIEW
                  ================================================== */}

                  <div className="rounded-2xl border border-[#68123D]/10 bg-[#68123D]/5 p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#68123D]/10 text-[#68123D]">
                        <HiOutlineCash size={25} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words text-lg font-bold text-gray-900">
                            {selectedSavings.name || "Untitled savings"}
                          </h3>

                          <StatusBadge status={selectedSavings.status} />
                        </div>

                        <p className="mt-2 text-xs leading-relaxed text-gray-500">
                          Individual target savings plan
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4">
                      <DetailItem
                        label="Current Balance"
                        value={formatMoney(
                          selectedSavings.balance,
                          selectedSavings.currency,
                        )}
                        highlight
                      />

                      <DetailItem
                        label="Target Amount"
                        value={formatMoney(
                          selectedSavings.targetAmount,
                          selectedSavings.currency,
                        )}
                        highlight
                      />

                      <DetailItem
                        label="Contribution"
                        value={formatMoney(
                          selectedSavings.contributionAmount,
                          selectedSavings.currency,
                        )}
                      />

                      <DetailItem
                        label="Remaining Amount"
                        value={formatMoney(
                          getRemainingAmount(selectedSavings),
                          selectedSavings.currency,
                        )}
                      />
                    </div>

                    <div className="mt-5 border-t border-[#68123D]/10 pt-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-gray-500">
                          Goal Progress
                        </span>

                        <span className="text-sm font-bold text-[#68123D]">
                          {getProgress(selectedSavings).toFixed(1)}%
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/80">
                        <div
                          className="h-full rounded-full bg-[#68123D] transition-all duration-500"
                          style={{
                            width: `${getProgress(selectedSavings)}%`,
                          }}
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-gray-500">
                          {getTargetDateLabel(selectedSavings)}
                        </span>

                        <span className="text-xs font-medium text-gray-600">
                          {formatFrequency(selectedSavings.frequency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ==================================================
                      ACCOUNT HOLDER
                  ================================================== */}

                  <DetailSection
                    icon={<HiOutlineUser size={16} />}
                    title="Account Holder"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#68123D]/10 bg-[#68123D]/10 text-sm font-bold text-[#68123D]">
                        {getInitials(selectedSavings.user)}
                      </div>

                      <div className="min-w-0">
                        <h3 className="break-words text-sm font-bold text-gray-900">
                          {getFullName(selectedSavings.user)}
                        </h3>

                        <p className="mt-1 break-all text-xs text-gray-500">
                          {selectedSavings.user?.email || "No email provided"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {selectedSavings.user?.phone || "No phone provided"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 border-t border-gray-100/70 pt-3 sm:grid-cols-2">
                      <DetailItem
                        label="User ID"
                        value={selectedSavings.userId || "N/A"}
                      />

                      <DetailItem
                        label="Savings Plan ID"
                        value={selectedSavings.id}
                      />
                    </div>
                  </DetailSection>

                  {/* ==================================================
                      SAVINGS GOAL
                  ================================================== */}

                  <DetailSection
                    icon={<HiOutlineCash size={16} />}
                    title="Savings Goal"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <DetailItem
                        label="Target Amount"
                        value={formatMoney(
                          selectedSavings.targetAmount,
                          selectedSavings.currency,
                        )}
                        highlight
                      />

                      <DetailItem
                        label="Current Balance"
                        value={formatMoney(
                          selectedSavings.balance,
                          selectedSavings.currency,
                        )}
                      />

                      <DetailItem
                        label="Remaining Amount"
                        value={formatMoney(
                          getRemainingAmount(selectedSavings),
                          selectedSavings.currency,
                        )}
                      />

                      <DetailItem
                        label="Contribution Amount"
                        value={formatMoney(
                          selectedSavings.contributionAmount,
                          selectedSavings.currency,
                        )}
                      />

                      <DetailItem
                        label="Contribution Frequency"
                        value={formatFrequency(selectedSavings.frequency)}
                      />

                      <DetailItem
                        label="Currency"
                        value={selectedSavings.currency || "NGN"}
                      />
                    </div>
                  </DetailSection>

                  {/* ==================================================
                      SAVINGS TIMELINE
                  ================================================== */}

                  <DetailSection
                    icon={<HiOutlineCalendar size={16} />}
                    title="Savings Timeline"
                  >
                    <DetailRow
                      label="Created"
                      value={formatDateTime(selectedSavings.createdAt)}
                    />

                    <DetailRow
                      label="Last Updated"
                      value={formatDateTime(selectedSavings.updatedAt)}
                    />

                    <DetailRow
                      label="Target Date"
                      value={formatDate(selectedSavings.targetDate)}
                    />

                    <DetailRow
                      label="Target Date Status"
                      value={getTargetDateLabel(selectedSavings)}
                    />

                    <DetailRow
                      label="Completed At"
                      value={formatDateTime(selectedSavings.completedAt)}
                    />

                    <DetailRow
                      label="Next Scheduled Run"
                      value={formatDateTime(selectedSavings.nextRunAt)}
                    />

                    <DetailRow
                      label="Last Run"
                      value={formatDateTime(selectedSavings.lastRunAt)}
                    />

                    <DetailRow
                      label="Last Failed Run"
                      value={formatDateTime(selectedSavings.lastFailureAt)}
                    />
                  </DetailSection>

                  {/* ==================================================
                      CONTRIBUTION EXECUTION
                  ================================================== */}

                  <DetailSection
                    icon={<HiOutlineClock size={16} />}
                    title="Contribution Execution"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <DetailItem
                        label="Failure Count"
                        value={String(selectedSavings.failureCount ?? 0)}
                      />

                      <DetailItem
                        label="Current Status"
                        value={formatStatus(selectedSavings.status)}
                      />

                      <DetailItem
                        label="Last Run"
                        value={formatDateTime(selectedSavings.lastRunAt)}
                      />

                      <DetailItem
                        label="Last Failure"
                        value={formatDateTime(selectedSavings.lastFailureAt)}
                      />
                    </div>
                  </DetailSection>

                  {/* ==================================================
                      RECORD INFORMATION
                  ================================================== */}

                  <DetailSection
                    icon={<HiOutlineInformationCircle size={16} />}
                    title="Record Information"
                  >
                    <DetailRow
                      label="Savings Plan ID"
                      value={selectedSavings.id}
                      breakAll
                    />

                    <DetailRow
                      label="Account User ID"
                      value={selectedSavings.userId}
                      breakAll
                    />

                    <DetailRow
                      label="Created At"
                      value={formatDateTime(selectedSavings.createdAt)}
                    />

                    <DetailRow
                      label="Updated At"
                      value={formatDateTime(selectedSavings.updatedAt)}
                    />
                  </DetailSection>
                </>
              )}
            </div>

            {/* DRAWER FOOTER */}

            <div className="border-t border-gray-100/50 bg-white/30 p-4 backdrop-blur-md sm:p-6">
              <button
                type="button"
                onClick={closeDetails}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-neutral-800"
              >
                <HiOutlineArrowLeft size={16} />
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
   SUMMARY CARD
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

/* ================================================================
   DETAIL SECTION
================================================================ */

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

/* ================================================================
   DETAIL ITEM
================================================================ */

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
          highlight ? "font-bold text-gray-950" : "font-semibold text-gray-800"
        }`}
      >
        {value || "N/A"}
      </span>
    </div>
  );
}

/* ================================================================
   DETAIL ROW
================================================================ */

function DetailRow({
  label,
  value,
  breakAll = false,
}: {
  label: string;
  value?: string | null;
  breakAll?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100/50 py-3 last:border-b-0">
      <span className="shrink-0 text-xs font-medium text-gray-500 sm:text-sm">
        {label}
      </span>

      <span
        className={`min-w-0 text-right text-xs font-semibold text-gray-800 sm:text-sm ${
          breakAll ? "break-all" : "break-words"
        }`}
      >
        {value || "N/A"}
      </span>
    </div>
  );
}

/* ================================================================
   PAGINATION
================================================================ */

function Pagination({
  meta,
  page,
  itemCount,
  onPrevious,
  onNext,
}: {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  page: number;
  itemCount: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const start = meta.total === 0 ? 0 : (page - 1) * meta.limit + 1;

  const end = Math.min((page - 1) * meta.limit + itemCount, meta.total);

  const totalPages = Math.max(meta.totalPages, 1);

  return (
    <div className="flex flex-col justify-between gap-3 border-t border-gray-100/50 bg-white/20 px-4 py-4 text-xs font-medium text-gray-500 sm:flex-row sm:items-center sm:px-6">
      <span>
        Showing <span className="font-semibold text-gray-700">{start}</span> to{" "}
        <span className="font-semibold text-gray-700">{end}</span> of{" "}
        <span className="font-semibold text-gray-700">{meta.total}</span>{" "}
        records
      </span>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <span className="mr-2 whitespace-nowrap">
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          onClick={onPrevious}
          disabled={page <= 1}
          aria-label="Previous page"
          className="cursor-pointer rounded-xl border border-gray-200/50 bg-white/50 p-2 text-gray-600 shadow-sm transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <HiOutlineChevronLeft size={16} />
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={page >= meta.totalPages || meta.totalPages === 0}
          aria-label="Next page"
          className="cursor-pointer rounded-xl border border-gray-200/50 bg-white/50 p-2 text-gray-600 shadow-sm transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <HiOutlineChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   LOADING STATE
================================================================ */

function LoadingState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/60 bg-white/45 px-4 py-20 shadow-sm backdrop-blur-md">
      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#68123D]" />

      <p className="text-sm font-medium text-gray-500">{text}</p>
    </div>
  );
}

/* ================================================================
   ERROR STATE
================================================================ */

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
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#68123D] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#68123D]/95"
      >
        <HiOutlineRefresh size={14} />
        Retry Connection
      </button>
    </div>
  );
}

/* ================================================================
   EMPTY STATE
================================================================ */

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
