"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Automatically close mobile sidebar when path changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50/50 font-satoshi flex flex-col md:flex-row">
      {/* Mobile Sidebar (Drawer) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          sidebarOpen ? "visible" : "invisible"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar Panel */}
        <div
          className={`fixed top-0 bottom-0 left-0 w-64 max-w-[80vw] h-full bg-white shadow-xl transition-transform duration-300 ease-in-out z-50 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden md:flex md:w-64 flex-col fixed top-0 bottom-0 left-0 z-20 border-r border-[#E1E4EA] bg-white h-screen">
        <Sidebar onClose={() => {}} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
        {/* Mobile Header */}
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Dynamic page content */}
        <main className="flex-1 p-6 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
