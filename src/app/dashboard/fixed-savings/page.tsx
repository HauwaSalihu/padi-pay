"use client";

import React, { useMemo, useState } from "react";
import {
  HiOutlineSearch,
  HiOutlineExternalLink,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUser,
  HiOutlineCurrencyDollar,
  HiOutlineCalendar,
  HiOutlineShieldCheck,
} from "react-icons/hi";

import {
  FixedSavings,
  FixedSavingsStatus,
  useGetFixedSavingsQuery,
} from "@/services/padiApi/adminApi";

import { PagePermissionGuard } from "@/components/AuthGuard";

export default function FixedSavingsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState<"ALL" | FixedSavingsStatus>(
    "ALL",
  );

  const [selectedSavings, setSelectedSavings] = useState<FixedSavings | null>(
    null,
  );

  const { data, isLoading, isError, refetch } = useGetFixedSavingsQuery({
    page,
    limit,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const savings = data?.data ?? [];

  const meta = data?.meta ?? {
    page: 1,
    limit,
    total: 0,
    totalPages: 0,
  };

  const fmtMoney = (
    value?: string | number | bigint | null,
    currency = "NGN",
  ) => {
    if (value === undefined || value === null) {
      return currency === "NGN" ? "₦0.00" : `${currency} 0.00`;
    }

    const amount = Number(value);

    if (Number.isNaN(amount)) {
      return currency === "NGN" ? "₦0.00" : `${currency} 0.00`;
    }

    // Convert kobo to naira and round to the nearest kobo
    const nairaAmount = Math.round(amount) / 100;

    if (currency === "NGN") {
      return `₦${nairaAmount.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    return `${currency} ${nairaAmount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (value?: string | null) => {
    if (!value) {
      return "N/A";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) {
      return "N/A";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getInitials = (first?: string | null, last?: string | null) => {
    const f = first?.charAt(0) || "";
    const l = last?.charAt(0) || "";

    return `${f}${l}`.toUpperCase() || "U";
  };

  const getFullName = (user?: FixedSavings["user"]) => {
    if (!user) {
      return "Non PadiPay Member";
    }

    const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();

    return name || "Non PadiPay Member";
  };

  const getStatusStyles = (status: FixedSavingsStatus) => {
    switch (status) {
      case "ACTIVE":
        return {
          wrapper: "bg-emerald-50 text-emerald-700 border-emerald-100",
          dot: "bg-emerald-500",
        };

      case "MATURED":
        return {
          wrapper: "bg-blue-50 text-blue-700 border-blue-100",
          dot: "bg-blue-500",
        };

      case "BROKEN":
        return {
          wrapper: "bg-rose-50 text-rose-700 border-rose-100",
          dot: "bg-rose-500",
        };

      default:
        return {
          wrapper: "bg-gray-50 text-gray-600 border-gray-100",
          dot: "bg-gray-400",
        };
    }
  };

  const getLiquidationStyles = (liquidated: boolean) => {
    return liquidated
      ? "bg-purple-50 text-purple-700 border-purple-100"
      : "bg-gray-50 text-gray-600 border-gray-100";
  };

  const calculateDaysRemaining = (maturityDate?: string | null) => {
    if (!maturityDate) {
      return null;
    }

    const maturity = new Date(maturityDate).getTime();
    const now = new Date().getTime();

    if (Number.isNaN(maturity)) {
      return null;
    }

    const difference = maturity - now;

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  const filteredSavings = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return savings;
    }

    return savings.filter((saving) => {
      const fullName = getFullName(saving.user).toLowerCase();

      return (
        fullName.includes(search) ||
        saving.user?.email?.toLowerCase().includes(search) ||
        saving.user?.phone?.toLowerCase().includes(search) ||
        saving.name.toLowerCase().includes(search) ||
        saving.id.toLowerCase().includes(search) ||
        saving.status.toLowerCase().includes(search)
      );
    });
  }, [savings, query]);

  const activeCount = savings.filter(
    (saving) => saving.status === "ACTIVE",
  ).length;

  const maturedCount = savings.filter(
    (saving) => saving.status === "MATURED",
  ).length;

  const brokenCount = savings.filter(
    (saving) => saving.status === "BROKEN",
  ).length;

  const totalPrincipal = savings.reduce(
    (total, saving) => total + Number(saving.principal || 0),
    0,
  );

  const closeDetails = () => {
    setSelectedSavings(null);
  };

  const handleStatusChange = (value: "ALL" | FixedSavingsStatus) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  return (
    <PagePermissionGuard pageKey="fixed-savings">
      <div className="relative space-y-8 font-satoshi">
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
            animation: slideIn 0.35s
              cubic-bezier(0.16, 1, 0.3, 1)
              forwards;
          }
        `}</style>

        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <div className="flex flex-col gap-4 border-b border-gray-100/50 pb-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-[#181B25]">
              Fixed Savings
            </h1>

            <p className="max-w-xl text-sm text-[#525866]/80">
              View and manage users&apos; fixed savings plans, principal
              amounts, maturity dates, and liquidation status.
            </p>
          </div>

          {!isLoading && !isError && meta.total > 0 && (
            <div className="self-start md:self-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#68123D]/15 bg-[#68123D]/10 px-3.5 py-1.5 text-xs font-semibold text-[#68123D] shadow-sm backdrop-blur-md">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#68123D]" />
                {meta.total} Fixed Savings
              </span>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* SUMMARY CARDS */}
        {/* ========================================================= */}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Total */}
            <div className="rounded-2xl border border-white/70 bg-white/50 p-5 shadow-sm backdrop-blur-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Total Plans
                  </p>

                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {meta.total}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#68123D]/10 text-[#68123D]">
                  <HiOutlineShieldCheck size={19} />
                </div>
              </div>
            </div>

            {/* Active */}
            <div className="rounded-2xl border border-white/70 bg-white/50 p-5 shadow-sm backdrop-blur-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400">Active</p>

                  <p className="mt-2 text-2xl font-bold text-emerald-600">
                    {activeCount}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>

            {/* Matured */}
            <div className="rounded-2xl border border-white/70 bg-white/50 p-5 shadow-sm backdrop-blur-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400">Matured</p>

                  <p className="mt-2 text-2xl font-bold text-blue-600">
                    {maturedCount}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <HiOutlineCalendar size={19} />
                </div>
              </div>
            </div>

            {/* Broken */}
            <div className="rounded-2xl border border-white/70 bg-white/50 p-5 shadow-sm backdrop-blur-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400">Broken</p>

                  <p className="mt-2 text-2xl font-bold text-rose-600">
                    {brokenCount}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <HiOutlineX size={19} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SEARCH + FILTER */}
        {/* ========================================================= */}

        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/45 p-4 shadow-sm backdrop-blur-md lg:flex-row">
          <div className="relative w-full lg:max-w-md">
            <HiOutlineSearch
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search user, savings name, ID..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-200/50 bg-white/40 py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none shadow-inner transition-all placeholder:text-gray-400 hover:bg-white/60 focus:border-[#68123D]/40 focus:bg-white/80 focus:ring-4 focus:ring-[#68123D]/5"
            />
          </div>

          <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
            <select
              value={statusFilter}
              onChange={(e) =>
                handleStatusChange(e.target.value as "ALL" | FixedSavingsStatus)
              }
              className="cursor-pointer rounded-xl border border-gray-200/50 bg-white/40 p-2.5 text-xs font-medium text-gray-700 outline-none shadow-sm transition-all hover:border-gray-300 hover:bg-white/60 focus:border-[#68123D]/40"
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="MATURED">Matured</option>
              <option value="BROKEN">Broken</option>
            </select>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs font-medium text-gray-400">Show</span>

              <select
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="cursor-pointer rounded-xl border border-gray-200/50 bg-white/40 p-2.5 text-xs font-medium text-gray-700 outline-none shadow-sm transition-all hover:border-gray-300 hover:bg-white/60 focus:border-[#68123D]/40"
              >
                {[5, 10, 20, 50].map((value) => (
                  <option
                    key={value}
                    value={value}
                    className="bg-white text-gray-800"
                  >
                    {value} per page
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CONTENT */}
        {/* ========================================================= */}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/60 bg-white/45 px-4 py-24 text-center shadow-sm backdrop-blur-md">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#68123D]" />

            <p className="text-sm font-medium text-gray-500">
              Loading fixed savings...
            </p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100/50 bg-red-50/20 px-4 py-16 text-center shadow-sm backdrop-blur-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-100/30 bg-red-50 text-red-500">
              <HiOutlineX size={22} />
            </div>

            <h3 className="mb-1 text-sm font-semibold text-red-900">
              Failed to load fixed savings
            </h3>

            <p className="mb-5 max-w-xs text-xs text-red-700/80">
              There was an issue fetching the fixed savings records. Please try
              again.
            </p>

            <button
              onClick={() => refetch()}
              className="cursor-pointer rounded-xl bg-[#68123D] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#68123D]/95 active:bg-[#68123D]"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredSavings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/60 bg-white/45 px-4 py-24 text-center shadow-sm backdrop-blur-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gray-100/50 bg-gray-50 text-gray-400">
              <HiOutlineSearch size={20} />
            </div>

            <h3 className="mb-1 text-sm font-semibold text-gray-800">
              No fixed savings found
            </h3>

            <p className="max-w-xs text-xs text-gray-400">
              There are no fixed savings records matching your search or
              selected status.
            </p>
          </div>
        ) : (
          <>
            {/* ===================================================== */}
            {/* DESKTOP TABLE */}
            {/* ===================================================== */}

            <div className="hidden overflow-hidden rounded-2xl border border-white/70 bg-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-lg md:block">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-100/50 bg-gray-50/20 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      <th className="px-6 py-4 font-medium">ID</th>

                      <th className="px-6 py-4 font-medium">User</th>

                      <th className="px-6 py-4 font-medium">Savings</th>

                      <th className="px-6 py-4 font-medium">Principal</th>

                      <th className="px-6 py-4 font-medium">Duration</th>

                      <th className="px-6 py-4 font-medium">Maturity</th>

                      <th className="px-6 py-4 font-medium">Status</th>

                      <th className="px-6 py-4 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100/30 text-sm">
                    {filteredSavings.map((saving) => {
                      const statusStyle = getStatusStyles(saving.status);

                      return (
                        <tr
                          key={saving.id}
                          className="group border-b border-gray-100/40 transition-all duration-150 last:border-0 hover:bg-white/45"
                        >
                          {/* ID */}
                          <td className="px-6 py-4">
                            <span className="rounded-md border border-gray-100/30 bg-gray-50/50 px-2 py-1 font-mono text-xs text-gray-400 transition-all group-hover:bg-white">
                              {saving.id.substring(0, 8)}...
                            </span>
                          </td>

                          {/* USER */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#68123D]/10 bg-gradient-to-br from-[#68123D]/10 to-[#68123D]/5 text-xs font-bold text-[#68123D] shadow-sm transition-transform duration-200 group-hover:scale-105">
                                {getInitials(
                                  saving.user?.first_name,
                                  saving.user?.last_name,
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="text-sm font-semibold leading-tight text-gray-800">
                                  {getFullName(saving.user)}
                                </div>

                                <div className="mt-0.5 max-w-[180px] truncate text-xs text-gray-400">
                                  {saving.user?.email || "No email"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* SAVINGS NAME */}
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-700">
                              {saving.name}
                            </div>

                            <div className="mt-0.5 text-xs text-gray-400">
                              Created {formatDate(saving.createdAt)}
                            </div>
                          </td>

                          {/* PRINCIPAL */}
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-950">
                              {fmtMoney(saving.principal)}
                            </span>
                          </td>

                          {/* DURATION */}
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-700">
                              {saving.duration}{" "}
                              {saving.duration === 1 ? "day" : "days"}
                            </div>

                            <div className="mt-0.5 text-xs text-gray-400">
                              From {formatDate(saving.startDate)}
                            </div>
                          </td>

                          {/* MATURITY */}
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-700">
                              {formatDate(saving.maturityDate)}
                            </div>

                            {saving.status === "ACTIVE" && (
                              <div className="mt-0.5 text-xs text-gray-400">
                                {(() => {
                                  const days = calculateDaysRemaining(
                                    saving.maturityDate,
                                  );

                                  if (days === null) {
                                    return "";
                                  }

                                  if (days <= 0) {
                                    return "Maturity due";
                                  }

                                  return `${days} ${
                                    days === 1 ? "day" : "days"
                                  } remaining`;
                                })()}
                              </div>
                            )}
                          </td>

                          {/* STATUS */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyle.wrapper}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                              />

                              {saving.status}
                            </span>

                            {saving.liquidated && (
                              <span className="mt-1.5 block text-[10px] font-medium text-purple-600">
                                Liquidated
                              </span>
                            )}
                          </td>

                          {/* ACTION */}
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setSelectedSavings(saving)}
                              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-neutral-800 active:bg-neutral-950"
                            >
                              View
                              <HiOutlineExternalLink
                                size={13}
                                className="opacity-80"
                              />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="flex items-center justify-between border-t border-gray-100/50 bg-white/20 px-6 py-4 text-xs font-medium text-gray-500">
                <span>
                  Page {meta.page} of {meta.totalPages} ({meta.total} total)
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="cursor-pointer rounded-xl border border-gray-200/50 bg-white/50 p-2 text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:bg-white active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <HiOutlineChevronLeft size={16} />
                  </button>

                  <button
                    onClick={() =>
                      setPage((p) => Math.min(meta.totalPages || 1, p + 1))
                    }
                    disabled={page >= (meta.totalPages || 1)}
                    className="cursor-pointer rounded-xl border border-gray-200/50 bg-white/50 p-2 text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:bg-white active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <HiOutlineChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* ===================================================== */}
            {/* MOBILE CARDS */}
            {/* ===================================================== */}

            <div className="space-y-4 md:hidden">
              {filteredSavings.map((saving) => {
                const statusStyle = getStatusStyles(saving.status);

                return (
                  <div
                    key={saving.id}
                    className="space-y-4 rounded-2xl border border-white/70 bg-white/60 p-5 shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-white/80"
                  >
                    {/* USER */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#68123D]/10 bg-gradient-to-br from-[#68123D]/10 to-[#68123D]/5 text-xs font-bold text-[#68123D] shadow-sm">
                          {getInitials(
                            saving.user?.first_name,
                            saving.user?.last_name,
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold leading-tight text-gray-800">
                            {getFullName(saving.user)}
                          </h3>

                          <p className="mt-0.5 truncate text-xs text-gray-400">
                            {saving.user?.email || "No email"}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-md border border-gray-100/30 bg-gray-100/50 px-2 py-1 font-mono text-[10px] text-gray-400">
                        #{saving.id.substring(0, 8)}
                      </span>
                    </div>

                    {/* DETAILS */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-b border-t border-gray-100/50 py-4 text-xs">
                      <div>
                        <span className="block font-medium text-gray-400">
                          Savings Name
                        </span>

                        <span className="mt-0.5 block font-semibold text-gray-700">
                          {saving.name}
                        </span>
                      </div>

                      <div>
                        <span className="block font-medium text-gray-400">
                          Principal
                        </span>

                        <span className="mt-0.5 block font-bold text-gray-950">
                          {fmtMoney(saving.principal)}
                        </span>
                      </div>

                      <div>
                        <span className="block font-medium text-gray-400">
                          Duration
                        </span>

                        <span className="mt-0.5 block font-semibold text-gray-700">
                          {saving.duration}{" "}
                          {saving.duration === 1 ? "day" : "days"}
                        </span>
                      </div>

                      <div>
                        <span className="block font-medium text-gray-400">
                          Maturity Date
                        </span>

                        <span className="mt-0.5 block font-semibold text-gray-700">
                          {formatDate(saving.maturityDate)}
                        </span>
                      </div>

                      <div>
                        <span className="block font-medium text-gray-400">
                          Start Date
                        </span>

                        <span className="mt-0.5 block font-semibold text-gray-700">
                          {formatDate(saving.startDate)}
                        </span>
                      </div>

                      <div>
                        <span className="block font-medium text-gray-400">
                          Created
                        </span>

                        <span className="mt-0.5 block font-semibold text-gray-700">
                          {formatDate(saving.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* STATUS */}
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyle.wrapper}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                        />

                        {saving.status}
                      </span>

                      {saving.liquidated && (
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getLiquidationStyles(
                            saving.liquidated,
                          )}`}
                        >
                          Liquidated
                        </span>
                      )}
                    </div>

                    {/* ACTION */}
                    <button
                      onClick={() => setSelectedSavings(saving)}
                      className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border-0 bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-neutral-800 active:bg-neutral-950"
                    >
                      View Details
                      <HiOutlineExternalLink size={13} className="opacity-80" />
                    </button>
                  </div>
                );
              })}

              {/* MOBILE PAGINATION */}
              <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/45 p-4 text-xs font-medium text-gray-500 shadow-sm backdrop-blur-md">
                <span>
                  Page {meta.page} of {meta.totalPages || 1}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="cursor-pointer rounded-xl border border-gray-200/50 bg-white p-2.5 text-gray-600 shadow-sm transition-all hover:bg-gray-50 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <HiOutlineChevronLeft size={16} />
                  </button>

                  <button
                    onClick={() =>
                      setPage((p) => Math.min(meta.totalPages || 1, p + 1))
                    }
                    disabled={page >= (meta.totalPages || 1)}
                    className="cursor-pointer rounded-xl border border-gray-200/50 bg-white p-2.5 text-gray-600 shadow-sm transition-all hover:bg-gray-50 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <HiOutlineChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* DETAILS DRAWER */}
        {/* ========================================================= */}

        {selectedSavings && (
          <>
            {/* BACKDROP */}
            <div
              className="fixed inset-0 z-40 bg-black/15 backdrop-blur-md transition-opacity duration-300"
              onClick={closeDetails}
            />

            {/* DRAWER */}
            <div className="drawer-animate fixed bottom-4 right-4 top-4 z-50 flex w-[calc(100%-2rem)] flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/75 text-sm text-[#181B25] shadow-[0_24px_60px_rgba(0,0,0,0.12)] backdrop-blur-2xl md:w-full md:max-w-xl">
              {/* HEADER */}
              <div className="flex items-center justify-between border-b border-gray-100/50 p-6">
                <div className="min-w-0 space-y-1">
                  <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                    Fixed Savings Details
                  </h2>

                  <div className="flex items-center gap-1.5 font-mono text-xs text-gray-400">
                    <span>ID:</span>

                    <span className="max-w-[220px] truncate rounded bg-gray-100/80 px-1.5 py-0.5 font-medium text-gray-500">
                      {selectedSavings.id}
                    </span>
                  </div>
                </div>

                <button
                  onClick={closeDetails}
                  className="shrink-0 cursor-pointer rounded-full border border-gray-200/20 bg-gray-100/50 p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-800"
                >
                  <HiOutlineX size={18} />
                </button>
              </div>

              {/* SCROLLABLE CONTENT */}
              <div className="scrollbar-thin flex-1 space-y-6 overflow-y-auto p-6">
                {/* ================================================= */}
                {/* USER PROFILE */}
                {/* ================================================= */}

                <div className="space-y-4 rounded-2xl border border-gray-100/60 bg-white/40 p-5 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
                    <div className="rounded-lg bg-[#68123D]/5 p-1.5 text-[#68123D]">
                      <HiOutlineUser size={16} />
                    </div>

                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Account Holder
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                    <div>
                      <span className="mb-0.5 block font-medium text-gray-400">
                        Full Name
                      </span>

                      <span className="text-sm font-semibold text-gray-800">
                        {getFullName(selectedSavings.user)}
                      </span>
                    </div>

                    <div>
                      <span className="mb-0.5 block font-medium text-gray-400">
                        Email Address
                      </span>

                      <span className="break-all text-sm font-semibold text-gray-800">
                        {selectedSavings.user?.email || "N/A"}
                      </span>
                    </div>

                    <div>
                      <span className="mb-0.5 block font-medium text-gray-400">
                        Phone Number
                      </span>

                      <span className="text-sm font-semibold text-gray-800">
                        {selectedSavings.user?.phone || "N/A"}
                      </span>
                    </div>

                    <div>
                      <span className="mb-0.5 block font-medium text-gray-400">
                        User ID
                      </span>

                      <span className="break-all font-mono text-xs font-medium text-gray-600">
                        {selectedSavings.userId}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ================================================= */}
                {/* SAVINGS INFORMATION */}
                {/* ================================================= */}

                <div className="space-y-4 rounded-2xl border border-gray-100/60 bg-white/40 p-5 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
                    <div className="rounded-lg bg-[#68123D]/5 p-1.5 text-[#68123D]">
                      <HiOutlineCurrencyDollar size={16} />
                    </div>

                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Savings Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <span className="mb-0.5 block font-medium text-gray-400">
                        Savings Name
                      </span>

                      <span className="text-sm font-semibold text-gray-800">
                        {selectedSavings.name}
                      </span>
                    </div>

                    <div>
                      <span className="mb-0.5 block font-medium text-gray-400">
                        Principal
                      </span>

                      <span className="text-lg font-bold text-gray-900">
                        {fmtMoney(selectedSavings.principal)}
                      </span>
                    </div>

                    <div>
                      <span className="mb-0.5 block font-medium text-gray-400">
                        Duration
                      </span>

                      <span className="text-sm font-semibold text-gray-800">
                        {selectedSavings.duration}{" "}
                        {selectedSavings.duration === 1 ? "day" : "days"}
                      </span>
                    </div>

                    <div>
                      <span className="mb-0.5 block font-medium text-gray-400">
                        Start Date
                      </span>

                      <span className="text-sm font-semibold text-gray-800">
                        {formatDate(selectedSavings.startDate)}
                      </span>
                    </div>

                    <div>
                      <span className="mb-0.5 block font-medium text-gray-400">
                        Maturity Date
                      </span>

                      <span className="text-sm font-semibold text-gray-800">
                        {formatDate(selectedSavings.maturityDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ================================================= */}
                {/* STATUS */}
                {/* ================================================= */}

                <div className="space-y-4 rounded-2xl border border-gray-100/60 bg-white/40 p-5 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
                    <div className="rounded-lg bg-[#68123D]/5 p-1.5 text-[#68123D]">
                      <HiOutlineShieldCheck size={16} />
                    </div>

                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Savings Status
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                    <div>
                      <span className="mb-1 block font-medium text-gray-400">
                        Current Status
                      </span>

                      {(() => {
                        const styles = getStatusStyles(selectedSavings.status);

                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles.wrapper}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
                            />

                            {selectedSavings.status}
                          </span>
                        );
                      })()}
                    </div>

                    <div>
                      <span className="mb-1 block font-medium text-gray-400">
                        Liquidation
                      </span>

                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getLiquidationStyles(
                          selectedSavings.liquidated,
                        )}`}
                      >
                        {selectedSavings.liquidated
                          ? "Liquidated"
                          : "Not Liquidated"}
                      </span>
                    </div>

                    {selectedSavings.liquidatedAt && (
                      <div>
                        <span className="mb-0.5 block font-medium text-gray-400">
                          Liquidated At
                        </span>

                        <span className="text-sm font-semibold text-gray-800">
                          {formatDateTime(selectedSavings.liquidatedAt)}
                        </span>
                      </div>
                    )}

                    <div>
                      <span className="mb-0.5 block font-medium text-gray-400">
                        Created At
                      </span>

                      <span className="text-sm font-semibold text-gray-800">
                        {formatDateTime(selectedSavings.createdAt)}
                      </span>
                    </div>

                    <div>
                      <span className="mb-0.5 block font-medium text-gray-400">
                        Last Updated
                      </span>

                      <span className="text-sm font-semibold text-gray-800">
                        {formatDateTime(selectedSavings.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ================================================= */}
                {/* MATURITY TIMELINE */}
                {/* ================================================= */}

                <div className="space-y-4 rounded-2xl border border-gray-100/60 bg-white/40 p-5 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
                    <div className="rounded-lg bg-[#68123D]/5 p-1.5 text-[#68123D]">
                      <HiOutlineCalendar size={16} />
                    </div>

                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Savings Timeline
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* START */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#68123D]/10 text-[#68123D]">
                        <span className="h-2 w-2 rounded-full bg-[#68123D]" />
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">Started</p>

                        <p className="text-sm font-semibold text-gray-800">
                          {formatDate(selectedSavings.startDate)}
                        </p>
                      </div>
                    </div>

                    <div className="ml-4 h-4 border-l border-dashed border-gray-200" />

                    {/* MATURITY */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <HiOutlineCalendar size={15} />
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">Maturity Date</p>

                        <p className="text-sm font-semibold text-gray-800">
                          {formatDate(selectedSavings.maturityDate)}
                        </p>

                        {selectedSavings.status === "ACTIVE" && (
                          <p className="mt-0.5 text-xs text-gray-400">
                            {(() => {
                              const days = calculateDaysRemaining(
                                selectedSavings.maturityDate,
                              );

                              if (days === null) {
                                return "";
                              }

                              if (days <= 0) {
                                return "Maturity date reached";
                              }

                              return `${days} ${
                                days === 1 ? "day" : "days"
                              } remaining`;
                            })()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* LIQUIDATION */}
                    {selectedSavings.liquidatedAt && (
                      <>
                        <div className="ml-4 h-4 border-l border-dashed border-gray-200" />

                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                            <HiOutlineCurrencyDollar size={15} />
                          </div>

                          <div>
                            <p className="text-xs text-gray-400">Liquidated</p>

                            <p className="text-sm font-semibold text-gray-800">
                              {formatDateTime(selectedSavings.liquidatedAt)}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* DRAWER FOOTER */}
              <div className="border-t border-gray-100/50 bg-white/30 p-6 backdrop-blur-md">
                <button
                  onClick={closeDetails}
                  className="w-full cursor-pointer rounded-2xl bg-neutral-900 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-neutral-800 active:bg-neutral-950"
                >
                  Close Details
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </PagePermissionGuard>
  );
}
