"use client";

import { HiOutlineX, HiOutlineUser, HiOutlineIdentification } from "react-icons/hi";
import type { AdminUser } from "@/services/padiApi/adminApi";

interface UserDetailsModalProps {
  user: AdminUser | null;
  onClose: () => void;
}

export default function UserDetailsModal({ user, onClose }: UserDetailsModalProps) {
  if (!user) return null;

  const fullName =
    [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(" ") || "N/A";

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
                <span className="bg-gray-100/80 px-1.5 py-0.5 rounded text-gray-500 font-medium">{user.id}</span>
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
            {/* Identity summary */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#68123D]/10 to-[#68123D]/5 text-[#68123D] flex items-center justify-center text-lg font-bold border border-[#68123D]/10 shadow-sm">
                {(user.first_name.charAt(0) + user.last_name.charAt(0)).toUpperCase() || "U"}
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{fullName}</div>
                <div className="text-xs text-gray-400 mt-0.5">{user.email || "No email on file"}</div>
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
                  <span className="text-sm font-semibold text-gray-800">{user.first_name || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium mb-0.5">Middle Name</span>
                  <span className="text-sm font-semibold text-gray-800">{user.middle_name || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium mb-0.5">Last Name</span>
                  <span className="text-sm font-semibold text-gray-800">{user.last_name || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium mb-0.5">Phone Number</span>
                  <span className="text-sm font-semibold text-gray-800">{user.phone}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-400 block font-medium mb-0.5">Email Address</span>
                  <span className="text-sm font-semibold text-gray-800 break-all">{user.email || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Account Metadata */}
            <div className="bg-white/40 border border-gray-100/60 rounded-2xl p-5 space-y-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
                <div className="p-1.5 bg-[#68123D]/5 text-[#68123D] rounded-lg">
                  <HiOutlineIdentification size={16} />
                </div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Metadata</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <span className="text-gray-400 block font-medium mb-0.5">User ID</span>
                  <span className="text-sm font-mono font-semibold text-gray-800 break-all">{user.id}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium mb-0.5">Date Created</span>
                  <span className="text-sm font-semibold text-gray-800">{fmtDate(user.date_created)}</span>
                </div>
              </div>
            </div>
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