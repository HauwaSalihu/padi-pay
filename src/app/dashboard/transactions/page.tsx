"use client";

import React from "react";
import AuthGuard from "@/components/AuthGuard";
import TransactionsSummary from "@/components/Transactions/breakdown";
import TransactionsList from "@/components/Transactions/transactions";

export default function TransactionsPage() {
  return (
    <AuthGuard requireSuperAdmin={true}>
      <div className="space-y-8">
        <TransactionsSummary />
        <TransactionsList />
      </div>
    </AuthGuard>
  );
}



