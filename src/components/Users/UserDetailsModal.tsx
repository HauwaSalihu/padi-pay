"use client";

import {
  HiOutlineX,
  HiOutlineUser,
  HiOutlineIdentification,
  HiOutlineBadgeCheck,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineCreditCard,
  HiOutlineShieldCheck,
  HiOutlineUsers,
} from "react-icons/hi";
import { useGetUserDetailsQuery } from "@/services/padiApi/userApi";

interface UserDetailsModalProps {
  userId: string | null;
  onClose: () => void;
}

export default function UserDetailsModal({ userId, onClose }: UserDetailsModalProps) {
  const { data: user, isLoading, isError, refetch } = useGetUserDetailsQuery(userId!, {
    skip: !userId,
  });

  if (!userId) return null;

  const fullName = user
    ? [user.names.first_name, user.names.middle_name, user.names.last_name]
        .filter(Boolean)
        .join(" ") || "N/A"
    : "N/A";

  const initials = user
    ? `${(user.names.first_name || "").charAt(0)}${(user.names.last_name || "").charAt(0)}`.toUpperCase() ||
      "U"
    : "U";

  const fmtDate = (date?: string | null) => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const StatusBadge = ({ verified }: { verified: boolean }) => (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
        verified
          ? "bg-emerald-50/70 text-emerald-700 border-emerald-100/70"
          : "bg-amber-50/70 text-amber-700 border-amber-100/70"
      }`}
    >
      {verified ? "Verified" : "Not Verified"}
    </span>
  );

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
      <div className="fixed inset-0 bg-black/15 backdrop-blur-md z-40 transition-opacity duration-300" onClick={onClose} />

      {/* Slide-over drawer panel */}
      <div className="fixed top-4 right-4 bottom-4 w-[calc(100% - 2rem)] md:w-full md:max-w-xl bg-white/85 backdrop-blur-2xl border border-white/50 shadow-[0_24px_60px_rgba(0,0,0,0.12)] rounded-3xl overflow-hidden flex flex-col text-sm text-[#181B25] drawer-animate z-50">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-gray-100/50 p-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-gray-900">User Details</h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
              <span>User ID:</span>
              <span className="bg-gray-100/80 px-1.5 py-0.5 rounded text-gray-500 font-medium break-all">
                {userId}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100/50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-full transition-all border border-gray-200/20 cursor-pointer"
            aria-label="Close details"
          >
            <HiOutlineX size={18} />
          </button>
        </div>

        {/* Scrollable details view */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 space-y-3">
              <div className="w-10 h-10 border-4 border-[#68123D]/20 border-t-[#68123D] rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading user details...</span>
            </div>
          )}

          {isError && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 space-y-4 text-center">
              <HiOutlineShieldCheck size={36} className="text-red-400" />
              <div>
                <div className="text-sm font-semibold text-gray-700">Failed to load user details</div>
                <div className="text-xs mt-1">Please try again.</div>
              </div>
              <button
                onClick={refetch}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-all cursor-pointer border-0"
              >
                Retry
              </button>
            </div>
          )}

          {user && !isLoading && (
            <>
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

              {/* Account Profile */}
              <div className="bg-white/40 border border-gray-100/60 rounded-2xl p-5 space-y-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
                  <div className="p-1.5 bg-[#68123D]/5 text-[#68123D] rounded-lg">
                    <HiOutlineUser size={16} />
                  </div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Profile</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium mb-0.5">First Name</span>
                    <span className="text-sm font-semibold text-gray-800">{user.names.first_name || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium mb-0.5">Middle Name</span>
                    <span className="text-sm font-semibold text-gray-800">{user.names.middle_name || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium mb-0.5">Last Name</span>
                    <span className="text-sm font-semibold text-gray-800">{user.names.last_name || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium mb-0.5">Phone Number</span>
                    <span className="text-sm font-semibold text-gray-800">{user.phone || "N/A"}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 block font-medium mb-0.5">Email Address</span>
                    <span className="text-sm font-semibold text-gray-800 break-all">{user.email || "N/A"}</span>
                  </div>
                </div>
              </div>
{/* Verification */}
              <div className="bg-white/40 border border-gray-100/60 rounded-2xl p-5 space-y-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
                  <div className="p-1.5 bg-[#68123D]/5 text-[#68123D] rounded-lg">
                    <HiOutlineBadgeCheck size={16} />
                  </div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Verification</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium mb-1">Email</span>
                    <StatusBadge verified={!!user.verification.isEmailVerified} />
                    <div className="text-[11px] text-gray-400 mt-1.5">
                      Verified: {fmtDate(user.verification.emailVerifiedAt)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium mb-1">Phone</span>
                    <StatusBadge verified={!!user.verification.isPhoneVerified} />
                    <div className="text-[11px] text-gray-400 mt-1.5">
                      Verified: {fmtDate(user.verification.phoneVerifiedAt)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium mb-1">BVN</span>
                    <StatusBadge verified={!!user.identity?.bvnVerified} />
                    <div className="text-[11px] text-gray-400 mt-1.5">
                      Verified: {fmtDate(user.identity?.bvnVerifiedAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* BVN / Identity */}
              <div className="bg-white/40 border border-gray-100/60 rounded-2xl p-5 space-y-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
                  <div className="p-1.5 bg-[#68123D]/5 text-[#68123D] rounded-lg">
                    <HiOutlineShieldCheck size={16} />
                  </div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">BVN / Identity</h3>
                </div>

                {user.identity ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400 block font-medium mb-0.5">BVN Verification</span>
                      <StatusBadge verified={!!user.identity.bvnVerified} />
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium mb-0.5">BVN Last 4 Digits</span>
                      <span className="text-sm font-mono font-semibold text-gray-800">
                        {user.identity.bvnLast4 || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium mb-0.5">Verified Date</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {fmtDate(user.identity.bvnVerifiedAt)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No BVN identity information on file.</p>
                )}
              </div>
{/* Bank Accounts */}
              <div className="bg-white/40 border border-gray-100/60 rounded-2xl p-5 space-y-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
                  <div className="p-1.5 bg-[#68123D]/5 text-[#68123D] rounded-lg">
                    <HiOutlineCreditCard size={16} />
                  </div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Bank Accounts ({user.bankAccounts?.length ?? 0})
                  </h3>
                </div>

                {user.bankAccounts && user.bankAccounts.length > 0 ? (
                  <div className="space-y-3">
                    {user.bankAccounts.map((acc) => (
                      <div
                        key={acc.id}
                        className="flex items-center justify-between gap-3 border border-gray-100/70 rounded-xl p-3.5 bg-white/40"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-800 truncate">
                            {acc.accountName || "Unnamed account"}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {acc.bankName || "Unknown bank"}
                            {acc.last4 ? ` •••• ${acc.last4}` : ""}
                          </div>
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-indigo-50/50 text-indigo-700 border-indigo-100/60 capitalize">
                          {acc.status?.toLowerCase() || "Unknown"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No bank accounts on file.</p>
                )}
              </div>
{/* Next of Kin */}
              <div className="bg-white/40 border border-gray-100/60 rounded-2xl p-5 space-y-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
                  <div className="p-1.5 bg-[#68123D]/5 text-[#68123D] rounded-lg">
                    <HiOutlineUsers size={16} />
                  </div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Next of Kin ({user.nextOfKin?.length ?? 0})
                  </h3>
                </div>

                {user.nextOfKin && user.nextOfKin.length > 0 ? (
                  <div className="space-y-3">
                    {user.nextOfKin.map((kin, idx) => (
                      <div key={idx} className="border border-gray-100/70 rounded-xl p-3.5 bg-white/40 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-gray-800">{kin.name || "N/A"}</span>
                          <span className="shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-[#68123D]/5 text-[#68123D] border-[#68123D]/10 capitalize">
                            {kin.relationship || "N/A"}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                          <div className="flex items-center gap-1.5 text-gray-500 min-w-0">
                            <HiOutlineMail size={12} className="shrink-0" />
                            <span className="truncate">{kin.email || "No email"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500 min-w-0">
                            <HiOutlinePhone size={12} className="shrink-0" />
                            <span className="truncate">{kin.phone || "No phone"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No next of kin on file.</p>
                )}
              </div>

              {/* Account Metadata */}
              <div className="bg-white/40 border border-gray-100/60 rounded-2xl p-5 space-y-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
                  <div className="p-1.5 bg-[#68123D]/5 text-[#68123D] rounded-lg">
                    <HiOutlineIdentification size={16} />
                  </div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Metadata</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium mb-0.5">User ID</span>
                    <span className="text-sm font-mono font-semibold text-gray-800 break-all">{user.id}</span>
                  </div>
                </div>
              </div>
</>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-100/50 bg-white/30 backdrop-blur-md">
          <button
            onClick={onClose}
            className="w-full bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-950 text-white py-3 rounded-2xl font-semibold text-sm transition-all cursor-pointer border-0 shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
