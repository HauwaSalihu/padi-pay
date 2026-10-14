"use client";

import React, { Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HiOutlineUsers, HiOutlineUser } from "react-icons/hi";

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
    <div className="relative min-w-0 w-full max-w-full space-y-6 overflow-x-clip font-satoshi">
      {/* HEADER AND TABS */}
      <div className="flex min-w-0 flex-col gap-4 border-b border-gray-100/50 pb-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1 space-y-1.5">
          <h1 className="break-words text-2xl font-bold tracking-tight text-[#181B25] sm:text-3xl">
            Target Savings
          </h1>

          <p className="max-w-xl text-sm leading-6 text-[#525866]/80">
            Manage group and individual target savings plans, contributions,
            balances, and savings progress.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Target savings views"
          className="grid w-full min-w-0 max-w-full grid-cols-2 gap-1 rounded-2xl border border-white/60 bg-white/45 p-1 shadow-sm backdrop-blur-md md:w-auto md:shrink-0"
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
                className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
                  isActive
                    ? "bg-[#68123D] text-white shadow-sm"
                    : "text-[#525866] hover:bg-white/70"
                }`}
              >
                <span className="shrink-0">{tab.icon}</span>

                <span className="min-w-0 text-left">
                  <span className="block">{tab.label}</span>
                  <span
                    className={`block truncate text-[10px] font-normal ${
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
        className="min-w-0 w-full max-w-full"
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
