"use client";

import React, { useState } from "react";

import {
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineShieldCheck,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUser,
} from "react-icons/hi";

import { useGetUsersQuery, AdminUser } from "@/services/padiApi/adminApi";
import ManageAdminModal from "./ManageAdminModal";
import { PagePermissionGuard } from "@/components/AuthGuard";

const ROLE_STYLES: Record<string, string> = {
  SUPERADMIN: "bg-[#68123D]/10 text-[#68123D] border-[#68123D]/20",
  ADMIN: "bg-amber-50/50 text-amber-800 border-amber-100/70",
  USER: "bg-gray-100/50 text-gray-600 border-gray-200/60",
};

export default function AdminSettings() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const { data, isLoading, isError, refetch } = useGetUsersQuery({
    page,
    limit,
  });

  const users = data?.data || [];
  const meta = data?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  const getInitials = (first?: string, last?: string) => {
    const f = first ? first.charAt(0) : "";
    const l = last ? last.charAt(0) : "";
    return `${f}${l}`.toUpperCase() || "U";
  };

  const fullName = (u: {
    first_name: string;
    middle_name: string;
    last_name: string;
  }) =>
    [u.first_name, u.middle_name, u.last_name].filter(Boolean).join(" ") ||
    "N/A";

  const fmtDate = (date?: string) => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const roleLabel = (adminRole?: string | null) => {
    if (adminRole === "SUPERADMIN") return "Super Admin";
    if (adminRole === "ADMIN") return "Admin";
    return "Registered";
  };

  return (
    <PagePermissionGuard pageKey="settings">
      <div className="space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100/50 pb-5">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight text-[#181B25]">
              Admin Settings
            </h2>
            <p className="text-sm text-[#525866]/80 max-w-xl">
              Review all registered users and manage their administrator status.
            </p>
          </div>
          {!isLoading && !isError && meta.total > 0 && (
            <div className="self-start md:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#68123D]/10 text-[#68123D] border border-[#68123D]/15 backdrop-blur-md shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#68123D] animate-pulse" />
                {meta.total} Registered Users
              </span>
            </div>
          )}
        </div>

        {/* Show / per-page selector */}
        <div className="bg-white/45 backdrop-blur-md border border-white/60 p-4 rounded-2xl flex items-center justify-end gap-2 shadow-sm">
          <span className="text-xs text-gray-400 font-medium">Show</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="text-xs border border-gray-200/50 p-2.5 rounded-xl bg-white/40 hover:bg-white/60 hover:border-gray-300 focus:border-[#68123D]/40 outline-none cursor-pointer transition-all font-medium text-gray-700 shadow-sm"
          >
            {[5, 10, 20].map((v) => (
              <option key={v} value={v} className="bg-white text-gray-800">
                {v} per page
              </option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 px-4 bg-white/45 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm">
            <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-[#68123D] animate-spin mb-4" />
            <p className="text-sm font-medium text-gray-500">Loading users...</p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-red-50/20 backdrop-blur-md border border-red-100/50 rounded-2xl shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 border border-red-100/30">
              <HiOutlineX size={22} />
            </div>
            <h3 className="text-sm font-semibold text-red-900 mb-1">
              Failed to load users
            </h3>
            <p className="text-xs text-red-700/80 max-w-xs mb-5">
              There was an issue fetching the registered users. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="bg-[#68123D] hover:bg-[#68123D]/95 active:bg-[#68123D] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-4 bg-white/45 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mb-4 border border-gray-100/50">
              <HiOutlineSearch size={20} />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              No users found
            </h3>
            <p className="text-xs text-gray-400 max-w-xs">
              There are no registered users to display.
            </p>
          </div>
        )}
  {/* Desktop Table View */}
        {!isLoading && !isError && users.length > 0 && (
          <div className="hidden md:block bg-white/50 backdrop-blur-lg border border-white/70 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100/50 bg-gray-50/20 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-4.5 px-6 font-medium">ID</th>
                    <th className="py-4.5 px-6 font-medium">Name</th>
                    <th className="py-4.5 px-6 font-medium">Email Address</th>
                    <th className="py-4.5 px-6 font-medium">Phone Number</th>
                    <th className="py-4.5 px-6 font-medium">Admin Status</th>
                    <th className="py-4.5 px-6 font-medium">Date Created</th>
                    <th className="py-4.5 px-6 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/30 text-sm">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-white/45 transition-all duration-150 border-b border-gray-100/40 last:border-0 group"
                    >
                      <td className="py-4.5 px-6">
                        <span className="text-xs font-mono text-gray-400 bg-gray-50/50 px-2 py-1 rounded-md border border-gray-100/30 group-hover:bg-white transition-all">
                          {u.id.substring(0, 8)}...
                        </span>
                      </td>
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#68123D]/10 to-[#68123D]/5 text-[#68123D] flex items-center justify-center text-xs font-bold border border-[#68123D]/10 shadow-sm transition-transform duration-200 group-hover:scale-105">
                            {getInitials(u.first_name, u.last_name)}
                          </div>
                          <div className="font-semibold text-gray-800 text-sm leading-tight">
                            {fullName(u)}
                          </div>
                        </div>
                      </td>
                      <td className="py-4.5 px-6 text-gray-600">
                        {u.email || "N/A"}
                      </td>
                      <td className="py-4.5 px-6 text-gray-600">{u.phone}</td>
                      <td className="py-4.5 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${ROLE_STYLES[u.adminRole || "USER"] || ROLE_STYLES.USER}`}>
                          <HiOutlineShieldCheck size={11} />
                          {roleLabel(u.adminRole)}
                        </span>
                      </td>
                      <td className="py-4.5 px-6">
                        <span className="text-sm text-gray-600">
                          {fmtDate(u.date_created)}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#68123D]/10 text-[#68123D] hover:bg-[#68123D]/15 active:bg-[#68123D]/20 border border-[#68123D]/15 transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <HiOutlineUser size={13} className="opacity-80" />
                          Manage Admin
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="px-6 py-4.5 bg-white/20 border-t border-gray-100/50 flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>
                Page {meta.page} of {meta.totalPages} ({meta.total} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 bg-white/50 border border-gray-200/50 hover:bg-white hover:border-gray-300 active:bg-gray-100 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 shadow-sm cursor-pointer"
                >
                  <HiOutlineChevronLeft size={16} />
                </button>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(meta.totalPages, p + 1))
                  }
                  disabled={page >= meta.totalPages}
                  className="p-2 bg-white/50 border border-gray-200/50 hover:bg-white hover:border-gray-300 active:bg-gray-100 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 shadow-sm cursor-pointer"
                >
                  <HiOutlineChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Card Stack View */}
        {!isLoading && !isError && users.length > 0 && (
          <div className="space-y-4 md:hidden mt-6">
            {users.map((u) => (
              <div
                key={u.id}
                className="bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl p-5 shadow-sm space-y-4 hover:bg-white/80 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#68123D]/10 to-[#68123D]/5 text-[#68123D] flex items-center justify-center text-xs font-bold border border-[#68123D]/10 shadow-sm">
                      {getInitials(u.first_name, u.last_name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                        {fullName(u)}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {u.email || u.phone}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-100/50 px-2 py-1 rounded-md border border-gray-100/30">
                    #{u.id.substring(0, 8)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${ROLE_STYLES[u.adminRole || "USER"] || ROLE_STYLES.USER}`}>
                    <HiOutlineShieldCheck size={11} />
                    {roleLabel(u.adminRole)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(u)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#68123D]/10 text-[#68123D] hover:bg-[#68123D]/15 active:bg-[#68123D]/20 border border-[#68123D]/15 transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <HiOutlineUser size={13} className="opacity-80" />
                    Manage Admin
                  </button>
                </div>
              </div>
            ))}

            {/* Mobile Footer / Pagination */}
            <div className="bg-white/45 backdrop-blur-md border border-white/60 p-4 rounded-2xl flex items-center justify-between text-xs text-gray-500 font-medium shadow-sm">
              <span>Page {meta.page} of {meta.totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2.5 bg-white border border-gray-200/50 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 shadow-sm cursor-pointer"
                >
                  <HiOutlineChevronLeft size={16} />
                </button>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(meta.totalPages, p + 1))
                  }
                  disabled={page >= meta.totalPages}
                  className="p-2.5 bg-white border border-gray-200/50 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 shadow-sm cursor-pointer"
                >
                  <HiOutlineChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      <ManageAdminModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      </div>
    </PagePermissionGuard>
  );
}