"use client";

import React from "react";
import AuthGuard from "@/components/AuthGuard";

export default function Dashboard() {
  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-satoshi">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-2">Welcome to the PadiPay Admin Dashboard.</p>
        </div>
      </div>
    </AuthGuard>
  );
}
