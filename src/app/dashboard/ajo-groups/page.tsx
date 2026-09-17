"use client";

import React, { useState } from "react";
import {
  HiOutlineSearch,
  HiOutlineExternalLink,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { TbCurrencyNaira } from "react-icons/tb";

import {
  useGetAjoGroupsQuery,
  useGetAjoGroupDetailsQuery,
  AjoGroup,
  AjoGroupDetails,
} from "@/services/padiApi/adminApi";

import { PagePermissionGuard } from "@/components/AuthGuard";

export default function AjoGroupsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    null
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetAjoGroupsQuery({
    page,
    limit,
  });

  const {
    data: selectedGroupData,
    isLoading: isLoadingDetails,
    isError: isDetailsError,
    refetch: refetchDetails,
  } = useGetAjoGroupDetailsQuery(
    selectedGroupId as string,
    {
      skip: !selectedGroupId,
    }
  );

  const groups = data?.data || [];
  console.log("groups", groups);

  const meta = data?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  const selectedGroup = selectedGroupData?.data;

  const filtered = groups.filter((group) => {
    const search = query.toLowerCase().trim();

    if (!search) return true;

    return (
      group.name?.toLowerCase().includes(search) ||
      group.description?.toLowerCase().includes(search) ||
      group.status?.toLowerCase().includes(search) ||
      group.privacy?.toLowerCase().includes(search) ||
      group.admin?.first_name?.toLowerCase().includes(search) ||
      group.admin?.last_name?.toLowerCase().includes(search) ||
      group.admin?.email?.toLowerCase().includes(search) ||
      group.id?.toLowerCase().includes(search)
    );
  });

  const fmt = (value?: number | string | null) => {
    if (value == null) return "₦0";

    const amount = Number(value);

    if (Number.isNaN(amount)) return "₦0";

    return `₦${amount.toLocaleString("en-NG")}`;
  };

  const getInitials = (first?: string, last?: string) => {
    const f = first ? first.charAt(0) : "";
    const l = last ? last.charAt(0) : "";

    return `${f}${l}`.toUpperCase() || "AG";
  };

  const formatStatus = (status?: string) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatFrequency = (frequency?: string) => {
    if (!frequency) return "Not specified";

    return (
      frequency.charAt(0).toUpperCase() +
      frequency.slice(1).toLowerCase()
    );
  };

  const getStatusClass = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      case "PENDING_ACTIVATION":
        return "bg-amber-50 text-amber-700 border-amber-100";

      case "COMPLETED":
        return "bg-blue-50 text-blue-700 border-blue-100";

      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-100";

      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date?: string) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const openDetails = (group: AjoGroup) => {
    setSelectedGroupId(group.id);
  };

  const closeDetails = () => {
    setSelectedGroupId(null);
  };

  return (
    <PagePermissionGuard pageKey="ajo">
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
        ====================================================== */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100/50 pb-5">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-[#181B25]">
              Ajo Groups
            </h1>

            <p className="text-sm text-[#525866]/80 max-w-xl">
              Review Ajo groups, members, contributions, cycles, payouts,
              and group settings.
            </p>
          </div>

          {!isLoading && !isError && meta.total > 0 && (
            <div className="self-start md:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#68123D]/10 text-[#68123D] border border-[#68123D]/15 backdrop-blur-md shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#68123D] animate-pulse" />

                {meta.total} Ajo Group{meta.total === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </div>

        <div className="bg-white/45 backdrop-blur-md border border-white/60 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
          <div className="relative w-full sm:max-w-md">
            <HiOutlineSearch
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search Ajo group or admin..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/40 border border-gray-200/50 hover:bg-white/60 focus:bg-white/80 focus:border-[#68123D]/40 focus:ring-4 focus:ring-[#68123D]/5 rounded-xl outline-none transition-all shadow-inner placeholder-gray-400 text-gray-800"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
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
              {[5, 10, 20].map((value) => (
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

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 bg-white/45 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm">
            <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-[#68123D] animate-spin mb-4" />

            <p className="text-sm font-medium text-gray-500">
              Loading Ajo groups...
            </p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-red-50/20 backdrop-blur-md border border-red-100/50 rounded-2xl shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 border border-red-100/30">
              <HiOutlineX size={22} />
            </div>

            <h3 className="text-sm font-semibold text-red-900 mb-1">
              Failed to load Ajo groups
            </h3>

            <p className="text-xs text-red-700/80 max-w-xs mb-5">
              There was an issue fetching the Ajo groups. Please try again.
            </p>

            <button
              onClick={() => refetch()}
              className="bg-[#68123D] hover:bg-[#68123D]/95 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 bg-white/45 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mb-4 border border-gray-100/50">
              <HiOutlineSearch size={20} />
            </div>

            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              No Ajo groups found
            </h3>

            <p className="text-xs text-gray-400 max-w-xs">
              No Ajo groups match your current search.
            </p>
          </div>
        ) : (
          <>
            {/* =================================================
                DESKTOP TABLE
            ================================================== */}

            <div className="hidden md:block bg-white/50 backdrop-blur-lg border border-white/70 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100/50 bg-gray-50/20 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="py-4.5 px-6 font-medium">
                        Group ID
                      </th>

                      <th className="py-4.5 px-6 font-medium">
                        Ajo Group
                      </th>

                      <th className="py-4.5 px-6 font-medium">
                        Admin
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
                    {filtered.map((group) => (
                      <tr
                        key={group.id}
                        className="hover:bg-white/45 transition-all duration-150 border-b border-gray-100/40 last:border-0 group"
                      >
                        {/* GROUP ID */}

                        <td className="py-4.5 px-6">
                          <span className="text-xs font-mono text-gray-400 bg-gray-50/50 px-2 py-1 rounded-md border border-gray-100/30 group-hover:bg-white transition-all">
                            {group.id.substring(0, 8)}...
                          </span>
                        </td>

                        {/* GROUP */}

                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#68123D]/10 text-[#68123D] flex items-center justify-center border border-[#68123D]/10 shadow-sm transition-transform duration-200 group-hover:scale-105">
                              <HiOutlineUsers size={17} />
                            </div>

                            <div className="min-w-0">
                              <div className="font-semibold text-gray-800 text-sm leading-tight truncate max-w-[180px]">
                                {group.name}
                              </div>

                              <div className="text-xs text-gray-400 mt-0.5">
                                Ajo savings group
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* ADMIN */}

                        <td className="py-4.5 px-6">
                          {group.admin ? (
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#68123D]/10 text-[#68123D] flex items-center justify-center text-[10px] font-bold border border-[#68123D]/10">
                                {getInitials(
                                  group.admin.first_name,
                                  group.admin.last_name
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="font-semibold text-gray-700 truncate max-w-[150px]">
                                  {group.admin.first_name}{" "}
                                  {group.admin.last_name}
                                </div>

                                <div className="text-xs text-gray-400 truncate max-w-[150px]">
                                  {group.admin.email}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs font-mono text-gray-400">
                              {group.adminId
                                ? `${group.adminId.substring(0, 8)}...`
                                : "N/A"}
                            </span>
                          )}
                        </td>

                        {/* STATUS */}

                        <td className="py-4.5 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusClass(
                              group.status
                            )}`}
                          >
                            {formatStatus(group.status)}
                          </span>
                        </td>

                        {/* CREATED */}

                        <td className="py-4.5 px-6">
                          <span className="text-xs font-medium text-gray-600">
                            {formatDate(group.createdAt)}
                          </span>
                        </td>

                        {/* ACTION */}

                        <td className="py-4.5 px-6 text-right">
                          <button
                            onClick={() => openDetails(group)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-950 transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer border-0"
                          >
                            View Group

                            <HiOutlineExternalLink
                              size={13}
                              className="opacity-80"
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}

              <div className="px-6 py-4.5 bg-white/20 border-t border-gray-100/50 flex items-center justify-between text-xs text-gray-500 font-medium">
                <span>
                  Page {meta.page} of {meta.totalPages} ({meta.total} total)
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setPage((p) => Math.max(1, p - 1))
                    }
                    disabled={page === 1}
                    className="p-2 bg-white/50 border border-gray-200/50 hover:bg-white hover:border-gray-300 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 shadow-sm cursor-pointer"
                  >
                    <HiOutlineChevronLeft size={16} />
                  </button>

                  <button
                    onClick={() =>
                      setPage((p) =>
                        Math.min(meta.totalPages, p + 1)
                      )
                    }
                    disabled={
                      page >= meta.totalPages ||
                      meta.totalPages === 0
                    }
                    className="p-2 bg-white/50 border border-gray-200/50 hover:bg-white hover:border-gray-300 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 shadow-sm cursor-pointer"
                  >
                    <HiOutlineChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* =================================================
                MOBILE CARDS
            ================================================== */}

            <div className="space-y-4 md:hidden mt-6">
              {filtered.map((group) => (
                <div
                  key={group.id}
                  className="bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl p-5 shadow-sm space-y-4 hover:bg-white/80 transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-[#68123D]/10 text-[#68123D] flex items-center justify-center border border-[#68123D]/10">
                        <HiOutlineUsers size={18} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm leading-tight truncate">
                          {group.name}
                        </h3>

                        <p className="text-xs text-gray-400 mt-0.5">
                          Ajo savings group
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 text-[10px] font-mono text-gray-400 bg-gray-100/50 px-2 py-1 rounded-md border border-gray-100/30">
                      #{group.id.substring(0, 8)}
                    </span>
                  </div>

                  {/* ADMIN */}

                  <div className="flex items-center gap-3 border-t border-gray-100/50 pt-3">
                    {group.admin ? (
                      <>
                        <div className="w-8 h-8 rounded-full bg-[#68123D]/10 text-[#68123D] flex items-center justify-center text-[10px] font-bold border border-[#68123D]/10">
                          {getInitials(
                            group.admin.first_name,
                            group.admin.last_name
                          )}
                        </div>

                        <div className="min-w-0">
                          <span className="text-[10px] text-gray-400 block font-medium uppercase tracking-wider">
                            Group Admin
                          </span>

                          <span className="font-semibold text-gray-700 text-xs truncate block">
                            {group.admin.first_name}{" "}
                            {group.admin.last_name}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div>
                        <span className="text-[10px] text-gray-400 block font-medium uppercase tracking-wider">
                          Admin ID
                        </span>

                        <span className="font-mono text-xs text-gray-600">
                          {group.adminId
                            ? `${group.adminId.substring(0, 12)}...`
                            : "N/A"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* DETAILS */}

                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 border-t border-b border-gray-100/50 py-3.5 text-xs">
                    <div>
                      <span className="text-gray-400 block font-medium">
                        Status
                      </span>

                      <span
                        className={`inline-flex mt-1 px-2 py-1 rounded-full text-[10px] font-semibold border ${getStatusClass(
                          group.status
                        )}`}
                      >
                        {formatStatus(group.status)}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block font-medium">
                        Created
                      </span>

                      <span className="font-semibold text-gray-700 mt-0.5 block">
                        {formatDate(group.createdAt)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openDetails(group)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-all shadow-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    View Group

                    <HiOutlineExternalLink size={13} />
                  </button>
                </div>
              ))}

              {/* MOBILE PAGINATION */}

              <div className="bg-white/45 backdrop-blur-md border border-white/60 p-4 rounded-2xl flex items-center justify-between text-xs text-gray-500 font-medium shadow-sm">
                <span>
                  Page {meta.page} of {meta.totalPages}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setPage((p) => Math.max(1, p - 1))
                    }
                    disabled={page === 1}
                    className="p-2.5 bg-white border border-gray-200/50 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 shadow-sm cursor-pointer"
                  >
                    <HiOutlineChevronLeft size={16} />
                  </button>

                  <button
                    onClick={() =>
                      setPage((p) =>
                        Math.min(meta.totalPages, p + 1)
                      )
                    }
                    disabled={
                      page >= meta.totalPages ||
                      meta.totalPages === 0
                    }
                    className="p-2.5 bg-white border border-gray-200/50 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 shadow-sm cursor-pointer"
                  >
                    <HiOutlineChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* =====================================================
            DETAILS DRAWER
        ====================================================== */}

        {selectedGroupId && (
          <>
            {/* BACKDROP */}

            <div
              className="fixed inset-0 bg-black/15 backdrop-blur-md z-40"
              onClick={closeDetails}
            />

            {/* DRAWER */}

            <div className="fixed top-4 right-4 bottom-4 w-[calc(100%-2rem)] md:w-full md:max-w-2xl bg-white/90 backdrop-blur-2xl border border-white/50 shadow-[0_24px_60px_rgba(0,0,0,0.12)] rounded-3xl z-50 flex flex-col overflow-hidden drawer-animate text-sm text-[#181B25]">

              <div className="flex justify-between items-center border-b border-gray-100/50 p-6">
                <div className="space-y-1 min-w-0">
                  <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                    Ajo Group Details
                  </h2>

                  <div className="text-xs text-gray-400 font-mono truncate">
                    Group ID: {selectedGroupId}
                  </div>
                </div>

                <button
                  onClick={closeDetails}
                  className="shrink-0 p-2 bg-gray-100/50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-full transition-all border border-gray-200/20 cursor-pointer"
                >
                  <HiOutlineX size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {isLoadingDetails ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-[#68123D] animate-spin mb-4" />

                    <p className="text-sm font-medium text-gray-500">
                      Loading group details...
                    </p>
                  </div>
                ) : isDetailsError ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
                      <HiOutlineX size={22} />
                    </div>

                    <h3 className="text-sm font-semibold text-gray-800 mb-1">
                      Failed to load group
                    </h3>

                    <p className="text-xs text-gray-400 max-w-xs mb-5">
                      We could not retrieve the complete details for this
                      Ajo group.
                    </p>

                    <button
                      onClick={() => refetchDetails()}
                      className="bg-[#68123D] text-white px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Retry
                    </button>
                  </div>
                ) : selectedGroup ? (
                  <>

                    <div className="bg-[#68123D]/5 border border-[#68123D]/10 rounded-2xl p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#68123D]/10 text-[#68123D] flex items-center justify-center">
                          <HiOutlineUsers size={22} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {selectedGroup.name}
                            </h3>

                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getStatusClass(
                                selectedGroup.status
                              )}`}
                            >
                              {formatStatus(selectedGroup.status)}
                            </span>
                          </div>

                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {selectedGroup.description ||
                              "No description provided."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <DetailSection
                      icon={<HiOutlineUsers size={16} />}
                      title="Group Overview"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <DetailItem
                          label="Group Size"
                          value={`${selectedGroup.groupSize ?? 0} members`}
                        />

                        <DetailItem
                          label="Privacy"
                          value={
                            selectedGroup.privacy
                              ? formatStatus(selectedGroup.privacy)
                              : "N/A"
                          }
                        />

                        <DetailItem
                          label="Requires Approval"
                          value={
                            selectedGroup.requiresApproval
                              ? "Yes"
                              : "No"
                          }
                        />

                        <DetailItem
                          label="Created"
                          value={formatDate(selectedGroup.createdAt)}
                        />
                      </div>
                    </DetailSection>

                    <DetailSection
                      icon={<TbCurrencyNaira size={16} />}
                      title="Financial Details"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <DetailItem
                          label="Contribution"
                          value={fmt(
                            selectedGroup.contributionAmount
                          )}
                          highlight
                        />

                        <DetailItem
                          label="Target Amount"
                          value={fmt(selectedGroup.targetAmount)}
                          highlight
                        />

                        <DetailItem
                          label="Frequency"
                          value={formatFrequency(
                            selectedGroup.frequency
                          )}
                        />

                        <DetailItem
                          label="Total Cycles"
                          value={
                            selectedGroup.totalCycles != null
                              ? String(selectedGroup.totalCycles)
                              : "N/A"
                          }
                        />

                        <div className="col-span-2">
                          <DetailItem
                            label="Contribution Schedule"
                            value={
                              selectedGroup.contributionSchedule ||
                              "Not specified"
                            }
                          />
                        </div>
                      </div>
                    </DetailSection>

                    <DetailSection
                      icon={<HiOutlineUser size={16} />}
                      title="Group Admin"
                    >
                      {selectedGroup.admin ? (
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-[#68123D]/10 text-[#68123D] flex items-center justify-center text-xs font-bold border border-[#68123D]/10">
                            {getInitials(
                              selectedGroup.admin.first_name,
                              selectedGroup.admin.last_name
                            )}
                          </div>

                          <div>
                            <div className="font-semibold text-gray-800">
                              {selectedGroup.admin.first_name}{" "}
                              {selectedGroup.admin.last_name}
                            </div>

                            <div className="text-xs text-gray-400">
                              {selectedGroup.admin.email}
                            </div>

                            {selectedGroup.admin.phone && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                {selectedGroup.admin.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">
                          Admin information unavailable.
                        </div>
                      )}
                    </DetailSection>

                    <DetailSection
                      icon={<HiOutlineUsers size={16} />}
                      title={`Members (${
                        selectedGroup.ajoMembers?.length || 0
                      })`}
                    >
                      {selectedGroup.ajoMembers &&
                      selectedGroup.ajoMembers.length > 0 ? (
                        <div className="space-y-3">
                          {selectedGroup.ajoMembers.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between gap-3 p-3 bg-white/70 border border-gray-100 rounded-xl"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 shrink-0 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-bold">
                                  {getInitials(
                                    member.first_name,
                                    member.last_name
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <div className="font-semibold text-gray-700 text-xs truncate">
                                    {member.first_name}{" "}
                                    {member.last_name}
                                  </div>

                                  <div className="text-[10px] text-gray-400 truncate">
                                    {member.email}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="text-xs font-bold text-gray-800">
                                  {fmt(member.contributionAmount)}
                                </div>

                                <div className="text-[10px] text-gray-400">
                                  {formatStatus(member.status)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState text="No members have joined this group yet." />
                      )}
                    </DetailSection>

                    <DetailSection
                      icon={<HiOutlineCalendar size={16} />}
                      title={`Cycles (${
                        selectedGroup.ajoCycles?.length || 0
                      })`}
                    >
                      {selectedGroup.ajoCycles &&
                      selectedGroup.ajoCycles.length > 0 ? (
                        <div className="space-y-3">
                          {selectedGroup.ajoCycles.map((cycle, index) => (
                            <div
                              key={cycle.id}
                              className="p-4 bg-white/70 border border-gray-100 rounded-xl"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-gray-800 text-xs">
                                  Cycle {cycle.cycleNumber ?? index + 1}
                                </span>

                                <span
                                  className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${getStatusClass(
                                    cycle.status
                                  )}`}
                                >
                                  {formatStatus(cycle.status)}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <DetailItem
                                  label="Start"
                                  value={formatDate(cycle.startDate)}
                                />

                                <DetailItem
                                  label="End"
                                  value={formatDate(cycle.endDate)}
                                />

                                <DetailItem
                                  label="Amount"
                                  value={fmt(cycle.amount)}
                                />

                                <DetailItem
                                  label="Payout"
                                  value={fmt(cycle.payoutAmount)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState text="No cycles available for this group." />
                      )}
                    </DetailSection>

                    <DetailSection
                      icon={<TbCurrencyNaira size={16} />}
                      title={`Contributions (${
                        selectedGroup.AjoContribution?.length || 0
                      })`}
                    >
                      {selectedGroup.ajoContributions &&
                      selectedGroup.ajoContributions.length > 0 ? (
                        <div className="space-y-3">
                          {selectedGroup.ajoContributions.map(
                            (contribution) => (
                              <div
                                key={contribution.id}
                                className="p-3 bg-white/70 border border-gray-100 rounded-xl"
                              >
                                <div className="flex justify-between gap-3">
                                  <div>
                                    <div className="font-semibold text-xs text-gray-800">
                                      {contribution.memberName ||
                                        "Member"}
                                    </div>

                                    <div className="text-[10px] text-gray-400 mt-0.5">
                                      {contribution.cycleNumber
                                        ? `Cycle ${contribution.cycleNumber}`
                                        : "Contribution"}
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <div className="font-bold text-xs text-gray-900">
                                      {fmt(contribution.amount)}
                                    </div>

                                    <div className="text-[10px] text-gray-400">
                                      {formatStatus(
                                        contribution.status
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {contribution.createdAt && (
                                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-100">
                                    <HiOutlineClock size={11} />

                                    {formatDateTime(
                                      contribution.createdAt
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <EmptyState text="No contributions recorded yet." />
                      )}
                    </DetailSection>

                    <DetailSection
                      icon={<HiOutlineCheckCircle size={16} />}
                      title={`Payout Slots (${
                        selectedGroup.AjoSlot?.length || 0
                      })`}
                    >
                      {selectedGroup.AjoSlot &&
                      selectedGroup.AjoSlot.length > 0 ? (
                        <div className="space-y-3">
                          {selectedGroup.AjoSlot.map(
                            (slot) => (
                              <div
                                key={slot.id}
                                className="flex items-center justify-between gap-3 p-3 bg-white/70 border border-gray-100 rounded-xl"
                              >
                                <div>
                                  <div className="font-semibold text-xs text-gray-800">
                                    {slot.memberName ||
                                      "Member"}
                                  </div>

                                  <div className="text-[10px] text-gray-400 mt-0.5">
                                    Slot {slot.slotNumber}
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className="font-bold text-xs text-gray-900">
                                    {fmt(slot.amount)}
                                  </div>

                                  <div className="text-[10px] text-gray-400">
                                    {formatStatus(slot.status)}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <EmptyState text="No payout slots available yet." />
                      )}
                    </DetailSection>


                    <DetailSection
                      icon={<HiOutlineShieldCheck size={16} />}
                      title="Group Configuration"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <DetailItem
                          label="Invite Code"
                          value={
                            selectedGroup.inviteCode ||
                            "Not available"
                          }
                        />

                        <DetailItem
                          label="Privacy"
                          value={
                            selectedGroup.privacy
                              ? formatStatus(selectedGroup.privacy)
                              : "N/A"
                          }
                        />

                        <DetailItem
                          label="Created"
                          value={formatDate(
                            selectedGroup.createdAt
                          )}
                        />

                        <DetailItem
                          label="Last Updated"
                          value={formatDate(
                            selectedGroup.updatedAt
                          )}
                        />
                      </div>
                    </DetailSection>
                  </>
                ) : (
                  <EmptyState text="No group details available." />
                )}
              </div>


              <div className="p-6 border-t border-gray-100/50 bg-white/30 backdrop-blur-md">
                <button
                  onClick={closeDetails}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-2xl font-semibold text-sm transition-all cursor-pointer shadow-sm"
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
    <div className="bg-white/50 border border-gray-100/60 rounded-2xl p-5 space-y-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
        <div className="p-1.5 bg-[#68123D]/5 text-[#68123D] rounded-lg">
          {icon}
        </div>

        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
      </div>

      {children}
    </div>
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
    <div>
      <span className="text-gray-400 block font-medium mb-0.5 text-[11px]">
        {label}
      </span>

      <span
        className={`text-sm ${
          highlight
            ? "font-bold text-gray-950"
            : "font-semibold text-gray-800"
        } break-words`}
      >
        {value}
      </span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-6 px-4 bg-gray-50/60 border border-gray-100 rounded-xl text-center">
      <HiOutlineExclamationCircle
        size={20}
        className="mx-auto text-gray-300 mb-2"
      />

      <p className="text-xs text-gray-400">{text}</p>
    </div>
  );
}