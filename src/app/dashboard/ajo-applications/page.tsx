"use client";

import React from "react";
import { HiOutlineSearch, HiOutlineFilter, HiOutlineExternalLink } from "react-icons/hi";

export default function AjoApplications() {
  const mockApplications = [
    { id: "AJO-1029", creator: "Funmi Adebayo", target: "₦500,000", frequency: "Monthly", members: "10 members", status: "Pending Review" },
    { id: "AJO-1028", creator: "Joseph Okon", target: "₦1,200,000", frequency: "Weekly", members: "5 members", status: "Approved" },
    { id: "AJO-1027", creator: "Chioma Nwachukwu", target: "₦300,000", frequency: "Monthly", members: "12 members", status: "Approved" },
    { id: "AJO-1026", creator: "Ibrahim Musa", target: "₦2,000,000", frequency: "Daily", members: "20 members", status: "Rejected" },
  ];

  return (
    <div className="space-y-6 font-satoshi">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#181B25]">Ajo Applications</h1>
          <p className="text-sm text-[#525866] mt-1">Review, approve, and manage peer-to-peer Ajo savings group application requests.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-[#68123D] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#520e32] active:scale-[0.98] transition-all cursor-pointer">
            Export Report
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E1E4EA] flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:max-w-md">
          <HiOutlineSearch size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A94A6]" />
          <input
            type="text"
            placeholder="Search by creator name or ID..."
            className="w-full pl-10 pr-4 py-2 text-sm text-[#181B25] bg-gray-50/50 rounded-lg border border-[#E1E4EA] outline-none focus:border-[#68123D] focus:ring-1 focus:ring-[#68123D]/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 text-sm font-medium text-[#525866] bg-white border border-[#E1E4EA] rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <HiOutlineFilter size={16} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-[#E1E4EA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-[#E1E4EA] text-xs font-semibold text-[#525866] uppercase tracking-wider">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Creator</th>
                <th className="py-4 px-6">Target Amount</th>
                <th className="py-4 px-6">Cycle Frequency</th>
                <th className="py-4 px-6">Target Members</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E4EA] text-sm text-[#181B25]">
              {mockApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="py-4 px-6 font-semibold text-[#181B25]">{app.id}</td>
                  <td className="py-4 px-6">{app.creator}</td>
                  <td className="py-4 px-6 font-medium">{app.target}</td>
                  <td className="py-4 px-6">{app.frequency}</td>
                  <td className="py-4 px-6">{app.members}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        app.status === "Approved"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : app.status === "Pending Review"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#68123D] hover:underline cursor-pointer">
                      <span>Review</span>
                      <HiOutlineExternalLink size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
