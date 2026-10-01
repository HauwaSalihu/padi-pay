"use client";

import React, { Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HiOutlineUsers, HiOutlineClipboardList } from "react-icons/hi";

import { PagePermissionGuard } from "@/components/AuthGuard";
import AjoGroupsView from "@/components/Ajo/AjoGroupsView";
import AjoApplicationsView from "@/components/Ajo/AjoApplicationsView";

const TAB_KEYS = ["groups", "applications"] as const;
type TabKey = (typeof TAB_KEYS)[number];

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "groups", label: "Ajo Groups", icon: <HiOutlineUsers size={16} /> },
  {
    key: "applications",
    label: "Ajo Applications",
    icon: <HiOutlineClipboardList size={16} />,
  },
];

function AjoTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Seed the initial tab from `?tab=` so refreshes and deep-links keep the view.
  const paramTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<TabKey>(
    paramTab === "applications" ? "applications" : "groups"
  );

  const handleTabChange = (tab: TabKey) => {
    if (tab === activeTab) return;

    setActiveTab(tab);

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-8 font-satoshi relative">
      {/* Page Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100/50 pb-5">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-[#181B25]">
            Ajo
          </h1>
          <p className="text-sm text-[#525866]/80 max-w-xl">
            Manage Ajo savings groups and review pending member applications.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Ajo views"
          className="self-start md:self-auto inline-flex items-center gap-1 p-1 rounded-2xl bg-white/45 backdrop-blur-md border border-white/60 shadow-sm"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabChange(tab.key)}
                className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border-0 ${
                  isActive
                    ? "bg-[#68123D] text-white shadow-sm"
                    : "text-[#525866] hover:bg-white/70"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active View */}
      <div role="tabpanel">
        {activeTab === "groups" ? <AjoGroupsView /> : <AjoApplicationsView />}
      </div>
    </div>
  );
}

export default function AjoPage() {
  return (
    <PagePermissionGuard pageKey="ajo">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh] font-satoshi">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#68123D] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-500">Loading Ajo...</p>
            </div>
          </div>
        }
      >
        <AjoTabs />
      </Suspense>
    </PagePermissionGuard>
  );
}

