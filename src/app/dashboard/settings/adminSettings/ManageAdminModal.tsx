"use client";

import { useEffect, useState } from "react";
import {
  HiOutlineX,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineShieldCheck,
  HiOutlineCheck,
  HiOutlineBadgeCheck,
} from "react-icons/hi";

import {
  AdminUser,
  AdminRole,
  useGetAdminPermissionsQuery,
  useMakeUserAdminMutation,
} from "@/services/padiApi/adminApi";
import { AVAILABLE_DASHBOARD_PAGES } from "@/config/dashboard-pages";

const ROLE_STYLES: Record<string, string> = {
  SUPERADMIN: "bg-[#68123D]/10 text-[#68123D] border-[#68123D]/20",
  ADMIN: "bg-amber-50/50 text-amber-800 border-amber-100/70",
  USER: "bg-gray-100/50 text-gray-600 border-gray-200/60",
};

const roleLabel = (adminRole?: string | null) => {
  if (adminRole === "SUPERADMIN") return "Super Admin";
  if (adminRole === "ADMIN") return "Admin";
  return "Registered";
};

interface ManageAdminModalProps {
  user: AdminUser | null;
  onClose: () => void;
}

export default function ManageAdminModal({
  user,
  onClose,
}: ManageAdminModalProps) {
  // Prefill the role toggle from the user's current status (existing admins
  // keep their role instead of rendering as a fresh ADMIN promotion).
  const [role, setRole] = useState<"ADMIN" | "SUPERADMIN">(
    user?.adminRole === "SUPERADMIN" ? "SUPERADMIN" : "ADMIN",
  );
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  // Tracks whether the operator has manually (un)ticked a page since the
  // saved permissions arrived, so the prefill below never clobbers edits.
  const [hasEditedPages, setHasEditedPages] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [makeUserAdmin, { isLoading: isSubmitting }] = useMakeUserAdminMutation();

  const isExistingAdmin = user?.adminRole != null;

  const {
    data: permissionsData,
    isError: permissionsError,
    refetch: refetchPermissions,
  } = useGetAdminPermissionsQuery(
    { adminId: user?.adminId ?? "" },
    // Only existing ADMINs hold page permissions: super admins bypass page
    // checks entirely and non-admins have no Admin record yet, so skip both.
    { skip: !user?.adminId || user?.adminRole !== "ADMIN" },
  );

  useEffect(() => {
    if (!user?.adminId || user?.adminRole !== "ADMIN") return;
    refetchPermissions();
  }, [user?.id, user?.adminId, user?.adminRole, refetchPermissions]);

  // The permission query only runs for existing ADMIN rows (see `skip`
  // above).
  const isPermissionsQueryActive =
    !!user?.adminId && user?.adminRole === "ADMIN";

  const showPermissionsLoading =
    isPermissionsQueryActive &&
    !permissionsError &&
    (!permissionsData || permissionsData.data.adminId !== user?.adminId);

  // Prefill the checkboxes with this admin's previously saved page access.
  // The permission fetch is skipped for non-ADMIN rows, so for those the
  // selection simply stays empty. When `user` switches (modal stays mounted),
  // clear the selection first; the prefill below re-applies once the new
  // admin's data arrives.
  useEffect(() => {
    setRole(user?.adminRole === "SUPERADMIN" ? "SUPERADMIN" : "ADMIN");
    setSelectedPages([]);
    setHasEditedPages(false);
    setSubmitError(null);
  }, [user?.id, user?.adminRole]);

  useEffect(() => {
    if (!permissionsData || hasEditedPages) return;
    // Guard against a cached payload from a previously viewed admin and
    // re-run on every open (user?.adminId) even when the cached
    // permissionsData reference itself hasn't changed.
    if (permissionsData.data.adminId !== user?.adminId) return;
    setSelectedPages(permissionsData.data.pageKeys ?? []);
  }, [permissionsData, hasEditedPages, user?.adminId]);

  if (!user) return null;

  const handleClose = () => {
    setSubmitError(null);
    onClose();
  };

  const fullName = [user.first_name, user.middle_name, user.last_name]
    .filter(Boolean)
    .join(" ") || "N/A";
  const initials = `${(user.first_name || "").charAt(0)}${(user.last_name || "").charAt(0)}`.toUpperCase() || "U";

  const togglePage = (pageKey: string) => {
    setHasEditedPages(true);
    if (selectedPages.includes(pageKey)) {
      setSelectedPages(selectedPages.filter((key) => key !== pageKey));
    } else {
      setSelectedPages([...selectedPages, pageKey]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    try {
      await makeUserAdmin({
        targetUserId: user.id,
        role: role as AdminRole,
        // Super admins bypass page restrictions, so submit an empty list.
        selectedPages: role === "SUPERADMIN" ? [] : selectedPages,
      }).unwrap();
      onClose();
    } catch (err: any) {
      console.error("Failed to make user admin:", err);
      setSubmitError(
        err?.data?.message ||
          (role === "SUPERADMIN"
            ? "Failed to promote user to super admin. Please try again."
            : "Failed to save role and access. Please try again."),
      );
    }
  };


  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0.9; }
          to { transform: translateX(0); opacity: 1; }
        }
        .drawer-animate {
          animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Backdrop blur overlay */}
      <div
        className="fixed inset-0 bg-black/15 backdrop-blur-md z-40 transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Slide-over drawer panel */}
      <div className="fixed top-4 right-4 bottom-4 w-[calc(100% - 2rem)] md:w-full md:max-w-xl bg-white/85 backdrop-blur-2xl border border-white/50 shadow-[0_24px_60px_rgba(0,0,0,0.12)] rounded-3xl overflow-hidden flex flex-col text-sm text-[#181B25] drawer-animate z-50">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-gray-100/50 p-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-gray-900">
              Manage Admin
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
              <span>User ID:</span>
              <span className="bg-gray-100/80 px-1.5 py-0.5 rounded text-gray-500 font-medium break-all">
                {user.id}
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 bg-gray-100/50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-full transition-all border border-gray-200/20 cursor-pointer"
            aria-label="Close manage admin"
          >
            <HiOutlineX size={18} />
          </button>
        </div>

        {/* Scrollable details view */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Identity summary */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#68123D]/10 to-[#68123D]/5 text-[#68123D] flex items-center justify-center text-lg font-bold border border-[#68123D]/10 shadow-sm">
              {initials}
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{fullName}</div>
              <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <HiOutlineMail size={12} />
                {user.email || "No email on file"}
              </div>
              <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <HiOutlinePhone size={12} />
                {user.phone || "No phone on file"}
              </div>
            </div>
          </div>

          {/* Admin Status */}
          <div className="bg-white/40 border border-gray-100/60 rounded-2xl p-5 space-y-4 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
              <div className="p-1.5 bg-[#68123D]/5 text-[#68123D] rounded-lg">
                <HiOutlineShieldCheck size={16} />
              </div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Admin Status
              </h3>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-400 block font-medium mb-0.5">
                  Current Status
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${ROLE_STYLES[user.adminRole || "USER"] || ROLE_STYLES.USER}`}>
                  <HiOutlineShieldCheck size={11} />
                  {roleLabel(user.adminRole)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Promotion Form ── */}
          <form id="manage-admin-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Admin Role Selection */}
            <div className="bg-white/40 border border-gray-100/60 rounded-2xl p-5 space-y-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
                <div className="p-1.5 bg-[#68123D]/5 text-[#68123D] rounded-lg">
                  <HiOutlineBadgeCheck size={16} />
                </div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Assign Admin Role
                </h3>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-400 block font-medium mb-0.5">
                    Role Type
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {role === "SUPERADMIN" ? "Super Admin" : "Admin"}
                  </span>
                </div>
              </div>

              {/* Role type toggle */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole("ADMIN")}
                  aria-pressed={role === "ADMIN"}
                  className={`flex-1 text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68123D]/40 ${
                    role === "ADMIN"
                      ? "bg-amber-50/60 text-amber-900 border-amber-200/70 shadow-sm"
                      : "bg-white/60 text-gray-600 border-gray-200/60 hover:bg-white hover:text-gray-800"
                  }`}
                >
                  <span className="block">Admin</span>
                  <span className="text-[11px] opacity-70">Scoped page access</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("SUPERADMIN")}
                  aria-pressed={role === "SUPERADMIN"}
                  className={`flex-1 text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68123D]/40 ${
                    role === "SUPERADMIN"
                      ? "bg-[#68123D]/10 text-[#68123D] border-[#68123D]/20 shadow-sm"
                      : "bg-white/60 text-gray-600 border-gray-200/60 hover:bg-white hover:text-gray-800"
                  }`}
                >
                  <span className="block">Super Admin</span>
                  <span className="text-[11px] opacity-70">Full unrestricted access</span>
                </button>
              </div>
            </div>

            {/* Page Access Selection */}
            <div className="bg-white/40 border border-gray-100/60 rounded-2xl p-5 space-y-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
                <div className="p-1.5 bg-[#68123D]/5 text-[#68123D] rounded-lg">
                  <HiOutlineCheck size={16} />
                </div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Page Access
                </h3>
              </div>

              {role === "SUPERADMIN" ? (
                <div className="flex items-start gap-3 rounded-xl border border-[#68123D]/15 bg-[#68123D]/5 p-3.5 text-xs text-[#68123D]">
                  <HiOutlineShieldCheck size={18} className="shrink-0" />
                  <div>
                    <div className="text-xs font-semibold">Super Admin bypass</div>
                    <div className="text-[11px] opacity-80">
                      Super Admins automatically bypass all individual page
                      restrictions on the backend. No page selection is required.
                    </div>
                  </div>
                </div>
              ) : showPermissionsLoading ? (
                <div className="space-y-2" aria-live="polite">
                  {AVAILABLE_DASHBOARD_PAGES.map((page) => (
                    <div
                      key={page.pageKey}
                      className="flex items-center gap-3 rounded-xl border border-gray-200/60 bg-white/60 p-3"
                    >
                      <div className="h-4 w-4 shrink-0 rounded bg-gray-200/70 animate-pulse" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-1/3 rounded bg-gray-200/70 animate-pulse" />
                        <div className="h-2.5 w-2/3 rounded bg-gray-100 animate-pulse" />
                      </div>
                    </div>
                  ))}
                  <p className="text-[11px] text-gray-400">
                    Loading this admin's saved page access…
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {permissionsError && isExistingAdmin && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/70 bg-amber-50/40 p-3 text-[11px] text-amber-800">
                      <HiOutlineShieldCheck size={15} className="shrink-0 mt-px" />
                      <span>
                        Couldn't load this admin's saved page access — starting
                        with a blank selection. Your changes will still save
                        normally.
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-gray-400">
                    Tick each page to grant or revoke this admin's access.
                    <span className="text-gray-500">
                      ({selectedPages.length} of {AVAILABLE_DASHBOARD_PAGES.length} selected)
                    </span>
                  </p>
                  <div className="space-y-2">
                    {AVAILABLE_DASHBOARD_PAGES.map((page) => {
                      const isActive = selectedPages.includes(page.pageKey);
                      return (
                        <label
                          key={page.pageKey}
                          className={`flex items-start gap-3 rounded-xl border p-3 transition-all cursor-pointer select-none ${
                            isActive
                              ? "bg-[#68123D]/5 border-[#68123D]/20"
                              : "bg-white/70 border-gray-200/70 hover:bg-gray-50 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => togglePage(page.pageKey)}
                            className="mt-0.5 h-4 w-4 shrink-0 accent-[#68123D] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68123D]/40 rounded border-gray-300"
                          />
                          <div className="min-w-0">
                            <div className={`text-xs font-semibold ${isActive ? "text-[#68123D]" : "text-gray-800"}`}>
                              {page.label}
                            </div>
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              {page.description}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  {selectedPages.length === 0 && (
                    <p className="text-[11px] text-amber-700">
                      No pages selected — this admin won't be able to access any
                      dashboard pages.
                    </p>
                  )}
                </div>
              )}
            </div>

            {submitError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-200/60 bg-rose-50/10 p-3 text-xs text-rose-700">
                <HiOutlineShieldCheck size={15} className="shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-100/50 bg-white/30 backdrop-blur-md flex items-center gap-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-semibold text-sm transition-all cursor-pointer border-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="manage-admin-form"
            disabled={isSubmitting}
            className="flex-1 bg-[#68123D] hover:bg-[#68123D]/95 active:bg-[#68123D] text-white py-3 rounded-2xl font-semibold text-sm transition-all cursor-pointer border-0 shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <HiOutlineShieldCheck size={15} />
            )}
            {isSubmitting
              ? "Saving..."
              : role === "SUPERADMIN"
                ? "Promote to Super Admin"
                : "Save Role & Access"}
          </button>
        </div>
      </div>
    </>
  );
}