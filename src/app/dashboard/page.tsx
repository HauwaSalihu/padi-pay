"use client";

import React from "react";
import { useGetProfileQuery } from "@/services/padiApi/userApi";
import { useGetAppStatsQuery } from "@/services/padiApi/adminApi";
import Users from "@/components/Users";
import {
  HiOutlineUsers,
  HiOutlineFolder,
  HiOutlineClipboardCheck,
  HiOutlineTrendingUp,
} from "react-icons/hi";
import { PagePermissionGuard } from "@/components/AuthGuard";

export default function Dashboard() {
  const { data } = useGetProfileQuery();
  const { data: statsData, isLoading: statsLoading } = useGetAppStatsQuery();
  const user = data?.user;
  const firstName = user?.first_name || "Admin";

  const appStats = statsData?.data;

  const stats = [
    {
      title: "User Count",
      value: statsLoading ? "..." : (appStats?.signedUpUsers ?? 0).toLocaleString(),
      icon: HiOutlineUsers,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Active Ajo Groups",
      value: statsLoading ? "..." : (appStats?.activeAjoGroups ?? 0).toLocaleString(),
      icon: HiOutlineFolder,
      color: "text-purple-600 bg-purple-50",
    },
    {
      title: "Ajo Groups Waiting Activation",
      value: statsLoading ? "..." : (appStats?.ajoGroupsWaitingActivation ?? 0).toLocaleString(),
      icon: HiOutlineTrendingUp,
      color: "text-teal-600 bg-teal-50",
    },
    {
      title: "Pending Applications",
      value: statsLoading ? "..." : (appStats?.pendingUsers ?? 0).toLocaleString(),
      icon: HiOutlineClipboardCheck,
      color: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <PagePermissionGuard pageKey="dashboard">
      <div className="space-y-8 font-satoshi">
        {/* Header Banner */}
        <div className="bg-[#68123D] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-[#68123D]/10">
          <div className="relative z-10 max-w-xl">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-white/80 mt-2 text-sm md:text-base leading-relaxed">
              Monitor savings activities, manage user verification requests, and approve Ajo group applications from your central administrator control center.
            </p>
          </div>
          {/* Abstract background blobs */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 mr-12 -mb-20 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        </div>

        {/* Key Metrics Stats Grid */}
        <div>
          <h2 className="text-lg font-bold text-[#181B25] mb-4">Key Metrics Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-[#E1E4EA] hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#525866]">{stat.title}</span>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon size={22} />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-bold text-[#181B25] tracking-tight">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* user listing component goes underneath here. */}
        <Users />
      </div>
    </PagePermissionGuard>
  );
}

