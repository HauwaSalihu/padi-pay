"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HiOutlineHome,
  HiOutlineClipboardCheck,
  HiOutlineLogout,
  HiOutlineX,
  HiOutlineCog,
  HiOutlineUserGroup,
  HiOutlineCollection,
  HiOutlineClock,
} from "react-icons/hi";
import { useGetProfileQuery } from "@/services/padiApi/userApi";
import { useLogoutMutation } from "@/services/padiApi/authApi";

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useGetProfileQuery();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const user = data?.user;
  const fullName = user
    ? `${user.first_name} ${user.last_name}`.trim()
    : "Admin User";
  const email = user?.email || "admin@padipay.com";

  // Create avatar initials
  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
    : "AD";

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback redirect if API call fails
      router.push("/login");
    }
  };

  const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: HiOutlineHome,
  },
  {
    href: "/dashboard/users",
    label: "Users",
    icon: HiOutlineUserGroup,
  },
  {
    href: "/dashboard/ajo-groups",
    label: "Ajo Groups",
    icon: HiOutlineCollection,
  },
  {
    href: "/dashboard/ajo-applications",
    label: "Ajo Applications",
    icon: HiOutlineClipboardCheck,
  },
  {
    href: "/dashboard/pending-applications",
    label: "Pending Applications",
    icon: HiOutlineClock,
  },
  {
    href: "/dashboard/transactions",
    label: "Transactions",
    icon: HiOutlineClipboardCheck,
  },
];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-[#E1E4EA] flex items-center justify-between flex-shrink-0">
        <Link href="/dashboard" className="flex items-center">
          <img
            src="/logo.png"
            alt="PadiPay Logo"
            className="h-7 w-auto object-contain"
          />
        </Link>
        <button
          onClick={onClose}
          className="md:hidden text-[#525866] hover:text-[#181B25] p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close sidebar"
        >
          <HiOutlineX size={20} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#68123D]/5 text-[#68123D]"
                  : "text-[#525866] hover:bg-gray-50 hover:text-[#181B25]"
              }`}
            >
              <item.icon
                size={20}
                className={isActive ? "text-[#68123D]" : "text-[#8A94A6]"}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile, Logout & Settings */}
      <div className="p-4 border-t border-[#E1E4EA] bg-gray-50/50 flex-shrink-0">
        <Link
          href="/dashboard/settings"
          onClick={onClose}
          className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-[#68123D] hover:bg-gray-50 hover:text-[#181B25] mb-4"
        >
          <HiOutlineCog size={20} />
          <span className="text-[#68123D]">Settings</span>
        </Link>
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-[#68123D]/10 text-[#68123D] flex items-center justify-center font-bold text-sm border border-[#68123D]/20 flex-shrink-0">
            {initials || "AD"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#181B25] truncate">
              {fullName}
            </p>
            <p className="text-xs text-[#8A94A6] truncate">{email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-[#E1E4EA] text-sm font-medium text-[#d32f2f] hover:bg-[#fdeded] hover:border-[#f5c6cb] transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoggingOut ? (
            <span className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></span>
          ) : (
            <>
              <HiOutlineLogout size={20} />
              <span>Log Out</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
