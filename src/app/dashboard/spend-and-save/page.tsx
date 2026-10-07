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
  HiOutlineShieldCheck,
  HiOutlineRefresh,
} from "react-icons/hi";

import {
  SpendAndSave,
  useGetSpendAndSaveQuery,
} from "@/services/padiApi/adminApi";

import { PagePermissionGuard } from "@/components/AuthGuard";

export default function SpendAndSavePage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");

  const [selectedSpendAndSave, setSelectedSpendAndSave] =
    useState<SpendAndSave | null>(null);

  const { data, isLoading, isError, refetch } = useGetSpendAndSaveQuery({
    page,
    limit,
  });

  const spendAndSaveRecords = data?.data ?? [];

  const meta = data?.meta ?? {
    page: 1,
    limit,
    total: 0,
    totalPages: 0,
  };

  /* ========================================================= */
  /* HELPERS */
  /* ========================================================= */

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

  const getFullName = (user?: SpendAndSave["user"]) => {
    if (!user) {
      return "Non PadiPay Member";
    }

    const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();

    return name || "Non PadiPay Member";
  };

  const getEnabledStyles = (enabled: boolean) => {
    if (enabled) {
      return {
        wrapper: "bg-emerald-50 text-emerald-700 border-emerald-100",
        dot: "bg-emerald-500",
      };
    }

    return {
      wrapper: "bg-gray-50 text-gray-600 border-gray-100",
      dot: "bg-gray-400",
    };
  };

  const closeDetails = () => {
    setSelectedSpendAndSave(null);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  /* ========================================================= */
  /* SEARCH */
  /* ========================================================= */

  const filteredRecords = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return spendAndSaveRecords;
    }

    return spendAndSaveRecords.filter((record) => {
      const fullName = getFullName(record.user).toLowerCase();

      return (
        fullName.includes(search) ||
        record.user?.email?.toLowerCase().includes(search) ||
        record.user?.phone?.toLowerCase().includes(search) ||
        record.id.toLowerCase().includes(search) ||
        record.userId.toLowerCase().includes(search) ||
        String(record.percentage).includes(search)
      );
    });
  }, [spendAndSaveRecords, query]);

  /* ========================================================= */
  /* SUMMARY */
  /* ========================================================= */

  const enabledCount = spendAndSaveRecords.filter(
    (record) => record.isEnabled,
  ).length;

  const disabledCount = spendAndSaveRecords.filter(
    (record) => !record.isEnabled,
  ).length;

  const totalBalance = spendAndSaveRecords.reduce(
    (total, record) => total + Number(record.balance || 0),
    0,
  );

  return (
    <PagePermissionGuard pageKey="spend-and-save">
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
              Spend & Save
            </h1>

            <p className="max-w-xl text-sm text-[#525866]/80">
              View users&apos; Spend & Save accounts, saved balances,
              contribution percentages, and account status.
            </p>
          </div>

          {!isLoading && !isError && meta.total > 0 && (
            <div className="self-start md:self-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#68123D]/15 bg-[#68123D]/10 px-3.5 py-1.5 text-xs font-semibold text-[#68123D] shadow-sm backdrop-blur-md">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#68123D]" />
                {meta.total} Spend & Save Accounts
              </span>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* SUMMARY CARDS */}
        {/* ========================================================= */}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* TOTAL ACCOUNTS */}
            <div className="rounded-2xl border border-white/70 bg-white/50 p-5 shadow-sm backdrop-blur-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Total Accounts
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

            {/* ENABLED */}
            <div className="rounded-2xl border border-white/70 bg-white/50 p-5 shadow-sm backdrop-blur-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400">Enabled</p>

                  <p className="mt-2 text-2xl font-bold text-emerald-600">
                    {enabledCount}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>

            {/* DISABLED */}
            <div className="rounded-2xl border border-white/70 bg-white/50 p-5 shadow-sm backdrop-blur-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400">Disabled</p>

                  <p className="mt-2 text-2xl font-bold text-gray-600">
                    {disabledCount}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                  <HiOutlineX size={19} />
                </div>
              </div>
            </div>

            {/* TOTAL BALANCE */}
            <div className="rounded-2xl border border-white/70 bg-white/50 p-5 shadow-sm backdrop-blur-lg">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-400">
                    Total Saved
                  </p>

                  <p className="mt-2 truncate text-2xl font-bold text-gray-900">
                    {fmtMoney(totalBalance)}
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#68123D]/10 text-[#68123D]">
                  <HiOutlineCurrencyDollar size={19} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SEARCH + PAGINATION SIZE */}
        {/* ========================================================= */}

        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/45 p-4 shadow-sm backdrop-blur-md lg:flex-row">
          <div className="relative w-full lg:max-w-md">
            <HiOutlineSearch
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search user, email, phone, ID..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-200/50 bg-white/40 py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none shadow-inner transition-all placeholder:text-gray-400 hover:bg-white/60 focus:border-[#68123D]/40 focus:bg-white/80 focus:ring-4 focus:ring-[#68123D]/5"
            />
          </div>

          <div className="flex w-full items-center justify-end gap-3 lg:w-auto">
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
              Loading Spend & Save accounts...
            </p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100/50 bg-red-50/20 px-4 py-16 text-center shadow-sm backdrop-blur-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-100/30 bg-red-50 text-red-500">
              <HiOutlineX size={22} />
            </div>

            <h3 className="mb-1 text-sm font-semibold text-red-900">
              Failed to load Spend & Save
            </h3>

            <p className="mb-5 max-w-xs text-xs text-red-700/80">
              There was an issue fetching the Spend & Save records. Please try
              again.
            </p>

            <button
              onClick={() => refetch()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#68123D] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#68123D]/95 active:bg-[#68123D]"
            >
              <HiOutlineRefresh size={14} />
              Retry Connection
            </button>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/60 bg-white/45 px-4 py-24 text-center shadow-sm backdrop-blur-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gray-100/50 bg-gray-50 text-gray-400">
              <HiOutlineSearch size={20} />
            </div>

            <h3 className="mb-1 text-sm font-semibold text-gray-800">
              No Spend & Save accounts found
            </h3>

            <p className="max-w-xs text-xs text-gray-400">
              There are no Spend & Save records matching your search.
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

                      <th className="px-6 py-4 font-medium">Saved Balance</th>

                      <th className="px-6 py-4 font-medium">Percentage</th>

                      <th className="px-6 py-4 font-medium">Status</th>

                      <th className="px-6 py-4 font-medium">Created</th>

                      <th className="px-6 py-4 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100/30 text-sm">
                    {filteredRecords.map((record) => {
                      const statusStyle = getEnabledStyles(record.isEnabled);

                      return (
                        <tr
                          key={record.id}
                          className="group border-b border-gray-100/40 transition-all duration-150 last:border-0 hover:bg-white/45"
                        >
                          {/* ID */}
                          <td className="px-6 py-4">
                            <span className="rounded-md border border-gray-100/30 bg-gray-50/50 px-2 py-1 font-mono text-xs text-gray-400 transition-all group-hover:bg-white">
                              {record.id.substring(0, 8)}...
                            </span>
                          </td>

                          {/* USER */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#68123D]/10 bg-gradient-to-br from-[#68123D]/10 to-[#68123D]/5 text-xs font-bold text-[#68123D] shadow-sm transition-transform duration-200 group-hover:scale-105">
                                {getInitials(
                                  record.user?.first_name,
                                  record.user?.last_name,
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="text-sm font-semibold leading-tight text-gray-800">
                                  {getFullName(record.user)}
                                </div>

                                <div className="mt-0.5 max-w-[180px] truncate text-xs text-gray-400">
                                  {record.user?.email || "No email"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* BALANCE */}
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-950">
                              {fmtMoney(record.balance)}
                            </span>
                          </td>

                          {/* PERCENTAGE */}
                          <td className="px-6 py-4">
                            <div className="inline-flex items-center rounded-full border border-[#68123D]/10 bg-[#68123D]/5 px-3 py-1.5 text-xs font-bold text-[#68123D]">
                              {record.percentage}%
                            </div>
                          </td>

                          {/* STATUS */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyle.wrapper}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                              />

                              {record.isEnabled ? "Enabled" : "Disabled"}
                            </span>
                          </td>

                          {/* CREATED */}
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-700">
                              {formatDate(record.createdAt)}
                            </div>

                            <div className="mt-0.5 text-xs text-gray-400">
                              {formatDateTime(record.createdAt)}
                            </div>
                          </td>

                          {/* ACTION */}
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setSelectedSpendAndSave(record)}
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
                  Page {meta.page} of {meta.totalPages || 1} ({meta.total}{" "}
                  total)
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
              {filteredRecords.map((record) => {
                const statusStyle = getEnabledStyles(record.isEnabled);

                return (
                  <div
                    key={record.id}
                    className="space-y-4 rounded-2xl border border-white/70 bg-white/60 p-5 shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-white/80"
                  >
                    {/* USER */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#68123D]/10 bg-gradient-to-br from-[#68123D]/10 to-[#68123D]/5 text-xs font-bold text-[#68123D] shadow-sm">
                          {getInitials(
                            record.user?.first_name,
                            record.user?.last_name,
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold leading-tight text-gray-800">
                            {getFullName(record.user)}
                          </h3>

                          <p className="mt-0.5 truncate text-xs text-gray-400">
                            {record.user?.email || "No email"}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-md border border-gray-100/30 bg-gray-100/50 px-2 py-1 font-mono text-[10px] text-gray-400">
                        #{record.id.substring(0, 8)}
                      </span>
                    </div>

                    {/* DETAILS */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-b border-t border-gray-100/50 py-4 text-xs">
                      <div>
                        <span className="block font-medium text-gray-400">
                          Saved Balance
                        </span>

                        <span className="mt-0.5 block text-lg font-bold text-gray-950">
                          {fmtMoney(record.balance)}
                        </span>
                      </div>

                      <div>
                        <span className="block font-medium text-gray-400">
                          Percentage
                        </span>

                        <span className="mt-0.5 block font-semibold text-[#68123D]">
                          {record.percentage}%
                        </span>
                      </div>

                      <div>
                        <span className="block font-medium text-gray-400">
                          User ID
                        </span>

                        <span className="mt-0.5 block truncate font-mono text-[10px] font-medium text-gray-600">
                          {record.userId}
                        </span>
                      </div>

                      <div>
                        <span className="block font-medium text-gray-400">
                          Created
                        </span>

                        <span className="mt-0.5 block font-semibold text-gray-700">
                          {formatDate(record.createdAt)}
                        </span>
                      </div>

                      <div>
                        <span className="block font-medium text-gray-400">
                          Last Updated
                        </span>

                        <span className="mt-0.5 block font-semibold text-gray-700">
                          {formatDate(record.updatedAt)}
                        </span>
                      </div>
                    </div>

                    {/* STATUS */}
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyle.wrapper}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                        />

                        {record.isEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>

                    {/* ACTION */}
                    <button
                      onClick={() => setSelectedSpendAndSave(record)}
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

        {selectedSpendAndSave && (
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
                    Spend & Save Details
                  </h2>

                  <div className="flex items-center gap-1.5 font-mono text-xs text-gray-400">
                    <span>ID:</span>

                    <span className="max-w-[220px] truncate rounded bg-gray-100/80 px-1.5 py-0.5 font-medium text-gray-500">
                      {selectedSpendAndSave.id}
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
                        {getFullName(selectedSpendAndSave.user)}
                      </span>
                    </div>

                    <div>
                      <span className="mb-0.5 block font-medium text-gray-400">
                        Email Address
                      </span>

                      <span className="break-all text-sm font-semibold text-gray-800">
                        {selectedSpendAndSave.user?.email || "N/A"}
                      </span>
                    </div>

                    <div>
                      <span className="mb-0.5 block font-medium text-gray-400">
                        Phone Number
                      </span>

                      <span className="text-sm font-semibold text-gray-800">
                        {selectedSpendAndSave.user?.phone || "N/A"}
                      </span>
                    </div>

                    <div>
                      <span className="mb-0.5 block font-medium text-gray-400">
                        User ID
                      </span>

                      <span className="break-all font-mono text-xs font-medium text-gray-600">
                        {selectedSpendAndSave.userId}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ================================================= */}
                {/* SPEND & SAVE INFORMATION */}
                {/* ================================================= */}

                <div className="space-y-4 rounded-2xl border border-gray-100/60 bg-white/40 p-5 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
                    <div className="rounded-lg bg-[#68123D]/5 p-1.5 text-[#68123D]">
                      <HiOutlineCurrencyDollar size={16} />
                    </div>

                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Spend & Save Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-5 text-xs sm:grid-cols-2">
                    {/* BALANCE */}
                    <div>
                      <span className="mb-0.5 block font-medium text-gray-400">
                        Saved Balance
                      </span>

                      <span className="text-2xl font-bold text-gray-900">
                        {fmtMoney(selectedSpendAndSave.balance)}
                      </span>
                    </div>

                    {/* PERCENTAGE */}
                    <div>
                      <span className="mb-0.5 block font-medium text-gray-400">
                        Savings Percentage
                      </span>

                      <span className="text-2xl font-bold text-[#68123D]">
                        {selectedSpendAndSave.percentage}%
                      </span>
                    </div>

                    {/* STATUS */}
                    <div>
                      <span className="mb-1 block font-medium text-gray-400">
                        Account Status
                      </span>

                      {(() => {
                        const styles = getEnabledStyles(
                          selectedSpendAndSave.isEnabled,
                        );

                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles.wrapper}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
                            />

                            {selectedSpendAndSave.isEnabled
                              ? "Enabled"
                              : "Disabled"}
                          </span>
                        );
                      })()}
                    </div>

                    {/* USER ID */}
                    <div>
                      <span className="mb-0.5 block font-medium text-gray-400">
                        User ID
                      </span>

                      <span className="break-all font-mono text-xs font-medium text-gray-600">
                        {selectedSpendAndSave.userId}
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
                      Account Status
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                    <div>
                      <span className="mb-1 block font-medium text-gray-400">
                        Current Status
                      </span>

                      {(() => {
                        const styles = getEnabledStyles(
                          selectedSpendAndSave.isEnabled,
                        );

                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles.wrapper}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
                            />

                            {selectedSpendAndSave.isEnabled
                              ? "Enabled"
                              : "Disabled"}
                          </span>
                        );
                      })()}
                    </div>

                    <div>
                      <span className="mb-0.5 block font-medium text-gray-400">
                        Savings Percentage
                      </span>

                      <span className="text-sm font-bold text-[#68123D]">
                        {selectedSpendAndSave.percentage}%
                      </span>
                    </div>

                    <div>
                      <span className="mb-0.5 block font-medium text-gray-400">
                        Created At
                      </span>

                      <span className="text-sm font-semibold text-gray-800">
                        {formatDateTime(selectedSpendAndSave.createdAt)}
                      </span>
                    </div>

                    <div>
                      <span className="mb-0.5 block font-medium text-gray-400">
                        Last Updated
                      </span>

                      <span className="text-sm font-semibold text-gray-800">
                        {formatDateTime(selectedSpendAndSave.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ================================================= */}
                {/* SAVINGS SUMMARY */}
                {/* ================================================= */}

                <div className="space-y-4 rounded-2xl border border-gray-100/60 bg-white/40 p-5 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
                    <div className="rounded-lg bg-[#68123D]/5 p-1.5 text-[#68123D]">
                      <HiOutlineCurrencyDollar size={16} />
                    </div>

                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Savings Summary
                    </h3>
                  </div>

                  <div className="rounded-2xl border border-[#68123D]/10 bg-[#68123D]/5 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Current Saved Balance
                        </p>

                        <p className="mt-1 text-2xl font-bold text-gray-900">
                          {fmtMoney(selectedSpendAndSave.balance)}
                        </p>
                      </div>

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#68123D] shadow-sm">
                        <HiOutlineCurrencyDollar size={22} />
                      </div>
                    </div>

                    <div className="mt-5 border-t border-[#68123D]/10 pt-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">
                          Automatic savings rate
                        </span>

                        <span className="font-bold text-[#68123D]">
                          {selectedSpendAndSave.percentage}%
                        </span>
                      </div>
                    </div>
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
