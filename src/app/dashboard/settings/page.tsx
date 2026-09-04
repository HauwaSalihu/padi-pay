"use client";

import React, { useState } from "react";
import {
  HiOutlineSearch,
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineX,
  HiOutlineExclamation,
} from "react-icons/hi";
import {
  useSearchUsersQuery,
  useMakeUserAdminMutation,
  useRemoveUserAsAdminMutation,
  AdminUser,
} from "@/services/padiApi/adminApi";

export default function AdminSettings() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmUser, setConfirmUser] = useState<AdminUser | null>(null);
  const [adminMessage, setAdminMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const { data, isLoading, isFetching, isError, refetch } = useSearchUsersQuery(
    { query: searchTerm },
    {
      skip: !searchTerm.trim(),
    },
  );

  const [makeUserAdmin, { isLoading: isMakingAdmin }] =
    useMakeUserAdminMutation();

  const [removeUserAsAdmin, { isLoading: isRemovingAdmin }] =
    useRemoveUserAsAdminMutation();

  const users = data?.data || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSearchTerm("");
      return;
    }

    setSearchTerm(trimmedQuery);
  };

  const handleMakeAdmin = async () => {
    if (!confirmUser) return;

    try {
      const response = await makeUserAdmin({
        userId: confirmUser.id,
      }).unwrap();

      setConfirmUser(null);

      setAdminMessage({
        type: "success",
        text:
          response?.message ||
          "User successfully made a PadiPay administrator.",
      });

      refetch();

      setTimeout(() => {
        setAdminMessage(null);
      }, 4000);
    } catch (error: any) {
      console.error("Failed to make user admin:", error);

      setAdminMessage({
        type: "error",
        text:
          error?.data?.message ||
          "Failed to make user an admin. Please try again.",
      });

      setTimeout(() => {
        setAdminMessage(null);
      }, 4000);
    }
  };

  const RemoveAsAdmin = async () => {
    if (!confirmUser) return;

    try {
      const response = await removeUserAsAdmin({
        userId: confirmUser.id,
      }).unwrap();

      setConfirmUser(null);

      setAdminMessage({
        type: "success",
        text: response?.message || "User successfully made a PadiPay User.",
      });

      refetch();

      setTimeout(() => {
        setAdminMessage(null);
      }, 4000);
    } catch (error: any) {
      console.error("Failed to make admin an user:", error);

      setAdminMessage({
        type: "error",
        text:
          error?.data?.message ||
          "Failed to make admin an user. Please try again.",
      });

      setTimeout(() => {
        setAdminMessage(null);
      }, 4000);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "U";
  };

  return (
    <div className="space-y-8 font-satoshi relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100/50 pb-5">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-[#181B25]">
            Settings
          </h1>

          <p className="text-sm text-[#525866]/80 max-w-xl">
            Manage administrator access and user permissions across the
            platform.
          </p>
        </div>
      </div>

      {/* Administrator Management Card */}
      <div className="bg-white/45 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-4 justify-between items-center"
          >
            <div className="relative w-full sm:max-w-md">
              <HiOutlineSearch
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search user by name or email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/40 border border-gray-200/50 hover:bg-white/60 focus:bg-white/80 focus:border-[#68123D]/40 focus:ring-4 focus:ring-[#68123D]/5 rounded-xl outline-none transition-all shadow-inner placeholder-gray-400 text-gray-800"
              />
            </div>

            <button
              type="submit"
              disabled={isFetching || !query.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#68123D] text-white hover:bg-neutral-800 active:bg-neutral-950 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isFetching ? "Searching..." : "Search Users"}
            </button>
          </form>
        </div>
      </div>

      {/* Initial State */}
      {!searchTerm && (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-white/45 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-[#68123D]/5 text-[#68123D] flex items-center justify-center mb-4 border border-[#68123D]/10">
            <HiOutlineSearch size={20} />
          </div>

          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            Search for a user
          </h3>

          <p className="text-xs text-gray-400 max-w-xs">
            Search by name or email address to find a user and manage their
            administrator access.
          </p>
        </div>
      )}

      {/* Loading State */}
      {searchTerm && (isLoading || isFetching) && (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-white/45 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-[#68123D] animate-spin mb-4" />

          <p className="text-sm font-medium text-gray-500">
            Searching users...
          </p>
        </div>
      )}

      {/* Error State */}
      {searchTerm && !isLoading && !isFetching && isError && (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-red-50/20 backdrop-blur-md border border-red-100/50 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 border border-red-100/30">
            <HiOutlineX size={22} />
          </div>

          <h3 className="text-sm font-semibold text-red-900 mb-1">
            Failed to search users
          </h3>

          <p className="text-xs text-red-700/80 max-w-xs mb-5">
            There was an issue searching for users. Please try again.
          </p>

          <button
            onClick={() => refetch()}
            className="bg-[#68123D] hover:bg-[#68123D]/95 active:bg-[#68123D] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* No Users */}
      {searchTerm &&
        !isLoading &&
        !isFetching &&
        !isError &&
        users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-4 bg-white/45 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mb-4 border border-gray-100/50">
              <HiOutlineUser size={20} />
            </div>

            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              No users found
            </h3>

            <p className="text-xs text-gray-400 max-w-xs">
              No users matching &quot;{searchTerm}&quot; were found. Try
              searching with another name or email address.
            </p>
          </div>
        )}

      {/* Results */}
      {searchTerm &&
        !isLoading &&
        !isFetching &&
        !isError &&
        users.length > 0 && (
          <div className="space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-sm font-semibold text-gray-800">
                  Search Results
                </h2>

                <p className="text-xs text-gray-400 mt-0.5">
                  {users.length} user
                  {users.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <span className="text-[11px] font-medium text-gray-400">
                Select a user to manage access
              </span>
            </div>

            {/* Desktop Results */}
            <div className="hidden md:block bg-white/50 backdrop-blur-lg border border-white/70 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100/50 bg-gray-50/20 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-4.5 px-6 font-medium">User</th>

                    <th className="py-4.5 px-6 font-medium">Email</th>

                    <th className="py-4.5 px-6 font-medium">Current Role</th>

                    <th className="py-4.5 px-6 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100/30 text-sm">
                  {users.map((user: AdminUser) => {
                    const isAdmin = user.isPadipayAdmin === true;

                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-white/45 transition-all duration-150 border-b border-gray-100/40 last:border-0 group"
                      >
                        {/* User */}
                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#68123D]/10 to-[#68123D]/5 text-[#68123D] flex items-center justify-center text-xs font-bold border border-[#68123D]/10 shadow-sm transition-transform duration-200 group-hover:scale-105">
                              {getInitials(user.first_name, user.last_name)}
                            </div>

                            <div>
                              <div className="font-semibold text-gray-800 text-sm leading-tight">
                                {user.first_name} {user.last_name}
                              </div>

                              <div className="text-xs text-gray-400 mt-0.5">
                                User ID: {user.id?.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4.5 px-6">
                          <span className="text-sm text-gray-600">
                            {user.email}
                          </span>
                        </td>

                        {/* Role */}
                        <td className="py-4.5 px-6">
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#68123D]/10 text-[#68123D] border border-[#68123D]/15">
                              <HiOutlineShieldCheck size={13} />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-100">
                              User
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-4.5 px-6 text-right">
                          {isAdmin ? (
                            <button
                              onClick={() => setConfirmUser(user)}
                              className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-950 transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer border-0"
                            >
                              <HiOutlineUser size={14} />
                              Remove As Admin
                            </button>
                          ) : (
                            <button
                              onClick={() => setConfirmUser(user)}
                              className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-950 transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer border-0"
                            >
                              <HiOutlineShieldCheck size={14} />
                              Make Admin
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Results */}
            <div className="space-y-4 md:hidden">
              {users.map((user: any) => {
                const isAdmin = user.isPadipayAdmin === true;

                return (
                  <div
                    key={user.id}
                    className="bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl p-5 shadow-sm space-y-4 hover:bg-white/80 transition-all duration-200"
                  >
                    {/* User Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#68123D]/10 to-[#68123D]/5 text-[#68123D] flex items-center justify-center text-xs font-bold border border-[#68123D]/10 shadow-sm">
                        {getInitials(user.first_name, user.last_name)}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                          {user.first_name} {user.last_name}
                        </h3>

                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 border-t border-b border-gray-100/50 py-3.5 text-xs">
                      <div>
                        <span className="text-gray-400 block font-medium">
                          Email
                        </span>

                        <span className="font-semibold text-gray-700 mt-0.5 block break-all">
                          {user.email}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400 block font-medium">
                          Current Role
                        </span>

                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#68123D]/10 text-[#68123D] border border-[#68123D]/15">
                            <HiOutlineShieldCheck size={11} />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-50 text-gray-600 border border-gray-100">
                            User
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex justify-end pt-1">
                      {isAdmin ? (
                        <button
                          onClick={() => setConfirmUser(user)}
                          className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-950 transition-all shadow-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <HiOutlineUser size={14} />
                          Remove As Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmUser(user)}
                          className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-950 transition-all shadow-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <HiOutlineShieldCheck size={14} />
                          Make Admin
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {adminMessage && (
        <div
          className={`fixed top-6 right-6 z-[100] max-w-sm px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-lg transition-all ${
            adminMessage.type === "success"
              ? "bg-emerald-50/90 border-emerald-200/60 text-emerald-800"
              : "bg-rose-50/90 border-rose-200/60 text-rose-800"
          }`}
        >
          <p className="text-xs font-semibold">{adminMessage.text}</p>
        </div>
      )}

      {/* Confirmation Drawer */}
      {confirmUser && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/15 backdrop-blur-md z-40 transition-opacity duration-300"
            onClick={() => !isMakingAdmin && setConfirmUser(null)}
          />

          {/* Drawer */}
          <div className="fixed top-4 right-4 bottom-4 w-[calc(100%-2rem)] md:w-full md:max-w-xl bg-white/75 backdrop-blur-2xl border border-white/50 shadow-[0_24px_60px_rgba(0,0,0,0.12)] rounded-3xl z-50 flex flex-col overflow-hidden">
            {/* Drawer Header */}
            <div className="flex justify-between items-center border-b border-gray-100/50 p-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                  {confirmUser?.isPadipayAdmin
                    ? "Remove Administrator Access"
                    : "Grant Administrator Access"}
                </h2>

                <p className="text-xs text-gray-400">
                  {confirmUser?.isPadipayAdmin
                    ? "Review the administrator before removing their elevated privileges."
                    : "Review the user before granting elevated privileges."}
                </p>
              </div>

              <button
                onClick={() => !isMakingAdmin && setConfirmUser(null)}
                className="p-2 bg-gray-100/50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-full transition-all border border-gray-200/20 cursor-pointer"
              >
                <HiOutlineX size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Warning */}
              <div className="bg-amber-50/40 border border-amber-100/60 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100/60 text-amber-700 rounded-lg">
                    <HiOutlineExclamation size={16} />
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                      Important
                    </h3>

                    <p className="text-xs text-amber-700/80 mt-1.5 leading-relaxed">
                      Administrator access gives this user elevated permissions
                      to manage the platform.
                    </p>
                  </div>
                </div>
              </div>

              {/* User Profile */}
              <div className="bg-white/40 border border-gray-100/60 rounded-2xl p-5 space-y-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
                  <div className="p-1.5 bg-[#68123D]/5 text-[#68123D] rounded-lg">
                    <HiOutlineUser size={16} />
                  </div>

                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    User Profile
                  </h3>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#68123D]/10 to-[#68123D]/5 text-[#68123D] flex items-center justify-center text-sm font-bold border border-[#68123D]/10">
                    {getInitials(confirmUser.first_name, confirmUser.last_name)}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {confirmUser.first_name} {confirmUser.last_name}
                    </p>

                    <p className="text-xs text-gray-400 mt-0.5">
                      {confirmUser.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div>
                    <span className="text-gray-400 block font-medium mb-0.5">
                      Current Role
                    </span>

                    <span className="text-sm font-semibold text-gray-800">
                      {confirmUser?.isPadipayAdmin ? "Admin" : "User"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirmation Text */}
              <p className="text-xs font-medium text-gray-500 leading-relaxed">
                {confirmUser?.isPadipayAdmin ? (
                  <>
                    Are you sure you want to remove administrator access from{" "}
                    <strong className="text-gray-800">
                      {confirmUser.first_name} {confirmUser.last_name}
                    </strong>
                    ? They will no longer have access to administrative features
                    and controls.
                  </>
                ) : (
                  <>
                    Are you sure you want to make{" "}
                    <strong className="text-gray-800">
                      {confirmUser.first_name} {confirmUser.last_name}
                    </strong>{" "}
                    an administrator? This will give them access to
                    administrative features and controls.
                  </>
                )}
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-100/50 bg-white/30 backdrop-blur-md">
              {isMakingAdmin || isRemovingAdmin ? (
                <div className="flex items-center justify-center py-2">
                  <div className="w-5 h-5 rounded-full border-2 border-neutral-200 border-t-[#68123D] animate-spin mr-2 shrink-0" />

                  <span className="text-xs sm:text-sm text-gray-500 font-semibold text-center">
                    {confirmUser?.isPadipayAdmin
                      ? "Removing administrator access..."
                      : "Granting administrator access..."}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3">
                  <button
                    onClick={() => setConfirmUser(null)}
                    className="w-full sm:flex-1 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 py-3 sm:py-3.5 rounded-2xl font-semibold text-sm transition-all cursor-pointer border-0 shadow-sm"
                  >
                    Cancel
                  </button>

                  {confirmUser?.isPadipayAdmin ? (
                    <button
                      onClick={RemoveAsAdmin}
                      className="w-full sm:flex-1 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white py-3 sm:py-3.5 rounded-2xl font-semibold text-sm transition-all cursor-pointer border-0 shadow-sm"
                    >
                      Confirm & Remove Admin
                    </button>
                  ) : (
                    <button
                      onClick={handleMakeAdmin}
                      className="w-full sm:flex-1 bg-[#68123D] hover:bg-[#68123D]/90 active:bg-[#68123D] text-white py-3 sm:py-3.5 rounded-2xl font-semibold text-sm transition-all cursor-pointer border-0 shadow-sm"
                    >
                      Confirm & Make Admin
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
