"use client";

import React, { useState } from "react";
import {
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineShieldCheck,
  HiOutlineIdentification,
  HiOutlineUsers,
  HiOutlineCash,
  HiOutlineClock,
  HiOutlineLockClosed,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
  HiOutlineClipboardCopy,
} from "react-icons/hi";

import {
  useGetAjoGroupsQuery,
  AjoGroup,
} from "@/services/padiApi/adminApi";

export default function AjoGroupsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedGroup, setSelectedGroup] = useState<AjoGroup | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetAjoGroupsQuery({
    page,
    limit,
  });

  const groups = data?.data || [];

  const meta = data?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  /*
   * ---------------------------------------------------------
   * Helpers
   * ---------------------------------------------------------
   */

  const getInitials = (name?: string) => {
    if (!name) return "AG";

    const words = name.trim().split(" ");

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return `${words[0]?.charAt(0) || ""}${
      words[words.length - 1]?.charAt(0) || ""
    }`.toUpperCase();
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount === null || amount === undefined) {
      return "₦0";
    }

    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatFrequency = (frequency?: string) => {
    if (!frequency) return "N/A";

    switch (frequency) {
      case "DAILY":
        return "Daily";

      case "WEEKLY":
        return "Weekly";

      case "MONTHLY":
        return "Monthly";

      default:
        return frequency;
    }
  };

  const formatStatus = (status?: string) => {
    if (!status) return "Unknown";

    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusStyles = (status?: string) => {
    const normalized = status?.toUpperCase();

    switch (normalized) {
      case "ACTIVE":
      case "ACTIVATED":
      case "ONGOING":
        return {
          wrapper:
            "bg-emerald-50/70 text-emerald-700 border-emerald-100/60",
          dot: "bg-emerald-500",
        };

      case "PENDING":
      case "PENDING_ACTIVATION":
      case "WAITING":
        return {
          wrapper:
            "bg-amber-50/70 text-amber-700 border-amber-100/60",
          dot: "bg-amber-500",
        };

      case "COMPLETED":
        return {
          wrapper: "bg-blue-50/70 text-blue-700 border-blue-100/60",
          dot: "bg-blue-500",
        };

      case "CANCELLED":
      case "CANCELED":
      case "REJECTED":
      case "INACTIVE":
        return {
          wrapper: "bg-red-50/70 text-red-700 border-red-100/60",
          dot: "bg-red-500",
        };

      default:
        return {
          wrapper: "bg-gray-50/70 text-gray-600 border-gray-100/60",
          dot: "bg-gray-400",
        };
    }
  };

  const closeDetails = () => {
    setSelectedGroup(null);
    setCopiedCode(false);
  };

  const copyInviteCode = async (code?: string | null) => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);

      setTimeout(() => {
        setCopiedCode(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy invite code:", error);
    }
  };

  /*
   * ---------------------------------------------------------
   * Search + Filtering
   * ---------------------------------------------------------
   */

  const filteredGroups = groups.filter((group) => {
    const search = query.toLowerCase().trim();

    const groupName = group.name?.toLowerCase() || "";
    const description = group.description?.toLowerCase() || "";
    const inviteCode = group.inviteCode?.toLowerCase() || "";

    const adminName = group.admin
      ? `${group.admin.first_name || ""} ${
          group.admin.last_name || ""
        }`.toLowerCase()
      : "";

    const adminEmail = group.admin?.email?.toLowerCase() || "";
    const adminPhone = group.admin?.phone?.toLowerCase() || "";

    const matchesSearch =
      !search ||
      groupName.includes(search) ||
      description.includes(search) ||
      inviteCode.includes(search) ||
      adminName.includes(search) ||
      adminEmail.includes(search) ||
      adminPhone.includes(search);

    const matchesStatus =
      statusFilter === "ALL" ||
      group.status?.toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /*
   * ---------------------------------------------------------
   * Pagination
   * ---------------------------------------------------------
   */

  const goToPreviousPage = () => {
    if (page > 1) {
      setPage((current) => current - 1);
    }
  };

  const goToNextPage = () => {
    if (page < meta.totalPages) {
      setPage((current) => current + 1);
    }
  };

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <div className="space-y-8 font-satoshi relative">
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

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100/50 pb-5">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-[#181B25]">
            Ajo Groups
          </h1>

          <p className="text-sm text-[#525866]/80 max-w-xl">
            View and manage all Ajo savings groups created on PadiPay.
          </p>
        </div>

        {!isLoading && !isError && meta.total > 0 && (
          <div className="self-start md:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#68123D]/10 text-[#68123D] border border-[#68123D]/15 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#68123D]" />

              {meta.total} {meta.total === 1 ? "Group" : "Groups"}
            </span>
          </div>
        )}
      </div>

      {/* =====================================================
          SEARCH / FILTERS
      ===================================================== */}

      <div className="bg-white/45 backdrop-blur-md border border-white/60 p-4 rounded-2xl flex flex-col lg:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full lg:max-w-md">
          <HiOutlineSearch
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search by group, admin or invite code..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/40 border border-gray-200/50 hover:bg-white/60 focus:bg-white/80 focus:border-[#68123D]/40 focus:ring-4 focus:ring-[#68123D]/5 rounded-xl outline-none transition-all shadow-inner placeholder-gray-400 text-gray-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 self-end lg:self-auto">
          {/* Status Filter */}

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">
              Status
            </span>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-gray-200/50 p-2.5 rounded-xl bg-white/40 hover:bg-white/60 hover:border-gray-300 focus:border-[#68123D]/40 outline-none cursor-pointer transition-all font-medium text-gray-700 shadow-sm"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* Page Limit */}

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">
              Show
            </span>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="text-xs border border-gray-200/50 p-2.5 rounded-xl bg-white/40 hover:bg-white/60 hover:border-gray-300 focus:border-[#68123D]/40 outline-none cursor-pointer transition-all font-medium text-gray-700 shadow-sm"
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

      {/* =====================================================
          LOADING
      ===================================================== */}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-white/45 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-[#68123D] animate-spin mb-4" />

          <p className="text-sm font-medium text-gray-500">
            Loading Ajo groups...
          </p>
        </div>
      ) : isError ? (
        /* =====================================================
           ERROR
        ===================================================== */

        <div className="flex flex-col items-center justify-center py-16 px-4 bg-red-50/20 backdrop-blur-md border border-red-100/50 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 border border-red-100/30">
            <HiOutlineX size={22} />
          </div>

          <h3 className="text-sm font-semibold text-red-900 mb-1">
            Failed to load Ajo groups
          </h3>

          <p className="text-xs text-red-700/80 max-w-xs mb-5">
            There was an issue fetching Ajo groups from the server.
          </p>

          <button
            onClick={() => refetch()}
            className="bg-[#68123D] hover:bg-[#68123D]/95 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredGroups.length === 0 ? (
        /* =====================================================
           EMPTY
        ===================================================== */

        <div className="flex flex-col items-center justify-center py-24 px-4 bg-white/45 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mb-4 border border-gray-100/50">
            <HiOutlineSearch size={20} />
          </div>

          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            No Ajo groups found
          </h3>

          <p className="text-xs text-gray-400 max-w-xs">
            No Ajo groups match your current search or filter.
          </p>
        </div>
      ) : (
        <>
          {/* =================================================
              DESKTOP TABLE
          ================================================= */}

          <div className="hidden md:block bg-white/50 backdrop-blur-lg border border-white/70 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100/50 bg-gray-50/20 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-4.5 px-6 font-medium">
                      Group
                    </th>

                    <th className="py-4.5 px-6 font-medium">
                      Admin
                    </th>

                    <th className="py-4.5 px-6 font-medium">
                      Members
                    </th>

                    <th className="py-4.5 px-6 font-medium">
                      Contribution
                    </th>

                    <th className="py-4.5 px-6 font-medium">
                      Frequency
                    </th>

                    <th className="py-4.5 px-6 font-medium">
                      Status
                    </th>

                    <th className="py-4.5 px-6 font-medium">
                      Created
                    </th>

                    <th className="py-4.5 px-6 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100/30 text-sm">
                  {filteredGroups.map((group) => {
                    const statusStyles = getStatusStyles(group.status);

                    return (
                      <tr
                        key={group.id}
                        className="hover:bg-white/45 transition-all duration-150 border-b border-gray-100/40 last:border-0 group"
                      >
                        {/* Group */}

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3 min-w-[210px]">
                            {group.imageUrl ? (
                              <img
                                src={group.imageUrl}
                                alt={group.name}
                                className="w-10 h-10 rounded-xl object-cover border border-gray-100 shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-[#68123D]/10 text-[#68123D] flex items-center justify-center text-xs font-bold border border-[#68123D]/10">
                                {getInitials(group.name)}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="font-semibold text-[#181B25] truncate max-w-[180px]">
                                {group.name}
                              </p>

                              <p className="text-[11px] text-gray-400 truncate max-w-[180px]">
                                {group.privacy || "PUBLIC"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Admin */}

                        <td className="py-4 px-6">
                          {group.admin ? (
                            <div className="min-w-[170px]">
                              <p className="font-medium text-[#181B25] truncate">
                                {group.admin.first_name}{" "}
                                {group.admin.last_name}
                              </p>

                              <p className="text-[11px] text-gray-400 truncate">
                                {group.admin.email}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">
                              N/A
                            </span>
                          )}
                        </td>

                        {/* Members */}

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center border border-gray-100">
                              <HiOutlineUsers size={14} />
                            </div>

                            <span className="font-medium text-gray-700">
                              {group.groupSize}
                            </span>
                          </div>
                        </td>

                        {/* Contribution */}

                        <td className="py-4 px-6">
                          <div>
                            <p className="font-semibold text-[#181B25] whitespace-nowrap">
                              {formatCurrency(
                                group.contributionAmount
                              )}
                            </p>

                            <p className="text-[11px] text-gray-400">
                              per contribution
                            </p>
                          </div>
                        </td>

                        {/* Frequency */}

                        <td className="py-4 px-6">
                          <span className="text-xs font-medium text-gray-600">
                            {formatFrequency(group.frequency)}
                          </span>
                        </td>

                        {/* Status */}

                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold border ${statusStyles.wrapper}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`}
                            />

                            {formatStatus(group.status)}
                          </span>
                        </td>

                        {/* Created */}

                        <td className="py-4 px-6">
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDate(group.createdAt)}
                          </span>
                        </td>

                        {/* Actions */}

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedGroup(group)}
                            className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white px-3.5 py-2 rounded-xl text-[11px] font-semibold shadow-sm transition-all cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Desktop Pagination */}

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100/50">
              <p className="text-xs text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-600">
                  {filteredGroups.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-600">
                  {meta.total}
                </span>{" "}
                groups
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={page <= 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200/70 bg-white/50 text-gray-500 hover:bg-white hover:text-[#68123D] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <HiOutlineChevronLeft size={16} />
                </button>

                <div className="px-3 py-2 rounded-xl bg-[#68123D]/5 text-[#68123D] text-xs font-semibold">
                  Page {meta.page} of {meta.totalPages || 1}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={page >= meta.totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200/70 bg-white/50 text-gray-500 hover:bg-white hover:text-[#68123D] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <HiOutlineChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* =================================================
              MOBILE CARDS
          ================================================= */}

          <div className="md:hidden space-y-4">
            {filteredGroups.map((group) => {
              const statusStyles = getStatusStyles(group.status);

              return (
                <div
                  key={group.id}
                  className="bg-white/50 backdrop-blur-lg border border-white/70 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-5"
                >
                  {/* Header */}

                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3 min-w-0">
                      {group.imageUrl ? (
                        <img
                          src={group.imageUrl}
                          alt={group.name}
                          className="w-11 h-11 rounded-xl object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-[#68123D]/10 text-[#68123D] flex items-center justify-center text-xs font-bold border border-[#68123D]/10 shrink-0">
                          {getInitials(group.name)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-[#181B25] truncate">
                          {group.name}
                        </h3>

                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Created {formatDate(group.createdAt)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold border shrink-0 ${statusStyles.wrapper}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`}
                      />

                      {formatStatus(group.status)}
                    </span>
                  </div>

                  {/* Admin */}

                  <div className="p-3 rounded-xl bg-white/40 border border-gray-100/50 mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <HiOutlineUser
                        size={14}
                        className="text-gray-400"
                      />

                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                        Admin
                      </span>
                    </div>

                    <p className="text-xs font-medium text-gray-700">
                      {group.admin
                        ? `${group.admin.first_name} ${group.admin.last_name}`
                        : "N/A"}
                    </p>

                    {group.admin?.email && (
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                        {group.admin.email}
                      </p>
                    )}
                  </div>

                  {/* Stats */}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/40 border border-gray-100/50">
                      <div className="flex items-center gap-2 mb-1">
                        <HiOutlineUsers
                          size={14}
                          className="text-gray-400"
                        />

                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                          Members
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-gray-700">
                        {group.groupSize}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/40 border border-gray-100/50">
                      <div className="flex items-center gap-2 mb-1">
                        <HiOutlineCash
                          size={14}
                          className="text-gray-400"
                        />

                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                          Contribution
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-gray-700">
                        {formatCurrency(group.contributionAmount)}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/40 border border-gray-100/50">
                      <div className="flex items-center gap-2 mb-1">
                        <HiOutlineClock
                          size={14}
                          className="text-gray-400"
                        />

                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                          Frequency
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-gray-700">
                        {formatFrequency(group.frequency)}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/40 border border-gray-100/50">
                      <div className="flex items-center gap-2 mb-1">
                        <HiOutlineCash
                          size={14}
                          className="text-gray-400"
                        />

                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                          Target
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-gray-700">
                        {formatCurrency(group.targetAmount)}
                      </p>
                    </div>
                  </div>

                  {/* View */}

                  <button
                    onClick={() => setSelectedGroup(group)}
                    className="w-full mt-4 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    View Group Details
                  </button>
                </div>
              );
            })}

            {/* Mobile Pagination */}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={goToPreviousPage}
                disabled={page <= 1}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200/70 bg-white/50 text-gray-500 hover:bg-white hover:text-[#68123D] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <HiOutlineChevronLeft size={16} />
              </button>

              <div className="px-3 py-2 rounded-xl bg-[#68123D]/5 text-[#68123D] text-xs font-semibold">
                Page {meta.page} of {meta.totalPages || 1}
              </div>

              <button
                onClick={goToNextPage}
                disabled={page >= meta.totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200/70 bg-white/50 text-gray-500 hover:bg-white hover:text-[#68123D] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <HiOutlineChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* =====================================================
          GROUP DETAILS DRAWER
      ===================================================== */}

      {selectedGroup && (
        <>
          {/* Backdrop */}

          <div
            className="fixed inset-0 bg-black/15 backdrop-blur-md z-40"
            onClick={closeDetails}
          />

          {/* Drawer */}

          <div className="fixed top-4 right-4 bottom-4 w-[calc(100%-2rem)] md:w-full md:max-w-xl bg-white/75 backdrop-blur-2xl border border-white/50 shadow-[0_24px_60px_rgba(0,0,0,0.12)] rounded-3xl z-50 flex flex-col overflow-hidden drawer-animate text-sm text-[#181B25]">
            {/* Drawer Header */}

            <div className="px-6 py-5 border-b border-gray-100/60">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {selectedGroup.imageUrl ? (
                    <img
                      src={selectedGroup.imageUrl}
                      alt={selectedGroup.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-gray-100 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-[#68123D]/10 text-[#68123D] flex items-center justify-center font-bold border border-[#68123D]/10">
                      {getInitials(selectedGroup.name)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-[#181B25] truncate">
                      {selectedGroup.name}
                    </h2>

                    <p className="text-xs text-gray-400 mt-0.5">
                      Ajo Group
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeDetails}
                  className="w-9 h-9 rounded-xl bg-gray-100/70 hover:bg-gray-200/70 text-gray-500 flex items-center justify-center transition-all cursor-pointer shrink-0"
                >
                  <HiOutlineX size={17} />
                </button>
              </div>
            </div>

            {/* Drawer Body */}

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Status */}

              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/50 border border-gray-100/60">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">
                    Group Status
                  </p>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold border ${
                      getStatusStyles(selectedGroup.status).wrapper
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        getStatusStyles(selectedGroup.status).dot
                      }`}
                    />

                    {formatStatus(selectedGroup.status)}
                  </span>
                </div>

                <HiOutlineCheckCircle
                  size={22}
                  className="text-[#68123D]/60"
                />
              </div>

              {/* Description */}

              {selectedGroup.description && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <HiOutlineInformationCircle
                      size={16}
                      className="text-gray-400"
                    />

                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Description
                    </h3>
                  </div>

                  <div className="bg-white/45 border border-gray-100/60 rounded-2xl p-4">
                    <p className="text-xs leading-5 text-gray-500">
                      {selectedGroup.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Group Information */}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineUsers
                    size={16}
                    className="text-gray-400"
                  />

                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Group Information
                  </h3>
                </div>

                <div className="bg-white/45 border border-gray-100/60 rounded-2xl overflow-hidden">
                  <DetailRow
                    icon={<HiOutlineUsers size={15} />}
                    label="Group Size"
                    value={`${selectedGroup.groupSize} members`}
                  />

                  <DetailRow
                    icon={<HiOutlineLockClosed size={15} />}
                    label="Privacy"
                    value={selectedGroup.privacy || "N/A"}
                  />

                  <DetailRow
                    icon={<HiOutlineShieldCheck size={15} />}
                    label="Requires Approval"
                    value={
                      selectedGroup.requiresApproval
                        ? "Yes"
                        : "No"
                    }
                  />

                  <DetailRow
                    icon={<HiOutlineClock size={15} />}
                    label="Frequency"
                    value={formatFrequency(
                      selectedGroup.frequency
                    )}
                  />

                  <DetailRow
                    icon={<HiOutlineCalendar size={15} />}
                    label="Contribution Schedule"
                    value={
                      selectedGroup.contributionSchedule ||
                      "N/A"
                    }
                  />

                  <DetailRow
                    icon={<HiOutlineIdentification size={15} />}
                    label="Total Cycles"
                    value={
                      selectedGroup.totalCycles?.toString() ||
                      "N/A"
                    }
                    last
                  />
                </div>
              </div>

              {/* Financial Information */}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineCash
                    size={16}
                    className="text-gray-400"
                  />

                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Financial Information
                  </h3>
                </div>

                <div className="bg-white/45 border border-gray-100/60 rounded-2xl overflow-hidden">
                  <DetailRow
                    icon={<HiOutlineCash size={15} />}
                    label="Contribution Amount"
                    value={formatCurrency(
                      selectedGroup.contributionAmount
                    )}
                  />

                  <DetailRow
                    icon={<HiOutlineCash size={15} />}
                    label="Target Amount"
                    value={formatCurrency(
                      selectedGroup.targetAmount
                    )}
                    last
                  />
                </div>
              </div>

              {/* Group Admin */}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineUser
                    size={16}
                    className="text-gray-400"
                  />

                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Group Admin
                  </h3>
                </div>

                <div className="bg-white/45 border border-gray-100/60 rounded-2xl overflow-hidden">
                  <DetailRow
                    icon={<HiOutlineUser size={15} />}
                    label="Name"
                    value={
                      selectedGroup.admin
                        ? `${selectedGroup.admin.first_name} ${selectedGroup.admin.last_name}`
                        : "N/A"
                    }
                  />

                  <DetailRow
                    icon={<HiOutlineMail size={15} />}
                    label="Email"
                    value={selectedGroup.admin?.email || "N/A"}
                  />

                  <DetailRow
                    icon={<HiOutlinePhone size={15} />}
                    label="Phone"
                    value={selectedGroup.admin?.phone || "N/A"}
                    last
                  />
                </div>
              </div>

              {/* Invite Code */}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineIdentification
                    size={16}
                    className="text-gray-400"
                  />

                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Invite Code
                  </h3>
                </div>

                <div className="flex items-center justify-between gap-3 bg-white/45 border border-gray-100/60 rounded-2xl p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold tracking-wider text-[#68123D] break-all">
                      {selectedGroup.inviteCode || "N/A"}
                    </p>
                  </div>

                  {selectedGroup.inviteCode && (
                    <button
                      onClick={() =>
                        copyInviteCode(
                          selectedGroup.inviteCode
                        )
                      }
                      className="w-9 h-9 rounded-xl bg-gray-100/70 hover:bg-gray-200/70 text-gray-500 flex items-center justify-center transition-all cursor-pointer shrink-0"
                      title="Copy invite code"
                    >
                      {copiedCode ? (
                        <HiOutlineCheckCircle
                          size={16}
                          className="text-emerald-500"
                        />
                      ) : (
                        <HiOutlineClipboardCopy size={16} />
                      )}
                    </button>
                  )}
                </div>

                {copiedCode && (
                  <p className="text-[10px] text-emerald-600 mt-2 ml-1">
                    Invite code copied to clipboard.
                  </p>
                )}
              </div>

              {/* Dates */}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineCalendar
                    size={16}
                    className="text-gray-400"
                  />

                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Activity
                  </h3>
                </div>

                <div className="bg-white/45 border border-gray-100/60 rounded-2xl overflow-hidden">
                  <DetailRow
                    icon={<HiOutlineCalendar size={15} />}
                    label="Created"
                    value={formatDate(
                      selectedGroup.createdAt
                    )}
                  />

                  <DetailRow
                    icon={<HiOutlineCalendar size={15} />}
                    label="Last Updated"
                    value={formatDate(
                      selectedGroup.updatedAt
                    )}
                    last
                  />
                </div>
              </div>

              {/* IDs */}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineIdentification
                    size={16}
                    className="text-gray-400"
                  />

                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Identifiers
                  </h3>
                </div>

                <div className="bg-white/45 border border-gray-100/60 rounded-2xl overflow-hidden">
                  <DetailRow
                    icon={<HiOutlineIdentification size={15} />}
                    label="Group ID"
                    value={selectedGroup.id}
                  />

                  <DetailRow
                    icon={<HiOutlineIdentification size={15} />}
                    label="Admin ID"
                    value={selectedGroup.adminId}
                    last
                  />
                </div>
              </div>
            </div>

            {/* Drawer Footer */}

            <div className="px-6 py-4 border-t border-gray-100/60 bg-white/30">
              <button
                onClick={closeDetails}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-3 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


function DetailRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3.5 ${
        !last ? "border-b border-gray-100/50" : ""
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center shrink-0 border border-gray-100/50">
          {icon}
        </div>

        <span className="text-xs text-gray-400 font-medium">
          {label}
        </span>
      </div>

      <span className="text-xs font-semibold text-gray-700 text-right break-all max-w-[55%]">
        {value}
      </span>
    </div>
  );
}