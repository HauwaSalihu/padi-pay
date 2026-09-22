"use client";

import React, { useMemo, useState } from "react";
import {
  HiOutlineSearch,
  HiOutlineExternalLink,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUsers,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineArrowLeft,
  HiOutlineShieldCheck,
  HiOutlineCash,
  HiOutlineInformationCircle,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineRefresh,
  HiOutlineClock,
} from "react-icons/hi";

import {
  useGetAdasheGroupsQuery,
  useGetAdasheGroupDetailsQuery,
  AdasheGroup,
  AdasheMember,
  AdasheCycle,
  AdasheContribution,
} from "@/services/padiApi/adminApi";

import { PagePermissionGuard } from "@/components/AuthGuard";

/* ================================================================
   TYPES
================================================================ */

type AdasheGroupWithDetails = AdasheGroup & {
  admin?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null;

  members?: AdasheMember[];

  adasheCycles?: AdasheCycle[];

  adasheContributions?: AdasheContribution[];
};

/* ================================================================
   PAGE
================================================================ */

export default function AdasheGroupsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
    null,
  );

  /* ================================================================
     GROUPS QUERY
  ================================================================ */

  const {
    data,
    isLoading,
    isError,
    refetch: refetchGroups,
  } = useGetAdasheGroupsQuery({
    page,
    limit,
  });

  /* ================================================================
     GROUP DETAILS QUERY
     
     IMPORTANT:
     adminApi expects:
     
     { groupId: string }
     
     NOT:
     
     selectedGroupId
  ================================================================ */

  const {
    data: selectedGroupData,
    isLoading: isLoadingDetails,
    isFetching: isFetchingDetails,
    isError: isDetailsError,
    refetch: refetchDetails,
  } = useGetAdasheGroupDetailsQuery(
    {
      groupId: selectedGroupId as string,
    },
    {
      skip: !selectedGroupId,
    },
  );

  /* ================================================================
     DATA
  ================================================================ */

  const groups = (data?.data || []) as AdasheGroupWithDetails[];

  const meta = data?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  const selectedGroup = selectedGroupData?.data as
    | AdasheGroupWithDetails
    | undefined;

  /* ================================================================
     HELPERS
  ================================================================ */

  const fmt = (value?: number | string | null) => {
    if (value == null) return "₦0";

    const amount = Number(value);

    if (Number.isNaN(amount)) {
      return "₦0";
    }

    return `₦${amount.toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const getInitials = (
    first?: string | null,
    last?: string | null,
    fallbackName?: string | null,
  ) => {
    const firstInitial = first?.trim()?.charAt(0) || "";
    const lastInitial = last?.trim()?.charAt(0) || "";

    if (firstInitial || lastInitial) {
      return `${firstInitial}${lastInitial}`.toUpperCase();
    }

    if (fallbackName?.trim()) {
      const parts = fallbackName.trim().split(/\s+/);

      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      }

      return parts[0].charAt(0).toUpperCase();
    }

    return "M";
  };

  const getMemberName = (member?: AdasheMember | null) => {
    if (!member) return "Unknown Member";

    const firstName = member.user?.first_name?.trim() || "";
    const lastName = member.user?.last_name?.trim() || "";

    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
      return fullName;
    }

    return member.name?.trim() || "Unknown Member";
  };

  const getMemberEmail = (member?: AdasheMember | null) => {
    return member?.user?.email?.trim() || "";
  };

  const getMemberPhone = (member?: AdasheMember | null) => {
    return member?.phone?.trim() || "";
  };

  const formatStatus = (status?: string | null) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "N/A";
    }

    return parsed.toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date?: string | null) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "N/A";
    }

    return parsed.toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getCycleStatusClass = (status?: string | null) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      case "COMPLETE":
      case "COMPLETED":
        return "bg-blue-50 text-blue-700 border-blue-100";

      case "ABANDONED":
        return "bg-rose-50 text-rose-700 border-rose-100";

      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const getMemberStatusClass = (status?: string | null) => {
    switch (status) {
      case "ACTIVE":
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-100";

      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-100";

      case "REMOVED":
        return "bg-gray-50 text-gray-600 border-gray-100";

      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const getContributionStatusClass = (status?: string | null) => {
    switch (status) {
      case "SUCCESS":
      case "COMPLETED":
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-100";

      case "FAILED":
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-100";

      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  /* ================================================================
     SEARCH
  ================================================================ */

  const filtered = useMemo(() => {
    const search = query.toLowerCase().trim();

    if (!search) {
      return groups;
    }

    return groups.filter((group) => {
      const adminName = group.admin
        ? `${group.admin.first_name || ""} ${
            group.admin.last_name || ""
          }`.toLowerCase()
        : "";

      const adminEmail = group.admin?.email?.toLowerCase() || "";

      return (
        group.name?.toLowerCase().includes(search) ||
        group.description?.toLowerCase().includes(search) ||
        group.privacy?.toLowerCase().includes(search) ||
        group.id?.toLowerCase().includes(search) ||
        group.adminId?.toLowerCase().includes(search) ||
        adminName.includes(search) ||
        adminEmail.includes(search)
      );
    });
  }, [groups, query]);

  /* ================================================================
     SELECTED GROUP DATA
  ================================================================ */

  const members = selectedGroup?.members || [];

  const cycles = selectedGroup?.adasheCycles || [];

  const contributions = selectedGroup?.adasheContributions || [];

  /* ================================================================
     GROUP STATISTICS
  ================================================================ */

  const totalContributed = useMemo(() => {
    return contributions.reduce((total, contribution) => {
      return total + Number(contribution.amount || 0);
    }, 0);
  }, [contributions]);

  const activeCycles = useMemo(() => {
    return cycles.filter((cycle) => cycle.status === "ACTIVE").length;
  }, [cycles]);

  const completedCycles = useMemo(() => {
    return cycles.filter(
      (cycle) =>
        cycle.status === "COMPLETE" || cycle.status === "COMPLETED",
    ).length;
  }, [cycles]);

  const abandonedCycles = useMemo(() => {
    return cycles.filter((cycle) => cycle.status === "ABANDONED").length;
  }, [cycles]);

  const pendingContributions = useMemo(() => {
    return contributions.filter(
      (contribution) => contribution.status === "PENDING",
    ).length;
  }, [contributions]);

  /* ================================================================
     SELECTED MEMBER
  ================================================================ */

  const selectedMember =
    members.find((member) => member.id === selectedMemberId) || null;

  const memberContributions = selectedMember?.adasheContributions || [];

  const memberCycles = selectedMember?.adasheCycles || [];

  /* ================================================================
     DRAWER ACTIONS
  ================================================================ */

  const openDetails = (group: AdasheGroupWithDetails) => {
    if (!group?.id) {
      console.error("Cannot open Adashe group: group ID is missing", group);
      return;
    }

    setSelectedMemberId(null);
    setSelectedGroupId(group.id);
  };

  const closeDetails = () => {
    setSelectedMemberId(null);
    setSelectedGroupId(null);
  };

  const openMemberDetails = (memberId: string) => {
    setSelectedMemberId(memberId);
  };

  const closeMemberDetails = () => {
    setSelectedMemberId(null);
  };

  /* ================================================================
     RENDER
  ================================================================ */

  return (
    <PagePermissionGuard pageKey="adashe">
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
            animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-4 border-b border-gray-100/50 pb-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-[#181B25]">
              Adashe Groups
            </h1>

            <p className="max-w-xl text-sm text-[#525866]/80">
              Review Adashe groups, members, cycles, contributions, payments,
              and group administration.
            </p>
          </div>

          {!isLoading && !isError && meta.total > 0 && (
            <div className="self-start md:self-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#68123D]/15 bg-[#68123D]/10 px-3.5 py-1.5 text-xs font-semibold text-[#68123D]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#68123D]" />
                {meta.total} Adashe Group
                {meta.total === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </div>

        {/* =====================================================
            SEARCH
        ====================================================== */}

        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/45 p-4 shadow-sm backdrop-blur-md sm:flex-row">
          <div className="relative w-full sm:max-w-md">
            <HiOutlineSearch
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search Adashe group..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-200/50 bg-white/40 py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition-all placeholder-gray-400 shadow-inner hover:bg-white/60 focus:border-[#68123D]/40 focus:bg-white/80 focus:ring-4 focus:ring-[#68123D]/5"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-medium text-gray-400">Show</span>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="cursor-pointer rounded-xl border border-gray-200/50 bg-white/40 p-2.5 text-xs font-medium text-gray-700 outline-none shadow-sm transition-all hover:border-gray-300 hover:bg-white/60 focus:border-[#68123D]/40"
            >
              {[5, 10, 20].map((value) => (
                <option key={value} value={value}>
                  {value} per page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        {isLoading ? (
          <LoadingState text="Loading Adashe groups..." />
        ) : isError ? (
          <ErrorState
            title="Failed to load Adashe groups"
            description="There was an issue fetching the Adashe groups. Please try again."
            onRetry={() => refetchGroups()}
          />
        ) : filtered.length === 0 ? (
          <EmptyState text="No Adashe groups match your current search." />
        ) : (
          <>
            {/* =================================================
                DESKTOP TABLE
            ================================================== */}

            <div className="hidden overflow-hidden rounded-2xl border border-white/70 bg-white/50 shadow-sm backdrop-blur-lg md:block">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-100/50 bg-gray-50/20 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      <th className="px-6 py-4">Adashe Group</th>
                      <th className="px-6 py-4">Members</th>
                      <th className="px-6 py-4">Min. Amount</th>
                      <th className="px-6 py-4">Cycles</th>
                      <th className="px-6 py-4">Privacy</th>
                      <th className="px-6 py-4">Created</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100/30 text-sm">
                    {filtered.map((group) => (
                      <tr
                        key={group.id}
                        className="group transition-all duration-150 hover:bg-white/45"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#68123D]/10 bg-[#68123D]/10 text-[#68123D]">
                              <HiOutlineUsers size={17} />
                            </div>

                            <div className="min-w-0">
                              <div className="max-w-[180px] truncate text-sm font-semibold text-gray-800">
                                {group.name}
                              </div>

                              <div className="mt-0.5 text-xs text-gray-400">
                                {formatStatus(group.privacy)}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <HiOutlineUsers
                              size={15}
                              className="text-gray-400"
                            />

                            <span className="text-xs font-semibold text-gray-700">
                              {group.members?.length || 0}
                              {group.maxGroupSize
                                ? `/${group.maxGroupSize}`
                                : ""}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-gray-800">
                            {fmt(group.minAmount)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <HiOutlineCalendar
                              size={15}
                              className="text-gray-400"
                            />

                            <span className="text-xs font-semibold text-gray-700">
                              {group.adasheCycles?.length || 0}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full border border-gray-100 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600">
                            {formatStatus(group.privacy)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-gray-600">
                            {formatDate(group.createdAt)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => openDetails(group)}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-neutral-800"
                          >
                            View Group
                            <HiOutlineExternalLink size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination meta={meta} page={page} setPage={setPage} />
            </div>

            {/* =================================================
                MOBILE
            ================================================== */}

            <div className="space-y-4 md:hidden">
              {filtered.map((group) => (
                <div
                  key={group.id}
                  className="space-y-4 rounded-2xl border border-white/70 bg-white/60 p-5 shadow-sm backdrop-blur-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#68123D]/10 text-[#68123D]">
                        <HiOutlineUsers size={18} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-gray-800">
                          {group.name}
                        </h3>

                        <p className="text-xs text-gray-400">
                          {formatStatus(group.privacy)}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-md bg-gray-100/50 px-2 py-1 font-mono text-[10px] text-gray-400">
                      #{group.id.substring(0, 8)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-b border-t border-gray-100/50 py-4">
                    <DetailItem
                      label="Members"
                      value={`${group.members?.length || 0}${
                        group.maxGroupSize ? `/${group.maxGroupSize}` : ""
                      }`}
                    />

                    <DetailItem
                      label="Min. Amount"
                      value={fmt(group.minAmount)}
                      highlight
                    />

                    <DetailItem
                      label="Cycles"
                      value={String(group.adasheCycles?.length || 0)}
                    />

                    <DetailItem
                      label="Contributions"
                      value={String(group.adasheContributions?.length || 0)}
                    />

                    <DetailItem
                      label="Privacy"
                      value={formatStatus(group.privacy)}
                    />

                    <DetailItem
                      label="Created"
                      value={formatDate(group.createdAt)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => openDetails(group)}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-neutral-800"
                  >
                    View Group
                    <HiOutlineExternalLink size={13} />
                  </button>
                </div>
              ))}

              <Pagination meta={meta} page={page} setPage={setPage} />
            </div>
          </>
        )}

        {/* =====================================================
            DETAILS DRAWER
        ====================================================== */}

        {selectedGroupId && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/15 backdrop-blur-md"
              onClick={closeDetails}
            />

            <div className="drawer-animate fixed bottom-4 right-4 top-4 z-50 flex w-[calc(100%-2rem)] flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/95 text-sm text-[#181B25] shadow-[0_24px_60px_rgba(0,0,0,0.12)] backdrop-blur-2xl md:w-full md:max-w-2xl">
              {/* =================================================
                  DRAWER HEADER
              ================================================== */}

              <div className="flex items-center justify-between border-b border-gray-100/50 p-6">
                <div className="flex min-w-0 items-center gap-3">
                  {selectedMemberId && (
                    <button
                      type="button"
                      onClick={closeMemberDetails}
                      className="shrink-0 cursor-pointer rounded-full bg-gray-100/50 p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-800"
                    >
                      <HiOutlineArrowLeft size={18} />
                    </button>
                  )}

                  <div className="min-w-0 space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                      {selectedMemberId
                        ? "Member Details"
                        : "Adashe Group Details"}
                    </h2>

                    <div className="truncate font-mono text-xs text-gray-400">
                      {selectedMemberId
                        ? getMemberName(selectedMember)
                        : `Group ID: ${selectedGroupId}`}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeDetails}
                  className="shrink-0 cursor-pointer rounded-full bg-gray-100/50 p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-800"
                >
                  <HiOutlineX size={18} />
                </button>
              </div>

              {/* =================================================
                  DRAWER CONTENT
              ================================================== */}

              <div className="flex-1 space-y-6 overflow-y-auto p-6">
                {isLoadingDetails || isFetchingDetails ? (
                  <LoadingState text="Loading Adashe group details..." />
                ) : isDetailsError ? (
                  <ErrorState
                    title="Failed to load group"
                    description="We could not retrieve the complete details for this Adashe group."
                    onRetry={() => refetchDetails()}
                  />
                ) : selectedGroup ? (
                  <>
                    {/* =================================================
                        MEMBER DETAILS
                    ================================================== */}

                    {selectedMemberId ? (
                      selectedMember ? (
                        <>
                          <div className="rounded-2xl border border-[#68123D]/10 bg-[#68123D]/5 p-5">
                            <div className="flex items-center gap-4">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#68123D]/10 bg-[#68123D]/10 text-sm font-bold text-[#68123D]">
                                {getInitials(
                                  selectedMember.user?.first_name,
                                  selectedMember.user?.last_name,
                                  selectedMember.name,
                                )}
                              </div>

                              <div className="min-w-0">
                                <h3 className="text-lg font-bold text-gray-900">
                                  {getMemberName(selectedMember)}
                                </h3>

                                {getMemberEmail(selectedMember) && (
                                  <div className="mt-1 flex items-center gap-1.5">
                                    <HiOutlineMail
                                      size={12}
                                      className="text-gray-400"
                                    />

                                    <p className="truncate text-xs text-gray-500">
                                      {getMemberEmail(selectedMember)}
                                    </p>
                                  </div>
                                )}

                                {getMemberPhone(selectedMember) && (
                                  <div className="mt-1 flex items-center gap-1.5">
                                    <HiOutlinePhone
                                      size={12}
                                      className="text-gray-400"
                                    />

                                    <p className="text-xs text-gray-500">
                                      {getMemberPhone(selectedMember)}
                                    </p>
                                  </div>
                                )}

                                <span
                                  className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getMemberStatusClass(
                                    selectedMember.status,
                                  )}`}
                                >
                                  {formatStatus(selectedMember.status)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <DetailSection
                            icon={<HiOutlineInformationCircle size={16} />}
                            title="Member Information"
                          >
                            <div className="grid grid-cols-2 gap-4">
                              <DetailItem
                                label="Name"
                                value={getMemberName(selectedMember)}
                              />

                              <DetailItem
                                label="Email"
                                value={getMemberEmail(selectedMember) || "N/A"}
                              />

                              <DetailItem
                                label="Phone"
                                value={getMemberPhone(selectedMember) || "N/A"}
                              />

                              <DetailItem
                                label="Status"
                                value={formatStatus(selectedMember.status)}
                              />

                              <DetailItem
                                label="User ID"
                                value={selectedMember.userId || "N/A"}
                              />

                              <DetailItem
                                label="Member ID"
                                value={selectedMember.id}
                              />
                            </div>
                          </DetailSection>

                          <DetailSection
                            icon={<HiOutlineCalendar size={16} />}
                            title={`Cycles (${memberCycles.length})`}
                          >
                            {memberCycles.length > 0 ? (
                              <div className="space-y-3">
                                {memberCycles.map((cycle) => (
                                  <CycleCard
                                    key={cycle.id}
                                    cycle={cycle}
                                    fmt={fmt}
                                    formatDate={formatDate}
                                    formatStatus={formatStatus}
                                    getStatusClass={getCycleStatusClass}
                                    getMemberName={getMemberName}
                                  />
                                ))}
                              </div>
                            ) : (
                              <EmptyState text="No cycles recorded for this member yet." />
                            )}
                          </DetailSection>

                          <DetailSection
                            icon={<HiOutlineCash size={16} />}
                            title={`Contributions (${memberContributions.length})`}
                          >
                            {memberContributions.length > 0 ? (
                              <div className="space-y-3">
                                {memberContributions.map((contribution) => (
                                  <ContributionCard
                                    key={contribution.id}
                                    contribution={contribution}
                                    fmt={fmt}
                                    formatDateTime={formatDateTime}
                                    formatStatus={formatStatus}
                                    getStatusClass={
                                      getContributionStatusClass
                                    }
                                  />
                                ))}
                              </div>
                            ) : (
                              <EmptyState text="No contributions recorded for this member yet." />
                            )}
                          </DetailSection>
                        </>
                      ) : (
                        <EmptyState text="Member details are unavailable." />
                      )
                    ) : (
                      <>
                        {/* =================================================
                            GROUP HERO
                        ================================================== */}

                        <div className="rounded-2xl border border-[#68123D]/10 bg-[#68123D]/5 p-5">
                          <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#68123D]/10 text-[#68123D]">
                              <HiOutlineUsers size={24} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-xl font-bold text-gray-900">
                                  {selectedGroup.name}
                                </h3>

                                <span className="rounded-full border border-gray-100 bg-gray-50 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
                                  {formatStatus(selectedGroup.privacy)}
                                </span>
                              </div>

                              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                                {selectedGroup.description ||
                                  "No description provided."}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* =================================================
                            KEY STATISTICS
                        ================================================== */}

                        <div className="grid grid-cols-2 gap-3">
                          <StatCard
                            label="Members"
                            value={`${members.length}${
                              selectedGroup.maxGroupSize
                                ? `/${selectedGroup.maxGroupSize}`
                                : ""
                            }`}
                            icon={<HiOutlineUsers size={18} />}
                          />

                          <StatCard
                            label="Min. Amount"
                            value={fmt(selectedGroup.minAmount)}
                            icon={<HiOutlineCash size={18} />}
                          />

                          <StatCard
                            label="Total Contributed"
                            value={fmt(totalContributed)}
                            icon={<HiOutlineCash size={18} />}
                          />

                          <StatCard
                            label="Cycles"
                            value={String(cycles.length)}
                            icon={<HiOutlineCalendar size={18} />}
                          />
                        </div>

                        {/* =================================================
                            GROUP OVERVIEW
                        ================================================== */}

                        <DetailSection
                          icon={<HiOutlineInformationCircle size={16} />}
                          title="Group Overview"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <DetailItem
                              label="Group Name"
                              value={selectedGroup.name}
                            />

                            <DetailItem
                              label="Privacy"
                              value={formatStatus(selectedGroup.privacy)}
                            />

                            <DetailItem
                              label="Minimum Amount"
                              value={fmt(selectedGroup.minAmount)}
                              highlight
                            />

                            <DetailItem
                              label="Maximum Group Size"
                              value={
                                selectedGroup.maxGroupSize
                                  ? `${selectedGroup.maxGroupSize} members`
                                  : "No limit"
                              }
                            />

                            <DetailItem
                              label="Current Members"
                              value={`${members.length} member${
                                members.length === 1 ? "" : "s"
                              }`}
                            />

                            <DetailItem
                              label="Created"
                              value={formatDate(selectedGroup.createdAt)}
                            />

                            <DetailItem
                              label="Last Updated"
                              value={formatDate(selectedGroup.updatedAt)}
                            />

                            <DetailItem
                              label="Group ID"
                              value={selectedGroup.id}
                            />
                          </div>
                        </DetailSection>

                        {/* =================================================
                            ACTIVITY SUMMARY
                        ================================================== */}

                        <DetailSection
                          icon={<HiOutlineCalendar size={16} />}
                          title="Activity Summary"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <DetailItem
                              label="Active Cycles"
                              value={String(activeCycles)}
                            />

                            <DetailItem
                              label="Completed Cycles"
                              value={String(completedCycles)}
                            />

                            <DetailItem
                              label="Abandoned Cycles"
                              value={String(abandonedCycles)}
                            />

                            <DetailItem
                              label="Total Cycles"
                              value={String(cycles.length)}
                            />

                            <DetailItem
                              label="Total Contributions"
                              value={String(contributions.length)}
                            />

                            <DetailItem
                              label="Pending Contributions"
                              value={String(pendingContributions)}
                            />
                          </div>
                        </DetailSection>

                        {/* =================================================
                            ADMIN
                        ================================================== */}

                        <DetailSection
                          icon={<HiOutlineShieldCheck size={16} />}
                          title="Group Administration"
                        >
                          {selectedGroup.admin ? (
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white/70 p-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#68123D]/10 text-xs font-bold text-[#68123D]">
                                  {getInitials(
                                    selectedGroup.admin.first_name,
                                    selectedGroup.admin.last_name,
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-800">
                                    {`${selectedGroup.admin.first_name || ""} ${
                                      selectedGroup.admin.last_name || ""
                                    }`.trim() || "Unknown Admin"}
                                  </p>

                                  <p className="truncate text-xs text-gray-400">
                                    {selectedGroup.admin.email ||
                                      "No email available"}
                                  </p>
                                </div>
                              </div>

                              <DetailItem
                                label="Admin ID"
                                value={selectedGroup.adminId}
                              />
                            </div>
                          ) : (
                            <DetailItem
                              label="Admin ID"
                              value={selectedGroup.adminId}
                            />
                          )}
                        </DetailSection>

                        {/* =================================================
                            MEMBERS
                        ================================================== */}

                        <DetailSection
                          icon={<HiOutlineUsers size={16} />}
                          title={`Members (${members.length})`}
                        >
                          {members.length > 0 ? (
                            <div className="space-y-3">
                              {members.map((member) => (
                                <button
                                  key={member.id}
                                  type="button"
                                  onClick={() =>
                                    openMemberDetails(member.id)
                                  }
                                  className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white/70 p-4 text-left transition-all hover:border-[#68123D]/20 hover:bg-white hover:shadow-sm"
                                >
                                  <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#68123D]/10 bg-[#68123D]/10 text-[11px] font-bold text-[#68123D]">
                                      {getInitials(
                                        member.user?.first_name,
                                        member.user?.last_name,
                                        member.name,
                                      )}
                                    </div>

                                    <div className="min-w-0">
                                      <div className="truncate text-xs font-semibold text-gray-800">
                                        {getMemberName(member)}
                                      </div>

                                      <div className="truncate text-[10px] text-gray-400">
                                        {getMemberEmail(member) ||
                                          getMemberPhone(member) ||
                                          `User ID: ${member.userId || "N/A"}`}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex shrink-0 items-center gap-3">
                                    <div className="text-right">
                                      <div className="text-xs font-bold text-gray-800">
                                        {member.adasheContributions
                                          ? fmt(
                                              member.adasheContributions.reduce(
                                                (sum, contribution) =>
                                                  sum +
                                                  Number(
                                                    contribution.amount || 0,
                                                  ),
                                                0,
                                              ),
                                            )
                                          : "₦0"}
                                      </div>

                                      <div
                                        className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold ${getMemberStatusClass(
                                          member.status,
                                        )}`}
                                      >
                                        {formatStatus(member.status)}
                                      </div>
                                    </div>

                                    <HiOutlineExternalLink
                                      size={14}
                                      className="text-gray-300 transition-colors group-hover:text-[#68123D]"
                                    />
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <EmptyState text="No members have joined this group yet." />
                          )}
                        </DetailSection>

                        {/* =================================================
                            CYCLES
                        ================================================== */}

                        <DetailSection
                          icon={<HiOutlineCalendar size={16} />}
                          title={`Cycles (${cycles.length})`}
                        >
                          {cycles.length > 0 ? (
                            <div className="space-y-3">
                              {cycles.map((cycle) => (
                                <CycleCard
                                  key={cycle.id}
                                  cycle={cycle}
                                  fmt={fmt}
                                  formatDate={formatDate}
                                  formatStatus={formatStatus}
                                  getStatusClass={getCycleStatusClass}
                                  getMemberName={getMemberName}
                                />
                              ))}
                            </div>
                          ) : (
                            <EmptyState text="No cycles have been created for this group yet." />
                          )}
                        </DetailSection>

                        {/* =================================================
                            CONTRIBUTIONS
                        ================================================== */}

                        <DetailSection
                          icon={<HiOutlineCash size={16} />}
                          title={`Contributions (${contributions.length})`}
                        >
                          {contributions.length > 0 ? (
                            <div className="space-y-3">
                              {contributions.map((contribution) => (
                                <ContributionCard
                                  key={contribution.id}
                                  contribution={contribution}
                                  fmt={fmt}
                                  formatDateTime={formatDateTime}
                                  formatStatus={formatStatus}
                                  getStatusClass={
                                    getContributionStatusClass
                                  }
                                />
                              ))}
                            </div>
                          ) : (
                            <EmptyState text="No contributions have been recorded yet." />
                          )}
                        </DetailSection>
                      </>
                    )}
                  </>
                ) : (
                  <EmptyState text="No group details available." />
                )}
              </div>

              {/* =================================================
                  FOOTER
              ================================================== */}

              <div className="border-t border-gray-100/50 bg-white/30 p-6 backdrop-blur-md">
                {selectedMemberId ? (
                  <button
                    type="button"
                    onClick={closeMemberDetails}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-neutral-800"
                  >
                    <HiOutlineArrowLeft size={16} />
                    Back to Group
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={closeDetails}
                    className="w-full cursor-pointer rounded-2xl bg-neutral-900 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-neutral-800"
                  >
                    Close Details
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </PagePermissionGuard>
  );
}

/* ================================================================
   CYCLE CARD
================================================================ */

function CycleCard({
  cycle,
  fmt,
  formatDate,
  formatStatus,
  getStatusClass,
  getMemberName,
}: {
  cycle: AdasheCycle;
  fmt: (value?: number | string | null) => string;
  formatDate: (date?: string | null) => string;
  formatStatus: (status?: string | null) => string;
  getStatusClass: (status?: string | null) => string;
  getMemberName: (member?: AdasheMember | null) => string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white/70 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs font-semibold text-gray-800">
            Cycle {cycle.cycleCount}
          </span>

          <p className="mt-1 truncate text-[10px] text-gray-400">
            {cycle.adasheMember
              ? getMemberName(cycle.adasheMember)
              : "Member unavailable"}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${getStatusClass(
            cycle.status,
          )}`}
        >
          {formatStatus(cycle.status)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DetailItem
          label="Contribution Amount"
          value={fmt(cycle.contributionAmount)}
          highlight
        />

        <DetailItem
          label="Amount Contributed"
          value={fmt(cycle.amountContributed)}
          highlight
        />

        <DetailItem label="Start Date" value={formatDate(cycle.startDate)} />

        <DetailItem label="End Date" value={formatDate(cycle.endDate)} />

        <DetailItem label="Cycle Count" value={String(cycle.cycleCount)} />

        <DetailItem label="Member ID" value={cycle.adasheMemberId} />
      </div>
    </div>
  );
}

/* ================================================================
   CONTRIBUTION CARD
================================================================ */

function ContributionCard({
  contribution,
  fmt,
  formatDateTime,
  formatStatus,
  getStatusClass,
}: {
  contribution: AdasheContribution;
  fmt: (value?: number | string | null) => string;
  formatDateTime: (date?: string | null) => string;
  formatStatus: (status?: string | null) => string;
  getStatusClass: (status?: string | null) => string;
}) {
  const member = contribution.adasheMember;

  const memberName = member?.user
    ? `${member.user.first_name || ""} ${
        member.user.last_name || ""
      }`.trim()
    : member?.name || "Unknown Member";

  return (
    <div className="rounded-xl border border-gray-100 bg-white/70 p-4">
      <div className="flex justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-gray-800">
            {memberName}
          </div>

          <div className="mt-1 text-[10px] text-gray-400">
            Cycle: {contribution.adasheCycleId}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-sm font-bold text-gray-900">
            {fmt(contribution.amount)}
          </div>

          <span
            className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold ${getStatusClass(
              contribution.status,
            )}`}
          >
            {formatStatus(contribution.status)}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-3">
        <DetailItem label="Reference" value={contribution.reference || "N/A"} />

        <DetailItem
          label="Transaction ID"
          value={contribution.transactionId || "N/A"}
        />

        <DetailItem
          label="Paid At"
          value={formatDateTime(contribution.paidAt)}
        />

        <DetailItem
          label="Created"
          value={formatDateTime(contribution.createdAt)}
        />
      </div>
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
    <div className="space-y-4 rounded-2xl border border-gray-100/60 bg-white/50 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
        <div className="rounded-lg bg-[#68123D]/5 p-1.5 text-[#68123D]">
          {icon}
        </div>

        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {title}
        </h3>
      </div>

      {children}
    </div>
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
          highlight
            ? "font-bold text-gray-950"
            : "font-semibold text-gray-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ================================================================
   STAT CARD
================================================================ */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </span>

        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#68123D]/10 text-[#68123D]">
          {icon}
        </div>
      </div>

      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  );
}

/* ================================================================
   PAGINATION
================================================================ */

function Pagination({
  meta,
  page,
  setPage,
}: {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  page: number;

  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <div className="flex items-center justify-between border-t border-gray-100/50 bg-white/20 px-6 py-4 text-xs font-medium text-gray-500">
      <span>
        Page {meta.page} of {meta.totalPages} ({meta.total} total)
      </span>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="cursor-pointer rounded-xl border border-gray-200/50 bg-white/50 p-2 text-gray-600 shadow-sm transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <HiOutlineChevronLeft size={16} />
        </button>

        <button
          type="button"
          onClick={() =>
            setPage((p) => Math.min(meta.totalPages, p + 1))
          }
          disabled={page >= meta.totalPages || meta.totalPages === 0}
          className="cursor-pointer rounded-xl border border-gray-200/50 bg-white/50 p-2 text-gray-600 shadow-sm transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <HiOutlineChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   LOADING
================================================================ */

function LoadingState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/60 bg-white/45 px-4 py-24 text-center shadow-sm backdrop-blur-md">
      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#68123D]" />

      <p className="text-sm font-medium text-gray-500">{text}</p>
    </div>
  );
}

/* ================================================================
   ERROR
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100/50 bg-red-50/20 px-4 py-16 text-center shadow-sm backdrop-blur-md">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
        <HiOutlineX size={22} />
      </div>

      <h3 className="mb-1 text-sm font-semibold text-red-900">{title}</h3>

      <p className="mb-5 max-w-xs text-xs text-red-700/80">
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
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-8 text-center">
      <HiOutlineExclamationCircle
        size={20}
        className="mx-auto mb-2 text-gray-300"
      />

      <p className="text-xs text-gray-400">{text}</p>
    </div>
  );
}