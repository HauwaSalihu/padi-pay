"use client";
import React, { useState } from "react";
import { 
  HiOutlineSearch, 
  HiOutlineExternalLink, 
  HiOutlineX, 
  HiOutlineChevronLeft, 
  HiOutlineChevronRight,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineShieldCheck
} from "react-icons/hi";
import { useGetPendingAjoApplicationsQuery, AjoMemberApplication } from "@/services/padiApi/adminApi";

export default function AjoApplications() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState<AjoMemberApplication | null>(null);
  const [isImgExpanded, setIsImgExpanded] = useState(false);

  const { data, isLoading, isError, refetch } = useGetPendingAjoApplicationsQuery({ page, limit });
  const apps = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 10, total: 0, totalPages: 0 };

  const filtered = apps.filter(a => {
    const s = query.toLowerCase();
    return `${a.user.first_name} ${a.user.last_name}`.toLowerCase().includes(s) ||
           a.ajo.name.toLowerCase().includes(s);
  });

  const fmt = (v?: number | null) => v == null ? "₦0" : `₦${v.toLocaleString()}`;
  const isPdf = (u?: string) => !!u && u.toLowerCase().includes(".pdf");

  const getInitials = (first?: string, last?: string) => {
    const f = first ? first.charAt(0) : "";
    const l = last ? last.charAt(0) : "";
    return `${f}${l}`.toUpperCase() || "AA";
  };

  const closeDetails = () => {
    setSel(null);
    setIsImgExpanded(false);
  };

  return (
    <div className="space-y-8 font-satoshi relative">
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0.9; }
          to { transform: translateX(0); opacity: 1; }
        }
        .drawer-animate {
          animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100/50 pb-5">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-[#181B25]">Ajo Applications</h1>
          <p className="text-sm text-[#525866]/80 max-w-xl">
            Review, approve, and manage peer-to-peer Ajo savings group application requests.
          </p>
        </div>
        {!isLoading && !isError && meta.total > 0 && (
          <div className="self-start md:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#68123D]/10 text-[#68123D] border border-[#68123D]/15 backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#68123D] animate-pulse" />
              {meta.total} Applications Pending
            </span>
          </div>
        )}
      </div>

      {/* Search & Configuration Bar */}
      <div className="bg-white/45 backdrop-blur-md border border-white/60 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <HiOutlineSearch size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" 
            placeholder="Search applicant or group..." 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/40 border border-gray-200/50 hover:bg-white/60 focus:bg-white/80 focus:border-[#68123D]/40 focus:ring-4 focus:ring-[#68123D]/5 rounded-xl outline-none transition-all shadow-inner placeholder-gray-400 text-gray-800"
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-gray-400 font-medium">Show</span>
          <select 
            value={limit} 
            onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} 
            className="text-xs border border-gray-200/50 p-2.5 rounded-xl bg-white/40 hover:bg-white/60 hover:border-gray-300 focus:border-[#68123D]/40 outline-none cursor-pointer transition-all font-medium text-gray-700 shadow-sm"
          >
            {[5, 10, 20].map(v => <option key={v} value={v} className="bg-white text-gray-800">{v} per page</option>)}
          </select>
        </div>
      </div>
      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-white/45 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-[#68123D] animate-spin mb-4" />
          <p className="text-sm font-medium text-gray-500">Loading applications...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-red-50/20 backdrop-blur-md border border-red-100/50 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 border border-red-100/30">
            <HiOutlineX size={22} />
          </div>
          <h3 className="text-sm font-semibold text-red-900 mb-1">Failed to load applications</h3>
          <p className="text-xs text-red-700/80 max-w-xs mb-5">There was an issue fetching the Ajo savings group applications. Please try again.</p>
          <button 
            onClick={() => refetch()} 
            className="bg-[#68123D] hover:bg-[#68123D]/95 active:bg-[#68123D] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-white/45 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mb-4 border border-gray-100/50">
            <HiOutlineSearch size={20} />
          </div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">No applications found</h3>
          <p className="text-xs text-gray-400 max-w-xs">There are no pending applications matching your search query or criteria.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white/50 backdrop-blur-lg border border-white/70 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100/50 bg-gray-50/20 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-4.5 px-6 font-medium">ID</th>
                  <th className="py-4.5 px-6 font-medium">Applicant</th>
                  <th className="py-4.5 px-6 font-medium">Ajo Group</th>
                  <th className="py-4.5 px-6 font-medium">Target</th>
                  <th className="py-4.5 px-6 font-medium">Contribution / Frequency</th>
                  <th className="py-4.5 px-6 font-medium">Type</th>
                  <th className="py-4.5 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/30 text-sm">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-white/45 transition-all duration-150 border-b border-gray-100/40 last:border-0 group">
                    <td className="py-4.5 px-6">
                      <span className="text-xs font-mono text-gray-400 bg-gray-50/50 px-2 py-1 rounded-md border border-gray-100/30 group-hover:bg-white transition-all">
                        {a.id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#68123D]/10 to-[#68123D]/5 text-[#68123D] flex items-center justify-center text-xs font-bold border border-[#68123D]/10 shadow-sm transition-transform duration-200 group-hover:scale-105">
                          {getInitials(a.user.first_name, a.user.last_name)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm leading-tight">{a.user.first_name} {a.user.last_name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{a.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="font-semibold text-gray-700">{a.ajo.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{a.ajo.groupSize} members</div>
                    </td>
                    <td className="py-4.5 px-6">
                      <span className="font-bold text-gray-950 text-sm">{fmt(a.ajo.targetAmount)}</span>
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="font-semibold text-gray-700">{fmt(a.contributionAmount || a.ajo.contributionAmount)}</div>
                      <div className="text-xs text-gray-400 mt-0.5 capitalize">{a.ajo.frequency.toLowerCase()}</div>
                    </td>
                    <td className="py-4.5 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        a.linkedAccountType === "BUSINESS" 
                          ? "bg-indigo-50/50 text-indigo-700 border-indigo-100/60" 
                          : "bg-emerald-50/50 text-emerald-700 border-emerald-100/60"
                      }`}>
                        {a.linkedAccountType}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <button 
                        onClick={() => setSel(a)} 
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-950 transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer border-0"
                      >
                        Review
                        <HiOutlineExternalLink size={13} className="opacity-80" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            {/* Table Footer / Pagination */}
            <div className="px-6 py-4.5 bg-white/20 border-t border-gray-100/50 flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>Page {meta.page} of {meta.totalPages} ({meta.total} total)</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1} 
                  className="p-2 bg-white/50 border border-gray-200/50 hover:bg-white hover:border-gray-300 active:bg-gray-100 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 shadow-sm cursor-pointer"
                >
                  <HiOutlineChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} 
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
            {filtered.map(a => (
              <div 
                key={a.id} 
                className="bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl p-5 shadow-sm space-y-4 hover:bg-white/80 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#68123D]/10 to-[#68123D]/5 text-[#68123D] flex items-center justify-center text-xs font-bold border border-[#68123D]/10 shadow-sm">
                      {getInitials(a.user.first_name, a.user.last_name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight">{a.user.first_name} {a.user.last_name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{a.user.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-100/50 px-2 py-1 rounded-md border border-gray-100/30">
                    #{a.id.substring(0, 8)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 border-t border-b border-gray-100/50 py-3.5 text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium">Ajo Group</span>
                    <span className="font-semibold text-gray-700 mt-0.5 block">{a.ajo.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">Target Amount</span>
                    <span className="font-bold text-gray-950 mt-0.5 block">{fmt(a.ajo.targetAmount)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">Contribution</span>
                    <span className="font-semibold text-gray-700 mt-0.5 block">
                      {fmt(a.contributionAmount || a.ajo.contributionAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">Type / Frequency</span>
                    <span className="font-semibold text-gray-700 mt-0.5 block capitalize">
                      {a.ajo.frequency.toLowerCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    a.linkedAccountType === "BUSINESS" 
                      ? "bg-indigo-50/50 text-indigo-700 border-indigo-100/60" 
                      : "bg-emerald-50/50 text-emerald-700 border-emerald-100/60"
                  }`}>
                    {a.linkedAccountType}
                  </span>
                  <button 
                    onClick={() => setSel(a)} 
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-950 transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer border-0"
                  >
                    Review Details
                    <HiOutlineExternalLink size={13} className="opacity-80" />
                  </button>
                </div>
              </div>
            ))}

            {/* Mobile Footer / Pagination */}
            <div className="bg-white/45 backdrop-blur-md border border-white/60 p-4 rounded-2xl flex items-center justify-between text-xs text-gray-500 font-medium shadow-sm">
              <span>Page {meta.page} of {meta.totalPages}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1} 
                  className="p-2.5 bg-white border border-gray-200/50 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 shadow-sm cursor-pointer"
                >
                  <HiOutlineChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} 
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
      {/* Slide-over floating glass details drawer */}
      {sel && (
        <>
          {/* Backdrop blur overlay */}
          <div 
            className="fixed inset-0 bg-black/15 backdrop-blur-md z-40 transition-opacity duration-300" 
            onClick={closeDetails} 
          />

          {/* Drawer content panel */}
          <div className="fixed top-4 right-4 bottom-4 w-[calc(100%-2rem)] md:w-full md:max-w-xl bg-white/75 backdrop-blur-2xl border border-white/50 shadow-[0_24px_60px_rgba(0,0,0,0.12)] rounded-3xl z-50 flex flex-col overflow-hidden drawer-animate text-sm text-[#181B25]">
            
            {/* Drawer Header */}
            <div className="flex justify-between items-center border-b border-gray-100/50 p-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight text-gray-900">Review Application</h2>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                  <span>Application ID:</span>
                  <span className="bg-gray-100/80 px-1.5 py-0.5 rounded text-gray-500 font-medium">{sel.id}</span>
                </div>
              </div>
              <button 
                onClick={closeDetails} 
                className="p-2 bg-gray-100/50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-full transition-all border border-gray-200/20 cursor-pointer"
              >
                <HiOutlineX size={18} />
              </button>
            </div>

            {/* Scrollable details view */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              
              {/* Applicant Profile */}
              <div className="bg-white/40 border border-gray-100/60 rounded-2xl p-5 space-y-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
                  <div className="p-1.5 bg-[#68123D]/5 text-[#68123D] rounded-lg">
                    <HiOutlineUser size={16} />
                  </div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Applicant Profile</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium mb-0.5">Full Name</span>
                    <span className="text-sm font-semibold text-gray-800">{sel.user.first_name} {sel.user.last_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium mb-0.5">Email Address</span>
                    <span className="text-sm font-semibold text-gray-800 break-all">{sel.user.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium mb-0.5">Phone Number</span>
                    <span className="text-sm font-semibold text-gray-800">{sel.user.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium mb-0.5">Gender & Date of Birth</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {sel.user.gender || "N/A"}{sel.user.date_of_birth ? ` • ${new Date(sel.user.date_of_birth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ajo savings details */}
              <div className="bg-white/40 border border-gray-100/60 rounded-2xl p-5 space-y-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
                  <div className="p-1.5 bg-[#68123D]/5 text-[#68123D] rounded-lg">
                    <HiOutlineUsers size={16} />
                  </div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ajo Savings Group</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 block font-medium mb-0.5">Group Name</span>
                    <span className="text-sm font-semibold text-gray-800">{sel.ajo.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium mb-0.5">Target Amount</span>
                    <span className="text-sm font-bold text-gray-900">{fmt(sel.ajo.targetAmount)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium mb-0.5">Group Size</span>
                    <span className="text-sm font-semibold text-gray-800">{sel.ajo.groupSize} members</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium mb-0.5">Contribution & Frequency</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {fmt(sel.contributionAmount || sel.ajo.contributionAmount)} / <span className="capitalize">{sel.ajo.frequency.toLowerCase()}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium mb-0.5">Schedule Details</span>
                    <span className="text-sm font-semibold text-gray-800">{sel.ajo.contributionSchedule}</span>
                  </div>
                </div>
              </div>
              {/* Verification & Statement preview */}
              <div className="bg-white/40 border border-gray-100/60 rounded-2xl p-5 space-y-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2.5">
                  <div className="p-1.5 bg-[#68123D]/5 text-[#68123D] rounded-lg">
                    <HiOutlineShieldCheck size={16} />
                  </div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Verification & Bank Statement</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-2">
                  <div>
                    <span className="text-gray-400 block font-medium mb-0.5">Linked Account Type</span>
                    <span className={`inline-flex px-2.5 py-0.5 mt-0.5 rounded-full text-[10px] font-semibold border ${
                      sel.linkedAccountType === "BUSINESS" 
                        ? "bg-indigo-50/50 text-indigo-700 border-indigo-100/60" 
                        : "bg-emerald-50/50 text-emerald-700 border-emerald-100/60"
                    }`}>
                      {sel.linkedAccountType}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium mb-0.5">Requested Hands</span>
                    <span className="text-sm font-semibold text-gray-800">{sel.hands || 1} { (sel.hands || 1) > 1 ? "Hands" : "Hand" }</span>
                  </div>
                  
                  {sel.linkedAccountType === "BUSINESS" && (
                    <div className="sm:col-span-2 grid grid-cols-2 gap-4 border-t border-gray-100/30 pt-3">
                      <div>
                        <span className="text-gray-400 block font-medium mb-0.5">Business Name</span>
                        <span className="text-sm font-semibold text-gray-800">{sel.businessName}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-medium mb-0.5">CAC Number</span>
                        <span className="text-sm font-semibold text-gray-800">{sel.cacNumber}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100/50 pt-4 space-y-2">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Attached Bank Statement</span>
                {sel.bankStatementURL ? (
                  isPdf(sel.bankStatementURL) ? (
                    <div className="space-y-2">
                      <div className="border border-gray-200/40 rounded-2xl overflow-hidden bg-gray-50/50 shadow-inner">
                        <iframe 
                          src={sel.bankStatementURL} 
                          className="w-full h-44 border-0 bg-white" 
                          title="Bank Statement PDF"
                        />
                      </div>
                      <a 
                        href={sel.bankStatementURL} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs text-[#68123D] hover:text-[#68123D]/80 font-semibold flex items-center gap-1.5 justify-end transition-all group cursor-pointer"
                      >
                        Open Full PDF 
                        <HiOutlineExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div 
                        onClick={() => setIsImgExpanded(true)}
                        className="border border-gray-200/40 rounded-2xl p-2 flex justify-center bg-white/80 cursor-zoom-in hover:shadow-md transition-all group overflow-hidden"
                      >
                        <img 
                          src={sel.bankStatementURL} 
                          alt="Bank Statement Preview" 
                          className="max-h-40 object-contain rounded-xl group-hover:scale-[1.02] transition-all duration-300" 
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Click image to enlarge</span>
                        <a 
                          href={sel.bankStatementURL} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs text-[#68123D] hover:text-[#68123D]/80 font-semibold flex items-center gap-1.5 transition-all group cursor-pointer"
                        >
                          Open Original Image 
                          <HiOutlineExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </a>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="py-6 px-4 bg-amber-50/30 border border-amber-100/40 rounded-xl text-center">
                    <p className="text-xs font-semibold text-amber-700">No bank statement attached</p>
                    <p className="text-[10px] text-amber-600/70 mt-0.5">The user has not uploaded a bank statement for this application.</p>
                  </div>
                )}
              </div>
            </div>
            </div>

            {/* Footer containing stubs with Apple aesthetic */}
            <div className="p-6 border-t border-gray-100/50 bg-white/30 backdrop-blur-md space-y-3">
              <div className="flex gap-3">
                <button 
                  disabled 
                  className="flex-1 bg-emerald-600/10 text-emerald-700 border border-emerald-200/50 py-3 rounded-2xl font-semibold text-sm cursor-not-allowed opacity-60 flex items-center justify-center gap-1.5"
                >
                  Approve Application
                </button>
                <button 
                  disabled 
                  className="flex-1 bg-rose-50/50 text-rose-600 border border-rose-100/50 py-3 rounded-2xl font-semibold text-sm cursor-not-allowed opacity-60 flex items-center justify-center gap-1.5"
                >
                  Reject
                </button>
              </div>
              <p className="text-[10px] text-center text-gray-400 font-medium">
                Approve and Reject operations are currently placeholder stubs for review flow.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Image Expansion Lightbox */}
      {isImgExpanded && sel && sel.bankStatementURL && !isPdf(sel.bankStatementURL) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease-out]">
          <div className="absolute inset-0 cursor-zoom-out" onClick={() => setIsImgExpanded(false)} />
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-3 shadow-2xl flex flex-col items-center">
            <button 
              onClick={() => setIsImgExpanded(false)}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-all cursor-pointer z-10"
            >
              <HiOutlineX size={20} />
            </button>
            <img 
              src={sel.bankStatementURL} 
              alt="Expanded Bank Statement" 
              className="max-w-full max-h-[80vh] object-contain rounded-2xl" 
            />
          </div>
        </div>
      )}
    </div>
  );
}

