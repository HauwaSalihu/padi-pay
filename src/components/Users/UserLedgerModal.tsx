"use client";

import {
  HiOutlineX,
  HiOutlineArrowDown,
  HiOutlineArrowUp,
  HiOutlineClock,
  HiOutlineDatabase,
  HiOutlineDocumentText,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { useGetUserLedgerQuery } from "@/services/padiApi/adminApi";

interface UserLedgerModalProps {
  walletId: string | null;
  onClose: () => void;
}

export default function UserLedgerModal({ walletId, onClose }: UserLedgerModalProps) {
  const { data: ledger, isLoading, isError, refetch } = useGetUserLedgerQuery(walletId!, {
    skip: !walletId,
  });

  if (!walletId) return null;

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
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

      <div className="fixed top-4 right-4 bottom-4 w-[calc(100% - 2rem)] md:w-full md:max-w-xl bg-white/85 backdrop-blur-2xl border border-white/50 shadow-[0_24px_60px_rgba(0,0,0,0.15)] rounded-3xl overflow-hidden flex flex-col text-sm text-[#181B25] drawer-animate z-[70]">
        <div className="flex justify-between items-center border-b border-gray-100/50 p-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">Wallet Ledger History</h2>
            <div className="text-xs text-gray-400 font-mono">
              <span>Wallet ID:</span> <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{walletId}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100/50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-full transition-all border border-gray-200/20 cursor-pointer">
            <HiOutlineX size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-3">
              <div className="w-10 h-10 border-4 border-[#68123D]/20 border-t-[#68123D] rounded-full animate-spin" />
              <span className="text-sm">Loading ledger...</span>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-4 text-center">
              <HiOutlineExclamationCircle size={36} className="text-red-400" />
              <div className="text-sm font-semibold text-gray-700">Failed to load ledger history</div>
              <button onClick={refetch} className="px-4 py-2 rounded-xl text-xs bg-neutral-900 text-white cursor-pointer border-0">Retry</button>
            </div>
          )}

          {ledger && ledger.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-3 text-center">
              <HiOutlineDatabase size={36} className="text-gray-300" />
              <div className="text-sm font-semibold text-gray-600">No Transactions Found</div>
            </div>
          )}

          {ledger && ledger.length > 0 && (
            <div className="space-y-3">
              {ledger.map((entry) => {
                const isCredit = entry.type === "CREDIT";
                return (
                  <div key={entry.id} className="bg-white/40 border border-gray-100/60 rounded-2xl p-4 shadow-sm flex flex-col space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border ${isCredit ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>
                          {isCredit ? <HiOutlineArrowDown size={18} strokeWidth={2.5} /> : <HiOutlineArrowUp size={18} strokeWidth={2.5} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-950">{isCredit ? "Credit" : "Debit"}</span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border bg-slate-50 text-slate-700 border-slate-100">{entry.referenceType}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                            <HiOutlineClock size={12} />
                            <span>{fmtDate(entry.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-base font-extrabold ${isCredit ? "text-emerald-600" : "text-rose-600"}`}>
                          {isCredit ? "+" : "-"}{formatCurrency(entry.amount)}
                        </span>
                        <span className="block text-[11px] text-gray-400 font-medium mt-0.5">Bal: {formatCurrency(entry.balanceAfter)}</span>
                      </div>
                    </div>

                    {entry.description && (
                      <div className="text-xs text-gray-600 bg-gray-50/50 border border-gray-100/40 rounded-xl p-2.5">{entry.description}</div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-500 border-t border-gray-100/30 pt-2.5">
                      {entry.reference && (
                        <div className="flex items-center gap-1 min-w-0">
                          <HiOutlineDocumentText size={12} className="text-gray-400 shrink-0" />
                          <span className="text-gray-400">Ref:</span>
                          <span className="font-mono truncate text-gray-600">{entry.reference}</span>
                        </div>
                      )}
                      {(entry.counterpartyName || entry.counterpartyAccount) && (
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-gray-400">Party:</span>
                          <span className="truncate text-gray-600">
                            {entry.counterpartyName || "N/A"}{entry.counterpartyAccount ? ` (${entry.counterpartyAccount})` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100/50 bg-white/30 backdrop-blur-md">
          <button onClick={onClose} className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-2xl font-semibold text-sm cursor-pointer border-0 shadow-sm">Close</button>
        </div>
      </div>
    </>
  );
}
