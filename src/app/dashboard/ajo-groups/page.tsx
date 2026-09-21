"use client";

import React, { useState } from "react";
import {
  HiOutlineSearch,
  HiOutlineExternalLink,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUsers,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineArrowLeft,
  HiOutlineShieldCheck,
  HiOutlineCash,
  HiOutlineInformationCircle,
} from "react-icons/hi";

import {
  useGetAjoGroupsQuery,
  useGetAjoGroupDetailsQuery,
  AjoGroup,
} from "@/services/padiApi/adminApi";

import { PagePermissionGuard } from "@/components/AuthGuard";


type AjoUser = {
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
};

type AjoMember = {
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
};

type AjoContribution = {
  id: string;
  memberId?: string | null;
  userId?: string | null;
  memberName?: string | null;

  amount?: number | string | null;
  cycleNumber?: number | null;
  status?: string | null;
  createdAt?: string | null;
};

type AjoCycle = {
  id: string;
  cycleNumber?: number | null;
  status?: string | null;

  startDate?: string | null;
  endDate?: string | null;

  amount?: number | string | null;
  payoutAmount?: number | string | null;
};

type AjoSlot = {
  id: string;
  memberId?: string | null;
  userId?: string | null;
  memberName?: string | null;

  slotNumber?: number | null;
  amount?: number | string | null;
  status?: string | null;
};

type AjoGroupWithDetails = AjoGroup & {
  adminId?: string | null;

  ajoMembers?: AjoMember[];
  ajoContributions?: AjoContribution[];
  ajoCycles?: AjoCycle[];
  AjoSlot?: AjoSlot[];
};


