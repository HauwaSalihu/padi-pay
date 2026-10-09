"use client";

import { useState } from "react";
import {
  HiOutlineX,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineCurrencyDollar,
  HiOutlineClock,
  HiOutlineDatabase,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { useGetUserSavingsQuery } from "@/services/padiApi/adminApi";

interface UserSavingsModalProps {
  userId: string | null;
  onClose: () => void;
}

export default function UserSavingsModal({ userId, onClose }: UserSavingsModalProps) {
  const [activeTab, setActiveTab] = useState<"ajo" | "adashe">("ajo");
  const { data: savings, isLoading, isError, refetch } = useGetUserSavingsQuery(userId!, {
    skip: !userId,
  });

  if (!userId) return null;

  const formatCurrency = (amt?: number | null) => {
    if (amt === undefined || amt === null) return "₦0.00";
    return `₦${(amt / 100).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const fmtDate = (date?: string | null) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const ajoActiveCount = savings?.ajo.filter(a => a.status === "ACTIVE").length ?? 0;
  const ajoTotalContributed = savings?.ajo.reduce((acc, m) => {
    const sum = m.contributions.filter(c => c.status === "SUCCESSFUL").reduce((s, c) => s + c.amount, 0);
    return acc + sum;
  }, 0) ?? 0;

  const adasheActiveCount = savings?.adashe.length ?? 0;
  const adasheTotalContributed = savings?.adashe.reduce((acc, m) => {
    const sum = m.cycles.reduce((s, cy) => s + cy.amountContributed, 0);
    return acc + sum;
  }, 0) ?? 0;

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0.9; }
          to { transform: translateX(0); opacity: 1; }
        }
        .drawer-animate { animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div className="fixed inset-0 bg-black/25 backdrop-blur-md z-[60]" onClick={onClose} />

      <div className="fixed top-0 right-0 bottom-0 left-0 md:top-4 md:right-4 md:bottom-4 md:left-auto w-full md:max-w-xl bg-white/85 backdrop-blur-2xl border-0 md:border md:border-white/50 shadow-[0_24px_60px_rgba(0,0,0,0.15)] rounded-none md:rounded-3xl overflow-hidden flex flex-col text-sm text-[#181B25] drawer-animate z-[70]">
        
        <div className="flex justify-between items-center border-b border-gray-100/50 p-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">User Savings Overview</h2>
            <div className="text-xs text-gray-400 font-mono">
              <span>User ID:</span> <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{userId}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100/50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-full border border-gray-200/20 cursor-pointer">
            <HiOutlineX size={18} />
          </button>
        </div>

        <div className="px-6 pt-4 pb-2 border-b border-gray-100/50 flex gap-2 bg-white/40">
          <button
            onClick={() => setActiveTab("ajo")}
            className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs tracking-wide transition-all cursor-pointer border ${
              activeTab === "ajo" ? "bg-[#68123D] text-white border-[#68123D]" : "bg-white/50 text-gray-500 border-gray-100"
            }`}
          >
            Ajo (Rotational)
          </button>
          <button
            onClick={() => setActiveTab("adashe")}
            className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs tracking-wide transition-all cursor-pointer border ${
              activeTab === "adashe" ? "bg-[#68123D] text-white border-[#68123D]" : "bg-white/50 text-gray-500 border-gray-100"
            }`}
          >
            Adashe (Individual)
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 space-y-3">
              <div className="w-10 h-10 border-4 border-[#68123D]/20 border-t-[#68123D] rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading user savings...</span>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-4 text-center">
              <HiOutlineExclamationCircle size={36} className="text-red-400" />
              <div className="text-sm font-semibold text-gray-700">Failed to load savings</div>
              <button onClick={refetch} className="px-4 py-2 rounded-xl text-xs bg-neutral-900 text-white cursor-pointer border-0">Retry</button>
            </div>
          )}

          {savings && !isLoading && !isError && (
            <>
              {activeTab === "ajo" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#68123D]/5 border border-[#68123D]/10 rounded-2xl p-4">
                    <span className="text-gray-400 text-xs font-semibold block uppercase">Active Ajos</span>
                    <span className="text-xl font-bold text-[#68123D] mt-1 block">{ajoActiveCount}</span>
                  </div>
                  <div className="bg-[#68123D]/5 border border-[#68123D]/10 rounded-2xl p-4">
                    <span className="text-gray-400 text-xs font-semibold block uppercase">Total Contributed</span>
                    <span className="text-xl font-bold text-[#68123D] mt-1 block">{formatCurrency(ajoTotalContributed)}</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#68123D]/5 border border-[#68123D]/10 rounded-2xl p-4">
                    <span className="text-gray-400 text-xs font-semibold block uppercase">Adashe Groups</span>
                    <span className="text-xl font-bold text-[#68123D] mt-1 block">{adasheActiveCount}</span>
                  </div>
                  <div className="bg-[#68123D]/5 border border-[#68123D]/10 rounded-2xl p-4">
                    <span className="text-gray-400 text-xs font-semibold block uppercase">Total Saved</span>
                    <span className="text-xl font-bold text-[#68123D] mt-1 block">{formatCurrency(adasheTotalContributed)}</span>
                  </div>
                </div>
              )}

              {activeTab === "ajo" && (
                <div className="space-y-4">
                  {savings.ajo.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 space-y-2">
                      <HiOutlineDatabase size={36} className="stroke-1.5" />
                      <span className="text-xs">No active Ajo memberships.</span>
                    </div>
                  ) : (
                    savings.ajo.map((m) => (
                      <div key={m.membershipId} className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm space-y-4">
                        <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm">{m.group.name}</h3>
                            {m.group.description && <p className="text-[11px] text-gray-500 mt-0.5">{m.group.description}</p>}
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${m.group.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
                            {m.group.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                          <div>
                            <span className="text-gray-400 block font-normal text-[10px]">Membership</span>
                            <span className="font-semibold text-gray-700 capitalize">{m.status.toLowerCase()}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-normal text-[10px]">Frequency</span>
                            <span className="font-semibold text-gray-700 capitalize">{m.group.frequency.toLowerCase()}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-normal text-[10px]">Contribution</span>
                            <span className="font-bold text-gray-800">{formatCurrency(m.contributionAmount ?? m.group.contributionAmount)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-normal text-[10px]">Payout Target</span>
                            <span className="font-bold text-gray-800">{formatCurrency(m.group.targetAmount)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-normal text-[10px]">Total Rounds</span>
                            <span className="font-semibold text-gray-700">{m.totalRoundsPaid ?? 0} / {m.totalRounds ?? m.group.totalCycles}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-normal text-[10px]">Size</span>
                            <span className="font-semibold text-gray-700">{m.group.groupSize} Members</span>
                          </div>
                        </div>

                        {m.slots && m.slots.length > 0 && (
                          <div className="pt-2 border-t border-gray-50 space-y-1">
                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Assigned Rotation Position</span>
                            <div className="flex flex-wrap gap-1.5">
                              {m.slots.map((s) => (
                                <span key={s.id} className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${s.isPaidOut ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-blue-50 text-blue-800 border-blue-100"}`}>
                                  Position #{s.position} {s.isPaidOut ? "(Paid)" : ""}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-gray-50 space-y-1.5">
                          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Contributions Paid ({m.contributions.length})</span>
                          {m.contributions.length === 0 ? (
                            <p className="text-[11px] text-gray-400 italic">No payments recorded.</p>
                          ) : (
                            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                              {m.contributions.map((contrib) => (
                                <div key={contrib.id} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-[11px]">
                                  <div>
                                    <span className="font-bold text-gray-800">{formatCurrency(contrib.amount)}</span>
                                    <span className="block text-[9px] text-gray-400">{fmtDate(contrib.createdAt)}</span>
                                  </div>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${contrib.status === "SUCCESSFUL" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
                                    {contrib.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "adashe" && (
                <div className="space-y-4">
                  {savings.adashe.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 space-y-2">
                      <HiOutlineDatabase size={36} className="stroke-1.5" />
                      <span className="text-xs">No active Adashe memberships.</span>
                    </div>
                  ) : (
                    savings.adashe.map((m) => (
                      <div key={m.membershipId} className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm space-y-4">
                        <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm">{m.group.name}</h3>
                            {m.group.description && <p className="text-[11px] text-gray-500 mt-0.5">{m.group.description}</p>}
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${m.group.privacy === "PUBLIC" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-blue-50 text-blue-700 border-blue-100"}`}>
                            {m.group.privacy}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                          <div>
                            <span className="text-gray-400 block font-normal text-[10px]">Membership</span>
                            <span className="font-semibold text-gray-700 capitalize">{m.status.toLowerCase()}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-normal text-[10px]">Min Amount</span>
                            <span className="font-bold text-gray-800">{formatCurrency(m.group.minAmount)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-normal text-[10px]">Name inside Group</span>
                            <span className="font-semibold text-gray-700">{m.name || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-normal text-[10px]">Phone inside Group</span>
                            <span className="font-semibold text-gray-700">{m.phone || "N/A"}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-50 space-y-2">
                          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Savings Cycles ({m.cycles.length})</span>
                          {m.cycles.length === 0 ? (
                            <p className="text-[11px] text-gray-400 italic">No savings cycles active.</p>
                          ) : (
                            <div className="space-y-2">
                              {m.cycles.map((cy) => (
                                <div key={cy.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-1.5 text-[11px]">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-800">Cycle #{cy.cycleCount}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${cy.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-gray-100 text-gray-700 border-gray-200"}`}>
                                      {cy.status}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                                    <div>
                                      <span className="text-gray-400 block text-[9px]">Saved Balance</span>
                                      <span className="font-bold text-emerald-600 block">{formatCurrency(cy.amountContributed)}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400 block text-[9px]">Planned Cycle Target</span>
                                      <span className="font-bold text-gray-800 block">{formatCurrency(cy.contributionAmount)}</span>
                                    </div>
                                    <div className="col-span-2 flex justify-between pt-1 border-t border-gray-100 text-[9px] text-gray-400">
                                      <span>Start: {fmtDate(cy.startDate)}</span>
                                      <span>End: {fmtDate(cy.endDate)}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-gray-50 space-y-1.5">
                          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Contributions Paid ({m.contributions.length})</span>
                          {m.contributions.length === 0 ? (
                            <p className="text-[11px] text-gray-400 italic">No payments recorded.</p>
                          ) : (
                            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                              {m.contributions.map((contrib) => (
                                <div key={contrib.id} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-[11px]">
                                  <div>
                                    <span className="font-bold text-gray-800">{formatCurrency(contrib.amount)}</span>
                                    <span className="block text-[9px] text-gray-400">{fmtDate(contrib.createdAt)}</span>
                                  </div>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${contrib.status === "SUCCESSFUL" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
                                    {contrib.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-100/50 bg-white/30 backdrop-blur-md">
          <button onClick={onClose} className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-2xl font-semibold text-sm cursor-pointer border-0">Close Overview</button>
        </div>
      </div>
    </>
  );
}
