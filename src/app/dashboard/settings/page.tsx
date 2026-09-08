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
  useGetUsersQuery,
  AdminUser,
  useSearchUsersQuery,
  useMakeUserAdminMutation,
  useMakeUserSuperAdminMutation,
  useRemoveUserAsAdminMutation,
} from "@/services/padiApi/adminApi";

export default function AdminSettings() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmUser, setConfirmUser] = useState<AdminUser | null>(null);

  const [adminMessage, setAdminMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  /*
   * =========================================================
   * USERS
   * =========================================================
   */

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetUsersQuery({
    page: 1,
    limit: 100,
  });

  /*
   * =========================================================
   * SEARCH USERS
   * =========================================================
   */

  const {
    data: searchData,
    isLoading: isSearchLoading,
    isFetching: isSearchFetching,
    isError: isSearchError,
    refetch: refetchSearch,
  } = useSearchUsersQuery(
    {
      query: searchTerm,
    },
    {
      skip: !searchTerm.trim(),
    },
  );

  /*
   * =========================================================
   * ADMIN MUTATIONS
   * =========================================================
   */

  const [makeUserAdmin, { isLoading: isMakingAdmin }] =
    useMakeUserAdminMutation();

  const [makeUserSuperAdmin, { isLoading: isMakingSuperAdmin }] =
    useMakeUserSuperAdminMutation();

  const [removeUserAsAdmin, { isLoading: isRemovingAdmin }] =
    useRemoveUserAsAdminMutation();

  /*
   * =========================================================
   * USERS DATA
   * =========================================================
   */

  const users: AdminUser[] = searchTerm.trim()
    ? searchData || []
    : data?.data || [];

  const isSearching = searchTerm.trim().length > 0;

  const showLoading = isSearching
    ? isSearchLoading || isSearchFetching
    : isLoading || isFetching;

  const showError = isSearching ? isSearchError : isError;

  const isMutating =
    isMakingAdmin || isMakingSuperAdmin || isRemovingAdmin;

  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedQuery = query.trim();

    setSearchTerm(trimmedQuery);
  };

  const handleClearSearch = () => {
    setQuery("");
    setSearchTerm("");
  };

  /*
   * =========================================================
   * MESSAGE
   * =========================================================
   */

  const showMessage = (
    type: "success" | "error",
    text: string,
  ) => {
    setAdminMessage({
      type,
      text,
    });

    setTimeout(() => {
      setAdminMessage(null);
    }, 4000);
  };

  /*
   * =========================================================
   * MAKE ADMIN
   * =========================================================
   */

  const handleMakeAdmin = async () => {
    if (!confirmUser) return;

    try {
      const response = await makeUserAdmin({
        userId: confirmUser.id,
      }).unwrap();

      setConfirmUser(null);

      showMessage(
        "success",
        response?.message ||
          "User successfully made a PadiPay administrator.",
      );

      if (isSearching) {
        await refetchSearch();
      }

      await refetch();
    } catch (error: any) {
      console.error("Failed to make user admin:", error);

      showMessage(
        "error",
        error?.data?.message ||
          "Failed to make user an admin. Please try again.",
      );
    }
  };

  /*
   * =========================================================
   * MAKE SUPER ADMIN
   * =========================================================
   */

  const handleMakeSuperAdmin = async () => {
    if (!confirmUser) return;

    try {
      const response = await makeUserSuperAdmin({
        userId: confirmUser.id,
      }).unwrap();

      setConfirmUser(null);

      showMessage(
        "success",
        response?.message ||
          "User successfully made a PadiPay Super Administrator.",
      );

      if (isSearching) {
        await refetchSearch();
      }

      await refetch();
    } catch (error: any) {
      console.error("Failed to make user super admin:", error);

      showMessage(
        "error",
        error?.data?.message ||
          "Failed to make user a super administrator. Please try again.",
      );
    }
  };

  /*
   * =========================================================
   * REMOVE ADMIN
   * =========================================================
   */

  const handleRemoveAsAdmin = async () => {
    if (!confirmUser) return;

    try {
      const response = await removeUserAsAdmin({
        userId: confirmUser.id,
      }).unwrap();

      setConfirmUser(null);

      showMessage(
        "success",
        response?.message ||
          "Administrator access successfully removed.",
      );

      if (isSearching) {
        await refetchSearch();
      }

      await refetch();
    } catch (error: any) {
      console.error("Failed to remove admin:", error);

      showMessage(
        "error",
        error?.data?.message ||
          "Failed to remove administrator access. Please try again.",
      );
    }
  };

  /*
   * =========================================================
   * INITIALS
   * =========================================================
   */

  const getInitials = (
    firstName?: string,
    lastName?: string,
  ) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "U";
  };

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div className="space-y-8 font-satoshi relative">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100/50 pb-5">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-[#181B25]">
            Settings
          </h1>

          <p className="text-sm text-[#525866]/80 max-w-xl">
            Manage administrator access and user permissions
            across the platform.
          </p>
        </div>
      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="bg-white/45 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-4 justify-between items-center"
          >
            <div className="relative w-full sm:max-w-md">
              <HiOutlineSearch
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />

              <input
                type="text"
                placeholder="Search user by name or email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-white/40 border border-gray-200/50 hover:bg-white/60 focus:bg-white/80 focus:border-[#68123D]/40 focus:ring-4 focus:ring-[#68123D]/5 rounded-xl outline-none transition-all shadow-inner placeholder-gray-400 text-gray-800"
              />

              {query && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <HiOutlineX size={16} />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isFetching || isSearchFetching}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#68123D] text-white hover:bg-neutral-800 active:bg-neutral-950 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSearching && isSearchFetching
                ? "Searching..."
                : isFetching
                  ? "Loading..."
                  : "Search Users"}
            </button>
          </form>
        </div>
      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {showLoading && (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-white/45 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-[#68123D] animate-spin mb-4" />

          <p className="text-sm font-medium text-gray-500">
            {isSearching
              ? "Searching users..."
              : "Loading users..."}
          </p>
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {!showLoading && showError && (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-red-50/20 backdrop-blur-md border border-red-100/50 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 border border-red-100/30">
            <HiOutlineX size={22} />
          </div>

          <h3 className="text-sm font-semibold text-red-900 mb-1">
            Failed to load users
          </h3>

          <p className="text-xs text-red-700/80 max-w-xs mb-5">
            There was an issue loading the users. Please try
            again.
          </p>

          <button
            onClick={() => {
              if (isSearching) {
                refetchSearch();
              } else {
                refetch();
              }
            }}
            className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-all cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* =====================================================
          NO USERS
      ===================================================== */}

      {!showLoading &&
        !showError &&
        users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-4 bg-white/45 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mb-4 border border-gray-100/50">
              <HiOutlineUser size={20} />
            </div>

            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              {isSearching
                ? "No users found"
                : "No users available"}
            </h3>

            <p className="text-xs text-gray-400 max-w-xs">
              {isSearching
                ? `No users matching "${searchTerm}" were found. Try searching with another name or email address.`
                : "There are currently no users on the platform."}
            </p>

            {isSearching && (
              <button
                onClick={handleClearSearch}
                className="mt-5 px-4 py-2 rounded-xl bg-[#68123D] text-white text-xs font-semibold hover:bg-neutral-800 transition-all cursor-pointer"
              >
                Show All Users
              </button>
            )}
          </div>
        )}

      {/* =====================================================
          USERS
      ===================================================== */}

      {!showLoading &&
        !showError &&
        users.length > 0 && (
          <div className="space-y-4">
            {/* =================================================
                DESKTOP
            ================================================= */}

            <div className="hidden md:block bg-white/50 backdrop-blur-lg border border-white/70 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100/50 bg-gray-50/20 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-4.5 px-6 font-medium">
                      User
                    </th>

                    <th className="py-4.5 px-6 font-medium">
                      Email
                    </th>

                    <th className="py-4.5 px-6 font-medium">
                      Current Role
                    </th>

                    <th className="py-4.5 px-6 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100/30 text-sm">
                  {users.map((user: AdminUser) => {
                    const isAdmin =
                      user.role === "ADMIN" ||
                      user.role === "SUPERADMIN";

                    const isSuperAdmin =
                      user.role === "SUPERADMIN";

                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-white/45 transition-all duration-150 border-b border-gray-100/40 last:border-0 group"
                      >
                        {/* User */}

                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#68123D]/10 to-[#68123D]/5 text-[#68123D] flex items-center justify-center text-xs font-bold border border-[#68123D]/10 shadow-sm transition-transform duration-200 group-hover:scale-105">
                              {getInitials(
                                user.first_name,
                                user.last_name,
                              )}
                            </div>

                            <div>
                              <div className="font-semibold text-gray-800 text-sm leading-tight">
                                {user.first_name}{" "}
                                {user.last_name}
                              </div>

                              <div className="text-xs text-gray-400 mt-0.5">
                                User ID:{" "}
                                {user.id?.substring(0, 8)}
                                ...
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}

                        <td className="py-4.5 px-6">
                          <span className="text-sm text-gray-600">
                            {user.email || "—"}
                          </span>
                        </td>

                        {/* Role */}

                        <td className="py-4.5 px-6">
                          {user.role === "SUPERADMIN" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                              <HiOutlineShieldCheck
                                size={13}
                              />
                              Super Admin
                            </span>
                          ) : user.role === "ADMIN" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#68123D]/10 text-[#68123D] border border-[#68123D]/15">
                              <HiOutlineShieldCheck
                                size={13}
                              />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-100">
                              User
                            </span>
                          )}
                        </td>

                        {/* Actions */}

                        <td className="py-4.5 px-6">
                          <div className="flex justify-end gap-2">
                            {isSuperAdmin ? (
                              <span className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                                Super Admin
                              </span>
                            ) : isAdmin ? (
                              <>
                                <button
                                  onClick={() =>
                                    setConfirmUser(user)
                                  }
                                  disabled={isMutating}
                                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-950 transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <HiOutlineUser size={14} />
                                  Remove Admin
                                </button>

                                <button
                                  onClick={() =>
                                    setConfirmUser(user)
                                  }
                                  disabled={isMutating}
                                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#68123D] text-white hover:bg-[#68123D]/90 transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <HiOutlineShieldCheck
                                    size={14}
                                  />
                                  Make Super Admin
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    setConfirmUser(user)
                                  }
                                  disabled={isMutating}
                                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-950 transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <HiOutlineShieldCheck
                                    size={14}
                                  />
                                  Make Admin
                                </button>

                                <button
                                  onClick={() =>
                                    setConfirmUser(user)
                                  }
                                  disabled={isMutating}
                                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#68123D] text-white hover:bg-[#68123D]/90 transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <HiOutlineShieldCheck
                                    size={14}
                                  />
                                  Make Super Admin
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* =================================================
                MOBILE
            ================================================= */}

            <div className="space-y-4 md:hidden">
              {users.map((user: AdminUser) => {
                const isAdmin =
                  user.role === "ADMIN" ||
                  user.role === "SUPERADMIN";

                const isSuperAdmin =
                  user.role === "SUPERADMIN";

                return (
                  <div
                    key={user.id}
                    className="bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl p-5 shadow-sm space-y-4 hover:bg-white/80 transition-all duration-200"
                  >
                    {/* User Header */}

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#68123D]/10 to-[#68123D]/5 text-[#68123D] flex items-center justify-center text-xs font-bold border border-[#68123D]/10 shadow-sm">
                        {getInitials(
                          user.first_name,
                          user.last_name,
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                          {user.first_name} {user.last_name}
                        </h3>

                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {user.email || "No email"}
                        </p>
                      </div>
                    </div>

                    {/* Details */}

                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 border-t border-b border-gray-100/50 py-3.5 text-xs">
                      <div>
                        <span className="text-gray-400 block font-medium">
                          Email
                        </span>

                        <span className="font-semibold text-gray-700 mt-0.5 block break-all">
                          {user.email || "—"}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400 block font-medium">
                          Current Role
                        </span>

                        {user.role === "SUPERADMIN" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                            <HiOutlineShieldCheck
                              size={13}
                            />
                            Super Admin
                          </span>
                        ) : user.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#68123D]/10 text-[#68123D] border border-[#68123D]/15">
                            <HiOutlineShieldCheck
                              size={13}
                            />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-100">
                            User
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}

                    <div className="flex flex-col gap-2 pt-1">
                      {isSuperAdmin ? (
                        <span className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100 text-center">
                          Super Admin
                        </span>
                      ) : isAdmin ? (
                        <>
                          <button
                            onClick={() =>
                              setConfirmUser(user)
                            }
                            disabled={isMutating}
                            className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-all shadow-sm inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                          >
                            <HiOutlineUser size={14} />
                            Remove Admin
                          </button>

                          <button
                            onClick={() =>
                              setConfirmUser(user)
                            }
                            disabled={isMutating}
                            className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#68123D] text-white hover:bg-[#68123D]/90 transition-all shadow-sm inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                          >
                            <HiOutlineShieldCheck
                              size={14}
                            />
                            Make Super Admin
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              setConfirmUser(user)
                            }
                            disabled={isMutating}
                            className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-all shadow-sm inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                          >
                            <HiOutlineShieldCheck
                              size={14}
                            />
                            Make Admin
                          </button>

                          <button
                            onClick={() =>
                              setConfirmUser(user)
                            }
                            disabled={isMutating}
                            className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#68123D] text-white hover:bg-[#68123D]/90 transition-all shadow-sm inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                          >
                            <HiOutlineShieldCheck
                              size={14}
                            />
                            Make Super Admin
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* =====================================================
          SUCCESS / ERROR MESSAGE
      ===================================================== */}

      {adminMessage && (
        <div
          className={`fixed top-6 right-6 z-[100] max-w-sm px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-lg ${
            adminMessage.type === "success"
              ? "bg-emerald-50/90 border-emerald-200/60 text-emerald-800"
              : "bg-rose-50/90 border-rose-200/60 text-rose-800"
          }`}
        >
          <p className="text-xs font-semibold">
            {adminMessage.text}
          </p>
        </div>
      )}

      {/* =====================================================
          CONFIRMATION DRAWER
      ===================================================== */}

      {confirmUser && (
        <>
          {/* Backdrop */}

          <div
            className="fixed inset-0 bg-black/15 backdrop-blur-md z-40"
            onClick={() => {
              if (!isMutating) {
                setConfirmUser(null);
              }
            }}
          />

          {/* Drawer */}

          <div className="fixed top-4 right-4 bottom-4 w-[calc(100%-2rem)] md:w-full md:max-w-xl bg-white/75 backdrop-blur-2xl border border-white/50 shadow-[0_24px_60px_rgba(0,0,0,0.12)] rounded-3xl z-50 flex flex-col overflow-hidden">
            {/* Drawer Header */}

            <div className="flex justify-between items-center border-b border-gray-100/50 p-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                  Administrator Access
                </h2>

                <p className="text-xs text-gray-400">
                  Review the user and choose the appropriate
                  administrator role.
                </p>
              </div>

              <button
                onClick={() => {
                  if (!isMutating) {
                    setConfirmUser(null);
                  }
                }}
                disabled={isMutating}
                className="p-2 bg-gray-100/50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-full transition-all border border-gray-200/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
                      Administrator access gives this user
                      elevated permissions to manage the
                      platform.
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
                    {getInitials(
                      confirmUser.first_name,
                      confirmUser.last_name,
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {confirmUser.first_name}{" "}
                      {confirmUser.last_name}
                    </p>

                    <p className="text-xs text-gray-400 mt-0.5">
                      {confirmUser.email || "No email"}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs text-gray-400 block font-medium mb-1">
                    Current Role
                  </span>

                  {confirmUser.role === "SUPERADMIN" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                      <HiOutlineShieldCheck size={13} />
                      Super Admin
                    </span>
                  ) : confirmUser.role === "ADMIN" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#68123D]/10 text-[#68123D] border border-[#68123D]/15">
                      <HiOutlineShieldCheck size={13} />
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-100">
                      User
                    </span>
                  )}
                </div>
              </div>

              {/* Confirmation */}

              <div className="bg-gray-50/50 border border-gray-100/60 rounded-2xl p-5">
                <p className="text-sm font-medium text-gray-600 leading-relaxed">
                  {confirmUser.role === "SUPERADMIN" ? (
                    <>
                      <strong className="text-gray-800">
                        {confirmUser.first_name}{" "}
                        {confirmUser.last_name}
                      </strong>{" "}
                      already has Super Administrator access.
                    </>
                  ) : confirmUser.role === "ADMIN" ? (
                    <>
                      This user is currently an administrator.
                      You can remove their administrator access or
                      promote them to Super Administrator.
                    </>
                  ) : (
                    <>
                      Choose the administrator level you want to
                      grant to{" "}
                      <strong className="text-gray-800">
                        {confirmUser.first_name}{" "}
                        {confirmUser.last_name}
                      </strong>
                      .
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Drawer Footer */}

            <div className="p-4 sm:p-6 border-t border-gray-100/50 bg-white/30 backdrop-blur-md">
              {isMutating ? (
                <div className="flex items-center justify-center py-2">
                  <div className="w-5 h-5 rounded-full border-2 border-neutral-200 border-t-[#68123D] animate-spin mr-2 shrink-0" />

                  <span className="text-xs sm:text-sm text-gray-500 font-semibold text-center">
                    {isMakingSuperAdmin
                      ? "Granting Super Administrator access..."
                      : isMakingAdmin
                        ? "Granting Administrator access..."
                        : "Removing administrator access..."}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {/* Cancel */}

                  <button
                    onClick={() => setConfirmUser(null)}
                    className="w-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 py-3 sm:py-3.5 rounded-2xl font-semibold text-sm transition-all cursor-pointer border-0 shadow-sm"
                  >
                    Cancel
                  </button>

                  {/* Existing Super Admin */}

                  {confirmUser.role === "SUPERADMIN" && (
                    <div className="text-center text-xs text-purple-700 bg-purple-50 border border-purple-100 rounded-2xl py-3">
                      This user is already a Super Administrator.
                    </div>
                  )}

                  {/* Existing Admin */}

                  {confirmUser.role === "ADMIN" && (
                    <>
                      <button
                        onClick={handleMakeSuperAdmin}
                        className="w-full bg-[#68123D] hover:bg-[#68123D]/90 active:bg-[#68123D] text-white py-3 sm:py-3.5 rounded-2xl font-semibold text-sm transition-all cursor-pointer border-0 shadow-sm"
                      >
                        Confirm & Make Super Admin
                      </button>

                      <button
                        onClick={handleRemoveAsAdmin}
                        className="w-full bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white py-3 sm:py-3.5 rounded-2xl font-semibold text-sm transition-all cursor-pointer border-0 shadow-sm"
                      >
                        Confirm & Remove Admin
                      </button>
                    </>
                  )}

                  {/* Normal User */}

                  {confirmUser.role === "USER" && (
                    <>
                      <button
                        onClick={handleMakeAdmin}
                        className="w-full bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-950 text-white py-3 sm:py-3.5 rounded-2xl font-semibold text-sm transition-all cursor-pointer border-0 shadow-sm"
                      >
                        Confirm & Make Admin
                      </button>

                      <button
                        onClick={handleMakeSuperAdmin}
                        className="w-full bg-[#68123D] hover:bg-[#68123D]/90 active:bg-[#68123D] text-white py-3 sm:py-3.5 rounded-2xl font-semibold text-sm transition-all cursor-pointer border-0 shadow-sm"
                      >
                        Confirm & Make Super Admin
                      </button>
                    </>
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