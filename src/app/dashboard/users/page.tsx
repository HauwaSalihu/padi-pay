"use client";

import React, { useState } from "react";
import {
  HiOutlineSearch,
  HiOutlineExternalLink,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineShieldCheck,
  HiOutlineIdentification,
} from "react-icons/hi";

import { useGetUsersQuery, User } from "@/services/padiApi/adminApi";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data, isLoading, isError, refetch } = useGetUsersQuery({
    page,
    limit,
  });

  const users = data?.data || [];
  console.log(users);

  const meta = data?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  const filteredUsers = users.filter((user) => {
    const search = query.toLowerCase();

    return (
      `${user.first_name || ""} ${user.last_name || ""}`
        .toLowerCase()
        .includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phone?.toLowerCase().includes(search)
    );
  });

  const getInitials = (first?: string, last?: string) => {
    const f = first?.charAt(0) || "";
    const l = last?.charAt(0) || "";

    return `${f}${l}`.toUpperCase() || "U";
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const closeDetails = () => {
    setSelectedUser(null);
  };

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

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100/50 pb-5">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-[#181B25]">
            Users
          </h1>

          <p className="text-sm text-[#525866]/80 max-w-xl">
            View and manage all registered users on PadiPay.
          </p>
        </div>

        {!isLoading && !isError && meta.total > 0 && (
          <div className="self-start md:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#68123D]/10 text-[#68123D] border border-[#68123D]/15 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#68123D]" />
              {meta.total} {meta.total === 1 ? "User" : "Users"}
            </span>
          </div>
        )}
      </div>

      {/* Search and Pagination Configuration */}
      <div className="bg-white/45 backdrop-blur-md border border-white/60 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <HiOutlineSearch
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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

      {/* Loading */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-white/45 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-[#68123D] animate-spin mb-4" />

          <p className="text-sm font-medium text-gray-500">Loading users...</p>
        </div>
      ) : isError ? (
        /* Error */
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-red-50/20 backdrop-blur-md border border-red-100/50 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 border border-red-100/30">
            <HiOutlineX size={22} />
          </div>

          <h3 className="text-sm font-semibold text-red-900 mb-1">
            Failed to load users
          </h3>

          <p className="text-xs text-red-700/80 max-w-xs mb-5">
            There was an issue fetching registered users.
          </p>

          <button
            onClick={() => refetch()}
            className="bg-[#68123D] hover:bg-[#68123D]/95 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        /* Empty */
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-white/45 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mb-4 border border-gray-100/50">
            <HiOutlineSearch size={20} />
          </div>

          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            No users found
          </h3>

          <p className="text-xs text-gray-400 max-w-xs">
            No registered users match your search.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Users Table */}
          <div className="hidden md:block bg-white/50 backdrop-blur-lg border border-white/70 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100/50 bg-gray-50/20 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-4.5 px-6 font-medium">User</th>

                    <th className="py-4.5 px-6 font-medium">Phone</th>

                    <th className="py-4.5 px-6 font-medium">Role</th>

                    <th className="py-4.5 px-6 font-medium">Status</th>

                    <th className="py-4.5 px-6 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100/30 text-sm">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-white/45 transition-all duration-150 border-b border-gray-100/40 last:border-0 group"
                    >
                      {/* User */}
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#68123D]/10 to-[#68123D]/5 text-[#68123D] flex items-center justify-center text-xs font-bold border border-[#68123D]/10 shadow-sm group-hover:scale-105 transition-transform">
                            {getInitials(user.first_name, user.last_name)}
                          </div>

                          <div>
                            <div className="font-semibold text-gray-800 text-sm leading-tight">
                              {user.first_name} {user.last_name}
                            </div>

                            <div className="text-xs text-gray-400 mt-0.5">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-4.5 px-6">
                        <span className="text-sm font-medium text-gray-700">
                          {user.phone || "N/A"}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="py-4.5 px-6">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            user.isPadipayAdmin
                              ? "bg-[#68123D]/10 text-[#68123D] border-[#68123D]/15"
                              : "bg-gray-50 text-gray-600 border-gray-100"
                          }`}
                        >
                          {user.isPadipayAdmin ? "Admin" : "User"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4.5 px-6">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            user.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-gray-50 text-gray-600 border-gray-100"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4.5 px-6 text-right">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-950 transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer border-0"
                        >
                          View Details
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

            {/* Desktop Pagination */}
            <div className="px-6 py-4.5 bg-white/20 border-t border-gray-100/50 flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>
                Page {meta.page} of {meta.totalPages} ({meta.total} total)
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 bg-white/50 border border-gray-200/50 hover:bg-white hover:border-gray-300 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 shadow-sm"
                >
                  <HiOutlineChevronLeft size={16} />
                </button>

                <button
                  onClick={() =>
                    setPage((p) => Math.min(meta.totalPages, p + 1))
                  }
                  disabled={page >= meta.totalPages}
                  className="p-2 bg-white/50 border border-gray-200/50 hover:bg-white hover:border-gray-300 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 shadow-sm"
                >
                  <HiOutlineChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Users */}
          <div className="space-y-4 md:hidden mt-6">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl p-5 shadow-sm space-y-4 hover:bg-white/80 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#68123D]/10 to-[#68123D]/5 text-[#68123D] flex items-center justify-center text-xs font-bold border border-[#68123D]/10">
                    {getInitials(user.first_name, user.last_name)}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {user.first_name} {user.last_name}
                    </h3>

                    <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100/50 py-4 text-xs">
                  <div>
                    <span className="text-gray-400 block">Phone</span>

                    <span className="font-semibold text-gray-700 mt-1 block">
                      {user.phone || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-all inline-flex items-center gap-1.5"
                  >
                    View Details
                    <HiOutlineExternalLink size={13} />
                  </button>
                </div>
              </div>
            ))}

            {/* Mobile Pagination */}
            <div className="bg-white/45 backdrop-blur-md border border-white/60 p-4 rounded-2xl flex items-center justify-between text-xs text-gray-500 font-medium shadow-sm">
              <span>
                Page {meta.page} of {meta.totalPages}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2.5 bg-white border border-gray-200/50 rounded-xl disabled:opacity-30"
                >
                  <HiOutlineChevronLeft size={16} />
                </button>

                <button
                  onClick={() =>
                    setPage((p) => Math.min(meta.totalPages, p + 1))
                  }
                  disabled={page >= meta.totalPages}
                  className="p-2.5 bg-white border border-gray-200/50 rounded-xl disabled:opacity-30"
                >
                  <HiOutlineChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* User Details Drawer */}
      {selectedUser && (
        <>
          <div
            className="fixed inset-0 bg-black/15 backdrop-blur-md z-40"
            onClick={closeDetails}
          />

          <div className="fixed top-4 right-4 bottom-4 w-[calc(100%-2rem)] md:w-full md:max-w-xl bg-white/75 backdrop-blur-2xl border border-white/50 shadow-[0_24px_60px_rgba(0,0,0,0.12)] rounded-3xl z-50 flex flex-col overflow-hidden drawer-animate text-sm text-[#181B25]">
            {/* Drawer Header */}
            <div className="flex justify-between items-center border-b border-gray-100/50 p-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                  User Details
                </h2>

                <p className="text-xs text-gray-400 mt-1">
                  View complete account information
                </p>
              </div>

              <button
                onClick={closeDetails}
                className="p-2 bg-gray-100/50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-full transition-all"
              >
                <HiOutlineX size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile */}
              <div className="flex flex-col items-center text-center pb-5 border-b border-gray-100/50">
                <div className="w-16 h-16 rounded-full bg-[#68123D]/10 text-[#68123D] flex items-center justify-center text-lg font-bold mb-3">
                  {getInitials(selectedUser.first_name, selectedUser.last_name)}
                </div>

                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedUser.first_name} {selectedUser.last_name}
                </h3>

                <p className="text-xs text-gray-400 mt-1">
                  {selectedUser.email}
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                      selectedUser.isPadipayAdmin
                        ? "bg-[#68123D]/10 text-[#68123D] border-[#68123D]/15"
                        : "bg-gray-50 text-gray-600 border-gray-100"
                    }`}
                  >
                    {selectedUser.isPadipayAdmin
                      ? "Admin"
                      : "User"}
                  </span>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white/40 border border-gray-100/60 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
                  <div className="p-1.5 bg-[#68123D]/5 text-[#68123D] rounded-lg">
                    <HiOutlineUser size={16} />
                  </div>

                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Personal Information
                  </h3>
                </div>

                <div className="space-y-4">
                  <DetailRow
                    icon={<HiOutlineUser />}
                    label="Full Name"
                    value={`${selectedUser.first_name || ""} ${
                      selectedUser.last_name || ""
                    }`}
                  />

                  <DetailRow
                    icon={<HiOutlineMail />}
                    label="Email Address"
                    value={selectedUser.email}
                  />

                  <DetailRow
                    icon={<HiOutlinePhone />}
                    label="Phone Number"
                    value={selectedUser.phone || "N/A"}
                  />

                  <DetailRow
                    icon={<HiOutlineIdentification />}
                    label="Gender"
                    value={selectedUser.gender || "N/A"}
                  />
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h1>Account Information will be here</h1>
              </div>

              {/* System Information */}
              <div className="bg-white/40 border border-gray-100/60 rounded-2xl p-5">
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-2">
                  User ID
                </span>

                <div className="bg-gray-50/80 border border-gray-100 rounded-xl px-3 py-2.5">
                  <span className="text-xs font-mono text-gray-600 break-all">
                    {selectedUser.id}
                  </span>
                </div>
              </div>
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
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div>
        <span className="text-[11px] text-gray-400 block font-medium">
          {label}
        </span>

        <span className="text-sm font-semibold text-gray-800 break-all">
          {value || "N/A"}
        </span>
      </div>
    </div>
  );
}
