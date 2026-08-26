"use client";

import React from "react";
import { HiOutlineMenu } from "react-icons/hi";
import { useGetProfileQuery } from "@/services/padiApi/userApi";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { data } = useGetProfileQuery();
  const user = data?.user;
  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
    : "AD";

  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b border-[#E1E4EA] w-full">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="text-[#525866] hover:text-[#181B25] p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <HiOutlineMenu size={24} />
        </button>
        <img
          src="/logo.png"
          alt="PadiPay Logo"
          className="h-6 w-auto object-contain"
        />
      </div>

      <div className="w-8 h-8 rounded-full bg-[#68123D]/10 text-[#68123D] flex items-center justify-center font-bold text-xs border border-[#68123D]/20 flex-shrink-0">
        {initials || "AD"}
      </div>
    </header>
  );
}
