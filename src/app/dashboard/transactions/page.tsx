"use client";

import React from "react";
import { PagePermissionGuard } from "@/components/AuthGuard";
import TransactionsSummary from "@/components/Transactions/breakdown";
import TransactionsList from "@/components/Transactions/transactions";

export default function TransactionsPage() {
  return (
    <PagePermissionGuard pageKey="transactions">
      <div className="space-y-8">
        <TransactionsSummary />
        <TransactionsList />
      </div>
    </PagePermissionGuard>
  );
}



