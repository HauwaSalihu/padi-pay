"use client";

import React from "react";
import {
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineCurrencyDollar,
  HiOutlineCreditCard,
  HiOutlineRefresh,
} from "react-icons/hi";
import { useGetLedgerSummaryQuery } from "@/services/padiApi/adminApi";

export default function TransactionsSummary() {
  const { data: summaryData, isLoading, isError, refetch } = useGetLedgerSummaryQuery();

  const summary = summaryData?.data;

  const formatNaira = (koboAmount?: number | null) => {
    if (koboAmount == null) return "₦0.00";
    const naira = koboAmount / 100;
    return `₦${naira.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const netFlow = (summary?.totalIncoming ?? 0) - (summary?.totalOutgoing ?? 0);

  const stats = [
    {
      title: "Total Incoming (CREDIT)",
      value: isLoading ? "..." : formatNaira(summary?.totalIncoming),
      description: "Sum of all incoming wallet deposits, credits and top-ups.",
      icon: HiOutlineTrendingUp,
      color: "text-green-600 bg-green-50 border-green-100",
    },
    {
      title: "Total Outgoing (DEBIT)",
      value: isLoading ? "..." : formatNaira(summary?.totalOutgoing),
      description: "Sum of all outgoing wallet withdrawals, debits and payouts.",
      icon: HiOutlineTrendingDown,
      color: "text-rose-600 bg-red-50 border-red-100",
    },
    {
      title: "PadiPay Fees",
      value: isLoading ? "..." : formatNaira(summary?.totalPadiPayFee),
      description: "Revenue collected and allocated directly to PadiPay.",
      icon: HiOutlineCurrencyDollar,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      title: "Platform / Processor Fees",
      value: isLoading ? "..." : formatNaira(summary?.totalPlatformFee),
      description: "Fees paid or allocated to transaction processors and gateways.",
      icon: HiOutlineCreditCard,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
  ];

  return (
    <div className="space-y-8 font-satoshi">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100/50 pb-5">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-[#181B25]">
            Financial Ledger Summary
          </h1>
          <p className="text-sm text-[#525866]/80 max-w-xl">
            Real-time tracking of platform-wide cashflows, transaction volumes, and transaction fee breakdowns.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
        >
          <HiOutlineRefresh size={16} />
          <span>Refresh Data</span>
        </button>
      </div>

      {isError ? (
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-center max-w-lg mx-auto my-12 space-y-4">
          <h3 className="text-lg font-bold text-red-800">Failed to Load Financial Summary</h3>
          <p className="text-sm text-red-600">
            An error occurred while fetching the ledger statistics from the server. Please check your connection or try again.
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors cursor-pointer"
          >
            Retry Fetching
          </button>
        </div>
      ) : (
        <>
          {/* Subtle Net Cashflow Banner */}
          {!isLoading && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-[#E1E4EA] shadow-sm">
              <div className="flex items-center gap-3">
                <span className={`p-2 rounded-lg ${netFlow >= 0 ? "text-green-600 bg-green-50" : "text-rose-600 bg-red-50"}`}>
                  {netFlow >= 0 ? <HiOutlineTrendingUp size={20} /> : <HiOutlineTrendingDown size={20} />}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[#181B25]">Platform Net Flow</h3>
                  <p className="text-xs text-[#8A94A6]">
                    The net difference between total credited funds and debited funds on the platform.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <span className={`text-base font-bold ${netFlow >= 0 ? "text-green-600" : "text-rose-600"}`}>
                  {formatNaira(netFlow)}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    netFlow >= 0 ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                  }`}
                >
                  {netFlow >= 0 ? "Net Positive Flow" : "Net Outflow"}
                </span>
              </div>
            </div>
          )}

          {/* Key Metrics Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-[#E1E4EA] flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#525866]">{stat.title}</span>
                    <div className={`p-2 rounded-xl border ${stat.color}`}>
                      <stat.icon size={22} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-[#181B25] tracking-tight">{stat.value}</h3>
                  </div>
                </div>
                <p className="text-xs text-[#8A94A6] mt-4 leading-relaxed">{stat.description}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
