"use client";

import React, { useState } from "react";

import AdminSettings from "./adminSettings/page";

const TABS = [
  { 
    key: "admin-settings", 
    label: "Admin Settings"
  },
] as const;

export default function Settings() {
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["key"]>("admin-settings");

  return (
    <div className="space-y-8 font-satoshi">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100/50 pb-5">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-[#181B25]">
            Settings
          </h1>
          <p className="text-sm text-[#525866]/80 max-w-xl">
            Manage platform settings, registered users, and administrator
            permissions.
          </p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1.5 py-2 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              aria-selected={isActive}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border ${
                isActive
                  ? "bg-[#68123D]/10 text-[#68123D] border-[#68123D]/20 shadow-sm"
                  : "bg-white/50 text-[#525866] hover:bg-white hover:text-[#181B25] border-gray-200/50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      {activeTab === "admin-settings" && <AdminSettings />}
    </div>
  );
}