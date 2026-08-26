"use client";

import React from "react";
import { useGetProfileQuery } from "@/services/padiApi/userApi";
import { useGetAppStatsQuery } from "@/services/padiApi/adminApi";
import {
  HiOutlineUsers,
  HiOutlineFolder,
  HiOutlineClipboardCheck,
  HiOutlineTrendingUp,
} from "react-icons/hi";

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

      {/* Quick Activity Section */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E1E4EA] lg:col-span-2">
          <h3 className="text-base font-bold text-[#181B25] mb-4">Recent Activity Logs</h3>
          <div className="space-y-4">
            {[
              { text: "Admin approved Ajo Group 'Lagos Tech Savings'", time: "10 mins ago", type: "success" },
              { text: "User verification request received from Joseph Okon", time: "1 hour ago", type: "info" },
              { text: "System payout of ₦500,000 for 'Ajo Cycle C' successfully executed", time: "3 hours ago", type: "payout" },
              { text: "Ajo application 'Daily Contrib' created by Funmi Adebayo", time: "5 hours ago", type: "new" },
            ].map((log, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-[#E1E4EA]/50 last:border-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 bg-[#68123D]" />
                  <div>
                    <p className="text-sm font-medium text-[#181B25] leading-relaxed">{log.text}</p>
                    <p className="text-xs text-[#8A94A6] mt-0.5">{log.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E1E4EA]">
          <h3 className="text-base font-bold text-[#181B25] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { label: "Review Verification Requests", link: "#" },
              { label: "Approve Ajo Applications", link: "/dashboard/ajo-applications" },
              { label: "View System Reports", link: "#" },
            ].map((action, index) => (
              <a
                key={index}
                href={action.link}
                className="block text-center w-full py-2.5 px-4 rounded-xl border border-[#E1E4EA] text-sm font-medium text-[#181B25] hover:bg-gray-50 hover:border-[#68123D]/30 hover:text-[#68123D] transition-colors"
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>
      </div> */}
    </div>
  );
}

