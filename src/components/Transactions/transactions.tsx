"use client";

import { useState } from "react";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineSearch,
  HiOutlineX,
} from "react-icons/hi";
import {
  useGetLedgerEntriesQuery,
  useGetTransactionsPauseQuery,
  useSetTransactionsPauseMutation,
} from "@/services/padiApi/adminApi";

export default function TransactionsList() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [confirmPause, setConfirmPause] = useState(false);
  const [pauseError, setPauseError] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useGetLedgerEntriesQuery({
    page,
    limit,
  });

  const {
    data: pauseStatus,
    isLoading: isPauseLoading,
  } = useGetTransactionsPauseQuery();
  const [setTransactionsPause, { isLoading: isSavingPause }] =
    useSetTransactionsPauseMutation();

  const outboundPaused = pauseStatus?.paused === true;
  const outboundEnabled = !outboundPaused;

  const applyOutboundState = async (enabled: boolean) => {
    setPauseError(null);
    try {
      // Send the explicit end state, not a flip, so retries are idempotent.
      // Invalidating the 'Settings' tag refetches the pause status.
      await setTransactionsPause({ paused: !enabled }).unwrap();
      setConfirmPause(false);
    } catch (err: any) {
      console.error("Failed to update outbound transactions pause:", err);
      setPauseError(
        err?.data?.message ||
          "Failed to update platform transaction status. Please try again.",
      );
    }
  };

  const handleOutboundToggle = () => {
    if (isSavingPause || isPauseLoading) return;
    if (outboundEnabled) {
      // Turning it off halts every user's outbound transactions - confirm first.
      setConfirmPause(true);
    } else {
      applyOutboundState(true);
    }
  };

  const entries = data?.data || [];
  const meta = data?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  const formatNaira = (koboAmount?: number | null) => {
    if (koboAmount == null) return "₦0.00";
    const naira = koboAmount / 100;
    return `₦${naira.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const fmtDate = (date?: string) => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const mapCategory = (ref: string) => {
    switch (ref) {
      case "TOP_UP":
        return "Wallet Topup";
      case "WITHDRAWAL":
        return "Withdrawal";
      case "TARGET_SAVING":
        return "Target Saving";
      case "FIXED_SAVING":
        return "Fixed Saving";
      case "SPEND_AND_SAVE":
        return "Spend and Save";
      case "AJO_CONTRIBUTION":
        return "Ajo Contribution";
      case "AJO_PAYOUT":
        return "Ajo Payout";
      case "ADASHE_CONTRIBUTION":
        return "Adashe Contribution";
      case "ADASHE_PAYOUT":
        return "Adashe Payout";
      case "ADJUSTMENT":
        return "Adjustment";
      default:
        return ref.replace(/_/g, " ");
    }
  };

  return (
    <div className="space-y-6 font-satoshi">
      {/* Title Divider */}
      <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#181B25]">All System Transactions</h2>
          <p className="text-xs text-[#8A94A6] mt-0.5">
            Detailed overview of platform-wide cashflows, user top-ups, and ledger charges.
          </p>
        </div>

        {/* Platform-wide outbound pause */}
        <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Outbound transactions
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                isPauseLoading
                  ? "bg-gray-50/70 text-gray-500 border-gray-200/70"
                  : outboundPaused
                    ? "bg-amber-50/70 text-amber-700 border-amber-100/70"
                    : "bg-emerald-50/70 text-emerald-700 border-emerald-100/70"
              }`}
            >
              {isPauseLoading ? "Loading..." : outboundPaused ? "Paused" : "Active"}
            </span>
            <label
              className={`relative inline-flex items-center ${
                isSavingPause || isPauseLoading
                  ? "opacity-60 cursor-wait"
                  : "cursor-pointer"
              }`}
              title={
                outboundEnabled
                  ? "Pause outbound transactions for all users"
                  : "Resume outbound transactions for all users"
              }
              aria-label="Toggle platform outbound transactions"
            >
              <input
                type="checkbox"
                className="sr-only peer"
                checked={outboundEnabled}
                onChange={handleOutboundToggle}
                disabled={isPauseLoading || isSavingPause}
              />
              <div className="relative w-9 h-5 bg-gray-200 peer-checked:bg-[#68123D] rounded-full transition-all duration-200 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:duration-200 peer-checked:after:translate-x-4" />
            </label>
          </div>

          {confirmPause && (
            <div className="flex items-center gap-2 bg-amber-50/70 border border-amber-100/70 rounded-xl px-2.5 py-1.5">
              <span className="text-[10px] font-medium text-amber-800">
                Pause outbound transactions for every user?
              </span>
              <button
                onClick={() => applyOutboundState(false)}
                disabled={isSavingPause}
                className="text-[10px] font-semibold text-white bg-amber-600 hover:bg-amber-700 px-2 py-1 rounded-lg transition-all cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingPause ? "Pausing..." : "Pause"}
              </button>
              <button
                onClick={() => setConfirmPause(false)}
                disabled={isSavingPause}
                className="text-[10px] font-semibold text-gray-500 hover:text-gray-700 px-1.5 py-1 rounded-lg transition-all cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          )}

          {pauseError && (
            <span className="text-[10px] text-red-500 font-medium">
              {pauseError}
            </span>
          )}
        </div>
      </div>

      {/* Configurations */}
      <div className="bg-white/45 backdrop-blur-md border border-white/60 p-4 rounded-2xl flex justify-end items-center shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">Show</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="text-xs border border-gray-200/50 p-2.5 rounded-xl bg-white/40 hover:bg-white/60 hover:border-gray-300 focus:border-[#68123D]/40 outline-none cursor-pointer transition-all font-medium text-gray-700 shadow-sm"
          >
            {[5, 10, 20, 50].map((v) => (
              <option key={v} value={v} className="bg-white text-gray-800">
                {v} per page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-white/45 backdrop-blur-md border border-[#E1E4EA] rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-[#68123D] animate-spin mb-4" />
          <p className="text-sm font-medium text-gray-500">Loading ledger transaction entries...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-red-50/20 backdrop-blur-md border border-red-100/50 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 border border-red-100/30">
            <HiOutlineX size={22} />
          </div>
          <h3 className="text-sm font-semibold text-red-900 mb-1">Failed to load transactions</h3>
          <p className="text-xs text-red-700/80 max-w-xs mb-5">
            There was an issue fetching the registered transactions. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="bg-[#68123D] hover:bg-[#68123D]/95 active:bg-[#68123D] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer border-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-white/45 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mb-4 border border-gray-100/50">
            <HiOutlineSearch size={20} />
          </div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">No transaction records found</h3>
          <p className="text-xs text-gray-400 max-w-xs">
            There are no transactions matching your search query or criteria inside the financial ledger database.
          </p>
        </div>
      )}

      {/* Transaction List content */}
      {!isLoading && !isError && entries.length > 0 && (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white/50 backdrop-blur-lg border border-white/70 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100/50 bg-gray-50/20 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-4.5 px-6 font-medium max-w-[160px] md:max-w-[200px] truncate">Tx Ref / ID</th>
                    <th className="py-4.5 px-6 font-medium">User Details</th>
                    <th className="py-4.5 px-6 font-medium">Flow</th>
                    <th className="py-4.5 px-6 font-medium">Category</th>
                    <th className="py-4.5 px-6 font-medium">Amount</th>
                    <th className="py-4.5 px-6 font-medium">Processed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/30 text-sm">
                  {entries.map((entry) => {
                    const userName = entry.wallet?.user
                      ? `${entry.wallet.user.first_name} ${entry.wallet.user.last_name}`.trim()
                      : "System Admin / Gateway";
                    const isCredit = entry.type === "CREDIT";

                    return (
                      <tr
                        key={entry.id}
                        className="hover:bg-white/45 transition-all duration-150 border-b border-gray-100/40 last:border-0 group"
                      >
                        {/* Tx ID & Ref */}
                        <td className="py-4.5 px-6 max-w-[160px] md:max-w-[200px] truncate">
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-mono text-gray-800 font-bold truncate block">
                              {entry.reference ? entry.reference : entry.id.substring(0, 12)}
                            </span>
                            {entry.description && (
                              <span className="text-[10px] text-gray-400 mt-0.5 truncate block">
                                {entry.description}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* User Details */}
                        <td className="py-4.5 px-6">
                          <div className="flex flex-col leading-tight">
                            <span className="font-semibold text-gray-800 text-sm">{userName}</span>
                            {entry.wallet?.user?.email && (
                              <span className="text-[11px] text-gray-400 mt-0.5">
                                {entry.wallet.user.email}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Flow Status Badge */}
                        <td className="py-4.5 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                              isCredit
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-red-50 text-rose-700 border-red-100"
                            }`}
                          >
                            {isCredit ? (
                              <HiOutlineTrendingUp size={12} className="text-emerald-600" />
                            ) : (
                              <HiOutlineTrendingDown size={12} className="text-rose-600" />
                            )}
                            {entry.type?.toLowerCase()}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-4.5 px-6">
                          <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg">
                            {mapCategory(entry.referenceType)}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-4.5 px-6">
                          <span
                            className={`text-sm font-bold ${
                              isCredit ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {isCredit ? "+" : "-"} {formatNaira(entry.amount)}
                          </span>
                        </td>

                        {/* Processed Date */}
                        <td className="py-4.5 px-6">
                          <span className="text-xs text-gray-500 font-medium">
                            {fmtDate(entry.createdAt)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Desktop Pagination Footer */}
            <div className="px-6 py-4.5 bg-white/20 border-t border-gray-100/50 flex items-center justify-between text-xs text-gray-500 font-medium font-satoshi">
              <span>
                Page {meta.page} of {meta.totalPages} ({meta.total} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 bg-white/50 border border-gray-200/50 hover:bg-white hover:border-gray-300 active:bg-gray-100 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 shadow-sm cursor-pointer"
                >
                  <HiOutlineChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page >= meta.totalPages}
                  className="p-2 bg-white/50 border border-gray-200/50 hover:bg-white hover:border-gray-300 active:bg-gray-100 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 shadow-sm cursor-pointer"
                >
                  <HiOutlineChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Card Stack View */}
          <div className="space-y-4 md:hidden mt-6">
            {entries.map((entry) => {
              const userName = entry.wallet?.user
                ? `${entry.wallet.user.first_name} ${entry.wallet.user.last_name}`.trim()
                : "System Admin / Gateway";
              const isCredit = entry.type === "CREDIT";

              return (
                <div
                  key={entry.id}
                  className="bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl p-5 shadow-sm space-y-4 hover:bg-white/80 transition-all duration-200 font-satoshi"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-gray-400">Transaction ID</span>
                      <span className="text-[10px] font-mono text-gray-700 bg-gray-100/50 px-2 py-0.5 rounded border border-gray-100/30 block mt-0.5">
                        #{entry.id.substring(0, 16)}...
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                        isCredit
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-red-50 text-rose-700 border-red-100"
                      }`}
                    >
                      {entry.type?.toLowerCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 border-t border-b border-gray-100/50 py-3.5 text-xs">
                    <div>
                      <span className="text-gray-400 block font-medium">User Initiated</span>
                      <span className="font-semibold text-gray-800 mt-0.5 block truncate">
                        {userName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium">Category / Reason</span>
                      <span className="font-semibold text-gray-800 mt-0.5 block">
                        {mapCategory(entry.referenceType)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium">Amount Flow</span>
                      <span
                        className={`font-extrabold text-sm block mt-0.5 ${
                          isCredit ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isCredit ? "+" : "-"} {formatNaira(entry.amount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium">Date Processed</span>
                      <span className="font-semibold text-gray-700 mt-0.5 block text-[10px]">
                        {fmtDate(entry.createdAt)}
                      </span>
                    </div>
                  </div>

                  {entry.description && (
                    <p className="text-[11px] text-gray-400 leading-tight italic">
                      "{entry.description}"
                    </p>
                  )}
                </div>
              );
            })}

            {/* Mobile Footer / Pagination */}
            <div className="bg-white/45 backdrop-blur-md border border-white/60 p-4 rounded-2xl flex items-center justify-between text-xs text-gray-500 font-medium shadow-sm font-satoshi">
              <span>
                Page {meta.page} of {meta.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2.5 bg-white border border-gray-200/50 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 shadow-sm cursor-pointer"
                >
                  <HiOutlineChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page >= meta.totalPages}
                  className="p-2.5 bg-white border border-gray-200/50 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 shadow-sm cursor-pointer"
                >
                  <HiOutlineChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
