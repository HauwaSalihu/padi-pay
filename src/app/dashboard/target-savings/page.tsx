"use client";

import React, { Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  HiOutlineUsers,
  HiOutlineUser,
} from "react-icons/hi";

import { PagePermissionGuard } from "@/components/AuthGuard";
import GroupTargetSavingsView from "../../../components/Target Savings/GroupTargetSavingsView";
import IndividualTargetSavingsView from "../../../components/Target Savings/IndividualTargetSavingsView";

const TAB_KEYS = ["gts", "its"] as const;
type TabKey = (typeof TAB_KEYS)[number];

const TABS: {
  key: TabKey;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "its",
    label: "Individual",
    description: "Individual Target Savings",
    icon: <HiOutlineUser size={16} />,
  },
  {
    key: "gts",
    label: "Group",
    description: "Group Target Savings",
    icon: <HiOutlineUsers size={16} />,
  },
  
];

function TargetSavingsTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const paramTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<TabKey>(
    paramTab === "gts" ? "gts" : "its",
  );

  const handleTabChange = (tab: TabKey) => {
    if (tab === activeTab) return;

    setActiveTab(tab);

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);

    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <div className="relative space-y-8 font-satoshi">
      {/* HEADER AND TABS */}
      <div className="flex flex-col gap-4 border-b border-gray-100/50 pb-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-[#181B25]">
            Target Savings
          </h1>

          <p className="max-w-xl text-sm text-[#525866]/80">
            Manage group and individual target savings plans, contributions,
            balances, and savings progress.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Target savings views"
          className="inline-flex self-start items-center gap-1 rounded-2xl border border-white/60 bg-white/45 p-1 shadow-sm backdrop-blur-md md:self-auto"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`target-savings-panel-${tab.key}`}
                onClick={() => handleTabChange(tab.key)}
                className={`inline-flex items-center gap-2 rounded-xl border-0 px-4 py-2.5 text-xs font-semibold transition-all sm:px-5 sm:text-sm ${
                  isActive
                    ? "bg-[#68123D] text-white shadow-sm"
                    : "text-[#525866] hover:bg-white/70"
                }`}
              >
                {tab.icon}

                <span className="flex flex-col items-start">
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-normal ${
                      isActive ? "text-white/75" : "text-gray-400"
                    }`}
                  >
                    {tab.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE TAB */}
      <div
        role="tabpanel"
        id={`target-savings-panel-${activeTab}`}
        aria-label={
          activeTab === "gts"
            ? "Group Target Savings"
            : "Individual Target Savings"
        }
      >
        {activeTab === "gts" ? (
          <GroupTargetSavingsView />
        ) : (
          <IndividualTargetSavingsView />
        )}
      </div>
    </div>
  );
}

export default function TargetSavingsPage() {
  return (
    <PagePermissionGuard pageKey="target-savings">
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center font-satoshi">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#68123D] border-t-transparent" />

              <p className="text-sm font-medium text-gray-500">
                Loading Target Savings...
              </p>
            </div>
          </div>
        }
      >
        <TargetSavingsTabs />
      </Suspense>
    </PagePermissionGuard>
  );
}