export default function AjoGroupsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);


  const { data, isLoading, isError, refetch } = useGetAjoGroupsQuery({
    page,
    limit,
  });

  const {
    data: selectedGroupData,
    isLoading: isLoadingDetails,
    isError: isDetailsError,
    refetch: refetchDetails,
  } = useGetAjoGroupDetailsQuery(selectedGroupId as string, {
    skip: !selectedGroupId,
  });

  const groups = (data?.data || []) as AjoGroupWithDetails[];
  // console.log("groups", groups);

  const meta = data?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  const selectedGroup = selectedGroupData?.data as
    | AjoGroupWithDetails
    | undefined;


  const fmt = (value?: number | string | null) => {
    if (value == null) return "₦0";

    const amount = Number(value);

    if (Number.isNaN(amount)) return "₦0";

    const nairaAmount = amount / 100;

    return `₦${nairaAmount.toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const getInitials = (first?: string | null, last?: string | null) => {
    const f = first?.charAt(0) || "";
    const l = last?.charAt(0) || "";

    return `${f}${l}`.toUpperCase() || "M";
  };

  const getMemberFirstName = (member?: AjoMember | null) => {
    return member?.user?.first_name?.trim() || "";
  };

  const getMemberLastName = (member?: AjoMember | null) => {
    return member?.user?.last_name?.trim() || "";
  };

  const getMemberEmail = (member?: AjoMember | null) => {
    return member?.user?.email?.trim() || "";
  };

  const getMemberName = (member?: AjoMember | null) => {
    const firstName = member?.user?.first_name?.trim() || "";
    const lastName = member?.user?.last_name?.trim() || "";

    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || "Member One";
  };


  const formatStatus = (status?: string | null) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatFrequency = (frequency?: string | null) => {
    if (!frequency) return "Not specified";

    return frequency
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusClass = (status?: string | null) => {
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


  const openDetails = (group: AjoGroup) => {
    setSelectedGroupId(group.id);
    setSelectedMemberId(null);
  };

  const closeDetails = () => {
    setSelectedGroupId(null);
    setSelectedMemberId(null);
  };

  const openMemberDetails = (memberId: string) => {
    setSelectedMemberId(memberId);
  };

  const closeMemberDetails = () => {
    setSelectedMemberId(null);
  };

  /* ================================================================
     SEARCH
  ================================================================ */

  const filtered = groups.filter((group) => {
    const search = query.toLowerCase().trim();

    if (!search) return true;

    return (
      group.name?.toLowerCase().includes(search) ||
      group.description?.toLowerCase().includes(search) ||
      group.status?.toLowerCase().includes(search) ||
      group.privacy?.toLowerCase().includes(search) ||
      group.id?.toLowerCase().includes(search) ||
      group.inviteCode?.toLowerCase().includes(search)
    );
  });

  /* ================================================================
     SELECTED GROUP DATA
  ================================================================ */

  const members = selectedGroup?.ajoMembers || [];

  const contributions = selectedGroup?.ajoContributions || [];

  const cycles = selectedGroup?.ajoCycles || [];

  const slots = selectedGroup?.AjoSlot || [];

  const selectedMember =
    members.find((member) => member.id === selectedMemberId) || null;

  /* ================================================================
     MEMBER CONTRIBUTIONS
  ================================================================ */

  const memberContributions = selectedMember
    ? contributions.filter((contribution) => {
        const contributionMemberId =
          contribution.memberId || contribution.userId;

        if (contributionMemberId) {
          return (
            contributionMemberId === selectedMember.id ||
            contributionMemberId === selectedMember.userId
          );
        }

        const contributionName = contribution.memberName?.toLowerCase().trim();

        return (
          contributionName ===
          getMemberName(selectedMember).toLowerCase().trim()
        );
      })
    : [];

  /* ================================================================
     MEMBER PAYOUT SLOTS
  ================================================================ */

  const memberPayoutSlots = selectedMember
    ? slots.filter((slot) => {
        const slotMemberId = slot.memberId || slot.userId;

        if (slotMemberId) {
          return (
            slotMemberId === selectedMember.id ||
            slotMemberId === selectedMember.userId
          );
        }

        const slotName = slot.memberName?.toLowerCase().trim();

        return slotName === getMemberName(selectedMember).toLowerCase().trim();
      })
    : [];

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

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100/50 pb-5">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-[#181B25]">
              Ajo Groups
            </h1>

            <p className="text-sm text-[#525866]/80 max-w-xl">
              Review Ajo groups, members, contributions, cycles, payouts, and
              group settings.
            </p>
          </div>

          {!isLoading && !isError && meta.total > 0 && (
            <div className="self-start md:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#68123D]/10 text-[#68123D] border border-[#68123D]/15">
                <span className="w-1.5 h-1.5 rounded-full bg-[#68123D] animate-pulse" />
                {meta.total} Ajo Group
                {meta.total === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </div>

        {/* =====================================================
            SEARCH
        ====================================================== */}

        <div className="bg-white/45 backdrop-blur-md border border-white/60 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
          <div className="relative w-full sm:max-w-md">
            <HiOutlineSearch
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search Ajo group..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/40 border border-gray-200/50 hover:bg-white/60 focus:bg-white/80 focus:border-[#68123D]/40 focus:ring-4 focus:ring-[#68123D]/5 rounded-xl outline-none transition-all shadow-inner placeholder-gray-400 text-gray-800"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-gray-400 font-medium">Show</span>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="text-xs border border-gray-200/50 p-2.5 rounded-xl bg-white/40 hover:bg-white/60 hover:border-gray-300 focus:border-[#68123D]/40 outline-none cursor-pointer transition-all font-medium text-gray-700 shadow-sm"
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
          <LoadingState text="Loading Ajo groups..." />
        ) : isError ? (
          <ErrorState
            title="Failed to load Ajo groups"
            description="There was an issue fetching the Ajo groups. Please try again."
            onRetry={() => refetch()}
          />
        ) : filtered.length === 0 ? (
          <EmptyState text="No Ajo groups match your current search." />
        ) : (
          <>
            {/* =================================================
                DESKTOP TABLE
            ================================================== */}

            <div className="hidden md:block bg-white/50 backdrop-blur-lg border border-white/70 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100/50 bg-gray-50/20 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Group ID</th>

                      <th className="py-4 px-6">Ajo Group</th>

                      <th className="py-4 px-6">Members</th>

                      <th className="py-4 px-6">Contribution</th>

                      <th className="py-4 px-6">Frequency</th>

                      <th className="py-4 px-6">Status</th>

                      <th className="py-4 px-6">Created</th>

                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100/30 text-sm">
                    {filtered.map((group) => (
                      <tr
                        key={group.id}
                        className="hover:bg-white/45 transition-all duration-150 group"
                      >
                        {/* ID */}

                        <td className="py-4 px-6">
                          <span className="text-xs font-mono text-gray-400 bg-gray-50/50 px-2 py-1 rounded-md border border-gray-100/30">
                            {group.id.substring(0, 8)}...
                          </span>
                        </td>

                        {/* GROUP */}

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#68123D]/10 text-[#68123D] flex items-center justify-center border border-[#68123D]/10">
                              <HiOutlineUsers size={17} />
                            </div>

                            <div className="min-w-0">
                              <div className="font-semibold text-gray-800 text-sm truncate max-w-[180px]">
                                {group.name}
                              </div>

                              <div className="text-xs text-gray-400 mt-0.5">
                                {formatStatus(group.privacy)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* MEMBERS */}

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <HiOutlineUsers
                              size={15}
                              className="text-gray-400"
                            />

                            <span className="text-xs font-semibold text-gray-700">
                              {group.ajoMembers?.length || 0}/
                              {group.groupSize || 0}
                            </span>
                          </div>
                        </td>

                        {/* CONTRIBUTION */}

                        <td className="py-4 px-6">
                          <span className="text-xs font-bold text-gray-800">
                            {fmt(group.contributionAmount)}
                          </span>
                        </td>

                        {/* FREQUENCY */}

                        <td className="py-4 px-6">
                          <div className="text-xs font-medium text-gray-700">
                            {formatFrequency(group.frequency)}
                          </div>

                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {group.contributionSchedule || "No schedule"}
                          </div>
                        </td>

                        {/* STATUS */}

                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusClass(
                              group.status,
                            )}`}
                          >
                            {formatStatus(group.status)}
                          </span>
                        </td>

                        {/* CREATED */}

                        <td className="py-4 px-6">
                          <span className="text-xs font-medium text-gray-600">
                            {formatDate(group.createdAt)}
                          </span>
                        </td>

                        {/* ACTION */}

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => openDetails(group)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
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
                  className="bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-[#68123D]/10 text-[#68123D] flex items-center justify-center">
                        <HiOutlineUsers size={18} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">
                          {group.name}
                        </h3>

                        <p className="text-xs text-gray-400">
                          {formatStatus(group.privacy)}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 text-[10px] font-mono text-gray-400 bg-gray-100/50 px-2 py-1 rounded-md">
                      #{group.id.substring(0, 8)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100/50 py-4">
                    <DetailItem
                      label="Status"
                      value={formatStatus(group.status)}
                    />

                    <DetailItem
                      label="Members"
                      value={`${group.ajoMembers?.length || 0}/${group.groupSize || 0}`}
                    />

                    <DetailItem
                      label="Contribution"
                      value={fmt(group.contributionAmount)}
                      highlight
                    />

                    <DetailItem
                      label="Frequency"
                      value={formatFrequency(group.frequency)}
                    />

                    <DetailItem
                      label="Schedule"
                      value={group.contributionSchedule || "N/A"}
                    />

                    <DetailItem
                      label="Created"
                      value={formatDate(group.createdAt)}
                    />
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

              <Pagination meta={meta} page={page} setPage={setPage} />
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

            <div className="fixed top-4 right-4 bottom-4 w-[calc(100%-2rem)] md:w-full md:max-w-2xl bg-white/95 backdrop-blur-2xl border border-white/50 shadow-[0_24px_60px_rgba(0,0,0,0.12)] rounded-3xl z-50 flex flex-col overflow-hidden drawer-animate text-sm text-[#181B25]">
              {/* HEADER */}

              <div className="flex justify-between items-center border-b border-gray-100/50 p-6">
                <div className="flex items-center gap-3 min-w-0">
                  {selectedMemberId && (
                    <button
                      onClick={closeMemberDetails}
                      className="shrink-0 p-2 bg-gray-100/50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-full transition-all cursor-pointer"
                    >
                      <HiOutlineArrowLeft size={18} />
                    </button>
                  )}

                  <div className="space-y-1 min-w-0">
                    <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                      {selectedMemberId
                        ? "Member Details"
                        : "Ajo Group Details"}
                    </h2>

                    <div className="text-xs text-gray-400 font-mono truncate">
                      {selectedMemberId
                        ? getMemberName(selectedMember)
                        : `Group ID: ${selectedGroupId}`}
                    </div>
                  </div>
                </div>

                <button
                  onClick={closeDetails}
                  className="shrink-0 p-2 bg-gray-100/50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-full transition-all cursor-pointer"
                >
                  <HiOutlineX size={18} />
                </button>
              </div>

              {/* CONTENT */}

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {isLoadingDetails ? (
                  <LoadingState text="Loading group details..." />
                ) : isDetailsError ? (
                  <ErrorState
                    title="Failed to load group"
                    description="We could not retrieve the complete details for this Ajo group."
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
                          {/* MEMBER PROFILE */}
                          <div className="bg-[#68123D]/5 border border-[#68123D]/10 rounded-2xl p-5">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 shrink-0 rounded-full bg-[#68123D]/10 text-[#68123D] flex items-center justify-center text-sm font-bold border border-[#68123D]/10">
                                {getInitials(
                                  selectedMember.user?.first_name,
                                  selectedMember.user?.last_name,
                                )}
                              </div>

                              <div className="min-w-0">
                                <h3 className="text-lg font-bold text-gray-900">
                                  {getMemberName(selectedMember)}
                                </h3>

                                {selectedMember.user?.email && (
                                  <p className="text-xs text-gray-500 mt-1 truncate">
                                    {selectedMember.user.email}
                                  </p>
                                )}

                                <span
                                  className={`inline-flex mt-2 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getStatusClass(
                                    selectedMember.status,
                                  )}`}
                                >
                                  {formatStatus(selectedMember.status)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* MEMBER SUMMARY */}

                          <DetailSection
                            icon={<HiOutlineUsers size={16} />}
                            title="Member Summary"
                          >
                            <div className="grid grid-cols-2 gap-4">
                              <DetailItem
                                label="Contribution"
                                value={fmt(selectedMember.contributionAmount)}
                                highlight
                              />

                              <DetailItem
                                label="Paid"
                                value={fmt(
                                  selectedMember.totalContributionPaid,
                                )}
                              />

                              <DetailItem
                                label="Total Rounds"
                                value={String(selectedMember.totalRounds ?? 0)}
                              />

                              <DetailItem
                                label="Rounds Paid"
                                value={String(
                                  selectedMember.totalRoundsPaid ?? 0,
                                )}
                              />

                              <DetailItem
                                label="Hands"
                                value={String(selectedMember.hands ?? 0)}
                              />

                              <DetailItem
                                label="Status"
                                value={formatStatus(selectedMember.status)}
                              />
                            </div>
                          </DetailSection>

                          {/* ACCOUNT */}

                          <DetailSection
                            icon={<HiOutlineInformationCircle size={16} />}
                            title="Linked Account"
                          >
                            <div className="grid grid-cols-2 gap-4">
                              <DetailItem
                                label="Account Type"
                                value={
                                  formatStatus(
                                    selectedMember.linkedAccountType,
                                  ) || "N/A"
                                }
                              />

                              <DetailItem
                                label="Account ID"
                                value={selectedMember.linkedAccountId || "N/A"}
                              />

                              <DetailItem
                                label="Business Name"
                                value={selectedMember.businessName || "N/A"}
                              />

                              <DetailItem
                                label="CAC Number"
                                value={selectedMember.cacNumber || "N/A"}
                              />
                            </div>

                            {selectedMember.bankStatementURL && (
                              <a
                                href={selectedMember.bankStatementURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-[#68123D] text-white text-xs font-semibold hover:bg-[#68123D]/90 transition-all"
                              >
                                View Bank Statement
                                <HiOutlineExternalLink size={13} />
                              </a>
                            )}
                          </DetailSection>

                          {/* CONTRIBUTIONS */}

                          <DetailSection
                            icon={<HiOutlineCash size={16} />}
                            title={`Contributions (${memberContributions.length})`}
                          >
                            {memberContributions.length > 0 ? (
                              <div className="space-y-3">
                                {memberContributions.map((contribution) => (
                                  <div
                                    key={contribution.id}
                                    className="p-4 bg-white/70 border border-gray-100 rounded-xl"
                                  >
                                    <div className="flex justify-between gap-3">
                                      <div>
                                        <div className="font-semibold text-xs text-gray-800">
                                          {contribution.cycleNumber
                                            ? `Cycle ${contribution.cycleNumber}`
                                            : "Contribution"}
                                        </div>

                                        <div className="text-[10px] text-gray-400 mt-1">
                                          {formatStatus(contribution.status)}
                                        </div>
                                      </div>

                                      <div className="font-bold text-sm text-gray-900">
                                        {fmt(contribution.amount)}
                                      </div>
                                    </div>

                                    {contribution.createdAt && (
                                      <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-3 pt-3 border-t border-gray-100">
                                        <HiOutlineClock size={11} />

                                        {formatDateTime(contribution.createdAt)}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <EmptyState text="No contributions recorded for this member yet." />
                            )}
                          </DetailSection>

                          {/* PAYOUT SLOTS */}

                          <DetailSection
                            icon={<HiOutlineCheckCircle size={16} />}
                            title={`Payout Slots (${memberPayoutSlots.length})`}
                          >
                            {memberPayoutSlots.length > 0 ? (
                              <div className="space-y-3">
                                {memberPayoutSlots.map((slot) => (
                                  <div
                                    key={slot.id}
                                    className="p-4 bg-white/70 border border-gray-100 rounded-xl"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="font-semibold text-xs text-gray-800">
                                          Slot {slot.slotNumber ?? "N/A"}
                                        </div>

                                        <div className="text-[10px] text-gray-400 mt-1">
                                          {formatStatus(slot.status)}
                                        </div>
                                      </div>

                                      <div className="font-bold text-sm text-gray-900">
                                        {fmt(slot.amount)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <EmptyState text="No payout slot assigned to this member yet." />
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

                        <div className="bg-[#68123D]/5 border border-[#68123D]/10 rounded-2xl p-5">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#68123D]/10 text-[#68123D] flex items-center justify-center">
                              <HiOutlineUsers size={24} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-xl font-bold text-gray-900">
                                  {selectedGroup.name}
                                </h3>

                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getStatusClass(
                                    selectedGroup.status,
                                  )}`}
                                >
                                  {formatStatus(selectedGroup.status)}
                                </span>
                              </div>

                              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                {selectedGroup.description ||
                                  "No description provided."}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* =================================================
                            KEY FINANCIAL CARDS
                        ================================================== */}

                        <div className="grid grid-cols-2 gap-3">
                          <StatCard
                            label="Contribution"
                            value={fmt(selectedGroup.contributionAmount)}
                            icon={<HiOutlineCash size={18} />}
                          />

                          <StatCard
                            label="Target Amount"
                            value={fmt(selectedGroup.targetAmount)}
                            icon={<HiOutlineCheckCircle size={18} />}
                          />

                          <StatCard
                            label="Members"
                            value={`${members.length}/${selectedGroup.groupSize || 0}`}
                            icon={<HiOutlineUsers size={18} />}
                          />

                          <StatCard
                            label="Cycles"
                            value={String(
                              selectedGroup.totalCycles ?? cycles.length ?? 0,
                            )}
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
                              label="Group Size"
                              value={`${selectedGroup.groupSize ?? 0} members`}
                            />

                            <DetailItem
                              label="Current Members"
                              value={`${members.length} member${
                                members.length === 1 ? "" : "s"
                              }`}
                            />

                            <DetailItem
                              label="Privacy"
                              value={formatStatus(selectedGroup.privacy)}
                            />

                            <DetailItem
                              label="Status"
                              value={formatStatus(selectedGroup.status)}
                            />

                            <DetailItem
                              label="Created"
                              value={formatDate(selectedGroup.createdAt)}
                            />

                            <DetailItem
                              label="Updated"
                              value={formatDate(selectedGroup.updatedAt)}
                            />
                          </div>
                        </DetailSection>

                        {/* =================================================
                            FINANCIAL DETAILS
                        ================================================== */}

                        <DetailSection
                          icon={<HiOutlineCash size={16} />}
                          title="Financial Details"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <DetailItem
                              label="Contribution Per Member"
                              value={fmt(selectedGroup.contributionAmount)}
                              highlight
                            />

                            <DetailItem
                              label="Target Amount"
                              value={fmt(selectedGroup.targetAmount)}
                              highlight
                            />

                            <DetailItem
                              label="Frequency"
                              value={formatFrequency(selectedGroup.frequency)}
                            />

                            <DetailItem
                              label="Schedule"
                              value={
                                selectedGroup.contributionSchedule ||
                                "Not specified"
                              }
                            />

                            <DetailItem
                              label="Total Cycles"
                              value={String(selectedGroup.totalCycles ?? 0)}
                            />

                            <DetailItem
                              label="Total Contributions"
                              value={String(contributions.length)}
                            />
                          </div>
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
                              {members.map((member) => {
                                const firstName = member.user?.first_name || "";
                                const lastName = member.user?.last_name || "";
                                const email = member.user?.email || "";

                                const fullName =
                                  `${firstName} ${lastName}`.trim() ||
                                  "Unknown Member";

                                return (
                                  <button
                                    key={member.id}
                                    type="button"
                                    onClick={() => openMemberDetails(member.id)}
                                    className="w-full flex items-center justify-between gap-3 p-4 bg-white/70 border border-gray-100 rounded-xl hover:bg-white hover:border-[#68123D]/20 hover:shadow-sm transition-all text-left cursor-pointer group"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      {/* AVATAR */}
                                      <div className="w-10 h-10 shrink-0 rounded-full bg-[#68123D]/10 text-[#68123D] flex items-center justify-center text-[11px] font-bold border border-[#68123D]/10">
                                        {getInitials(firstName, lastName)}
                                      </div>

                                      {/* USER INFO */}
                                      <div className="min-w-0">
                                        <div className="font-semibold text-gray-800 text-xs truncate">
                                          {fullName}
                                        </div>

                                        <div className="text-[10px] text-gray-400 truncate">
                                          {email ||
                                            `User ID: ${member.userId || "N/A"}`}
                                        </div>
                                      </div>
                                    </div>

                                    {/* MEMBER FINANCIAL INFO */}
                                    <div className="flex items-center gap-3 shrink-0">
                                      <div className="text-right">
                                        <div className="text-xs font-bold text-gray-800">
                                          {fmt(member.contributionAmount)}
                                        </div>

                                        <div className="text-[10px] text-gray-400">
                                          {formatStatus(member.status)}
                                        </div>
                                      </div>

                                      <HiOutlineExternalLink
                                        size={14}
                                        className="text-gray-300 group-hover:text-[#68123D]"
                                      />
                                    </div>
                                  </button>
                                );
                              })}
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
                              {cycles.map((cycle, index) => (
                                <div
                                  key={cycle.id}
                                  className="p-4 bg-white/70 border border-gray-100 rounded-xl"
                                >
                                  <div className="flex items-center justify-between mb-4">
                                    <span className="font-semibold text-gray-800 text-xs">
                                      Cycle {cycle.cycleNumber ?? index + 1}
                                    </span>

                                    <span
                                      className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${getStatusClass(
                                        cycle.status,
                                      )}`}
                                    >
                                      {formatStatus(cycle.status)}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
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
                                <div
                                  key={contribution.id}
                                  className="p-4 bg-white/70 border border-gray-100 rounded-xl"
                                >
                                  <div className="flex justify-between gap-3">
                                    <div>
                                      <div className="font-semibold text-xs text-gray-800">
                                        {contribution.memberName || "Member"}
                                      </div>

                                      <div className="text-[10px] text-gray-400 mt-1">
                                        {contribution.cycleNumber
                                          ? `Cycle ${contribution.cycleNumber}`
                                          : "Contribution"}
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <div className="font-bold text-sm text-gray-900">
                                        {fmt(contribution.amount)}
                                      </div>

                                      <div className="text-[10px] text-gray-400">
                                        {formatStatus(contribution.status)}
                                      </div>
                                    </div>
                                  </div>

                                  {contribution.createdAt && (
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-3 pt-3 border-t border-gray-100">
                                      <HiOutlineClock size={11} />

                                      {formatDateTime(contribution.createdAt)}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <EmptyState text="No contributions have been recorded yet." />
                          )}
                        </DetailSection>

                        {/* =================================================
                            PAYOUT SLOTS
                        ================================================== */}

                        <DetailSection
                          icon={<HiOutlineCheckCircle size={16} />}
                          title={`Payout Slots (${slots.length})`}
                        >
                          {slots.length > 0 ? (
                            <div className="space-y-3">
                              {slots.map((slot) => (
                                <div
                                  key={slot.id}
                                  className="flex items-center justify-between gap-3 p-4 bg-white/70 border border-gray-100 rounded-xl"
                                >
                                  <div>
                                    <div className="font-semibold text-xs text-gray-800">
                                      {slot.memberName || "Member"}
                                    </div>

                                    <div className="text-[10px] text-gray-400 mt-1">
                                      Slot {slot.slotNumber ?? "N/A"}
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
                              ))}
                            </div>
                          ) : (
                            <EmptyState text="No payout slots have been assigned yet." />
                          )}
                        </DetailSection>

                        {/* =================================================
                            GROUP CONFIGURATION
                        ================================================== */}

                        <DetailSection
                          icon={<HiOutlineShieldCheck size={16} />}
                          title="Group Configuration"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <DetailItem
                              label="Invite Code"
                              value={
                                selectedGroup.inviteCode || "Not available"
                              }
                              highlight
                            />

                            <DetailItem
                              label="Privacy"
                              value={formatStatus(selectedGroup.privacy)}
                            />

                            <DetailItem
                              label="Requires Approval"
                              value={
                                selectedGroup.requiresApproval ? "Yes" : "No"
                              }
                            />

                            <DetailItem
                              label="Frequency"
                              value={formatFrequency(selectedGroup.frequency)}
                            />

                            <DetailItem
                              label="Created"
                              value={formatDate(selectedGroup.createdAt)}
                            />

                            <DetailItem
                              label="Last Updated"
                              value={formatDate(selectedGroup.updatedAt)}
                            />
                          </div>
                        </DetailSection>

                        {/* =================================================
                            ADMIN
                        ================================================== */}

                        {selectedGroup.adminId && (
                          <DetailSection
                            icon={<HiOutlineShieldCheck size={16} />}
                            title="Group Administration"
                          >
                            <DetailItem
                              label="Admin ID"
                              value={selectedGroup.adminId}
                            />
                          </DetailSection>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <EmptyState text="No group details available." />
                )}
              </div>

              {/* =====================================================
                  FOOTER
              ====================================================== */}

              <div className="p-6 border-t border-gray-100/50 bg-white/30 backdrop-blur-md">
                {selectedMemberId ? (
                  <button
                    onClick={closeMemberDetails}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-2xl font-semibold text-sm transition-all cursor-pointer shadow-sm inline-flex items-center justify-center gap-2"
                  >
                    <HiOutlineArrowLeft size={16} />
                    Back to Group
                  </button>
                ) : (
                  <button
                    onClick={closeDetails}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-2xl font-semibold text-sm transition-all cursor-pointer shadow-sm"
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
      <span className="text-gray-400 block font-medium mb-0.5 text-[11px]">
        {label}
      </span>

      <span
        className={`text-sm ${
          highlight ? "font-bold text-gray-950" : "font-semibold text-gray-800"
        } break-words`}
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
    <div className="bg-white/60 border border-gray-100 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
          {label}
        </span>

        <div className="w-8 h-8 rounded-xl bg-[#68123D]/10 text-[#68123D] flex items-center justify-center">
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
    <div className="px-6 py-4 bg-white/20 border-t border-gray-100/50 flex items-center justify-between text-xs text-gray-500 font-medium">
      <span>
        Page {meta.page} of {meta.totalPages} ({meta.total} total)
      </span>

      <div className="flex gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="p-2 bg-white/50 border border-gray-200/50 hover:bg-white rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 shadow-sm cursor-pointer"
        >
          <HiOutlineChevronLeft size={16} />
        </button>

        <button
          onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
          disabled={page >= meta.totalPages || meta.totalPages === 0}
          className="p-2 bg-white/50 border border-gray-200/50 hover:bg-white rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 shadow-sm cursor-pointer"
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
    <div className="flex flex-col items-center justify-center py-24 px-4 bg-white/45 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm">
      <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-[#68123D] animate-spin mb-4" />

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
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-red-50/20 backdrop-blur-md border border-red-100/50 rounded-2xl shadow-sm text-center">
      <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
        <HiOutlineX size={22} />
      </div>

      <h3 className="text-sm font-semibold text-red-900 mb-1">{title}</h3>

      <p className="text-xs text-red-700/80 max-w-xs mb-5">{description}</p>

      <button
        onClick={onRetry}
        className="bg-[#68123D] hover:bg-[#68123D]/95 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
      >
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
    <div className="py-8 px-4 bg-gray-50/60 border border-gray-100 rounded-xl text-center">
      <HiOutlineExclamationCircle
        size={20}
        className="mx-auto text-gray-300 mb-2"
      />

      <p className="text-xs text-gray-400">{text}</p>
    </div>
  );
}
