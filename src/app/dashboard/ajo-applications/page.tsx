"use client";
import React, { useState } from "react";
import { HiOutlineSearch, HiOutlineExternalLink, HiOutlineX, HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { useGetPendingAjoApplicationsQuery, AjoMemberApplication } from "@/services/padiApi/adminApi";

export default function AjoApplications() {
    const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState<AjoMemberApplication | null>(null);

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

  return (
    <div className="space-y-6 font-satoshi relative">
            <div>
        <h1 className="text-2xl font-bold text-[#181B25]">Ajo Applications</h1>
        <p className="text-sm text-[#525866]">Review, approve, and manage peer-to-peer Ajo savings group application requests.</p>
      </div>

      <div className="bg-white p-4 rounded-xl border flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:max-w-md">
          <HiOutlineSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A94A6]" />
          <input
            type="text" placeholder="Search applicant or group..." value={query} onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border rounded-lg outline-none"
          />
        </div>
        <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} className="text-xs border p-2 rounded-lg bg-white outline-none">
          {[5, 10, 20].map(v => <option key={v} value={v}>{v} per page</option>)}
        </select>
      </div>
            {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : isError ? (
        <div className="text-center py-8 space-y-2">
          <p className="text-red-600">Error loading applications.</p>
          <button onClick={() => refetch()} className="bg-[#68123D] text-white px-4 py-2 rounded text-xs">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-[#525866]">No applications found.</div>
      ) : (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b text-xs font-semibold text-[#525866] uppercase">
                <tr>
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Applicant</th>
                  <th className="py-4 px-6">Ajo Group</th>
                  <th className="py-4 px-6">Target</th>
                  <th className="py-4 px-6">Contribution / Frequency</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/30">
                    <td className="py-4 px-6 text-xs">{a.id.substring(0, 8)}...</td>
                    <td className="py-4 px-6 font-semibold">{a.user.first_name} {a.user.last_name}</td>
                    <td className="py-4 px-6">{a.ajo.name}</td>
                    <td className="py-4 px-6 font-semibold">{fmt(a.ajo.targetAmount)}</td>
                    <td className="py-4 px-6">{fmt(a.contributionAmount || a.ajo.contributionAmount)} / <span className="capitalize">{a.ajo.frequency.toLowerCase()}</span></td>
                    <td className="py-4 px-6"><span className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 font-semibold">{a.linkedAccountType}</span></td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => setSel(a)} className="text-[#68123D] hover:underline text-xs font-semibold inline-flex items-center gap-1 bg-transparent border-0 cursor-pointer">
                        Review <HiOutlineExternalLink size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t flex items-center justify-between text-xs text-[#525866]">
            <span>Page {meta.page} of {meta.totalPages} ({meta.total} total)</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 border rounded disabled:opacity-40"><HiOutlineChevronLeft size={16} /></button>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages} className="p-1 border rounded disabled:opacity-40"><HiOutlineChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      )}
            {sel && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setSel(null)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl border-l z-50 overflow-y-auto p-6 flex flex-col text-sm text-[#181B25]">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold">Review Application</h2>
                <p className="text-xs text-[#525866]">ID: {sel.id}</p>
              </div>
              <button onClick={() => setSel(null)} className="p-1 border rounded-lg"><HiOutlineX size={18} /></button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto pr-1 pb-4">
              <div className="bg-gray-50 p-3 rounded-xl border">
                <h4 className="text-xs font-bold text-[#8A94A6] uppercase mb-1">Applicant</h4>
                <p><strong>Name:</strong> {sel.user.first_name} {sel.user.last_name}</p>
                <p><strong>Email:</strong> {sel.user.email}</p>
                <p><strong>Phone:</strong> {sel.user.phone}</p>
                <p><strong>Gender/DOB:</strong> {sel.user.gender || "N/A"}{sel.user.date_of_birth ? ` / ${new Date(sel.user.date_of_birth).toLocaleDateString()}` : ""}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border">
                <h4 className="text-xs font-bold text-[#8A94A6] uppercase mb-1">Ajo Group</h4>
                <p><strong>Name:</strong> {sel.ajo.name}</p>
                <p><strong>Target:</strong> {fmt(sel.ajo.targetAmount)} | <strong>Size:</strong> {sel.ajo.groupSize} members</p>
                <p><strong>Frequency:</strong> <span className="capitalize">{sel.ajo.frequency.toLowerCase()}</span> @ {sel.ajo.contributionSchedule}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border space-y-1">
                <h4 className="text-xs font-bold text-[#8A94A6] uppercase mb-1">Verification Details</h4>
                <p><strong>Account:</strong> {sel.linkedAccountType} | <strong>Hands:</strong> {sel.hands || 1}</p>
                {sel.linkedAccountType === "BUSINESS" && (
                  <p><strong>Business:</strong> {sel.businessName} (CAC: {sel.cacNumber})</p>
                )}
                <span className="text-[10px] text-[#8A94A6] block font-bold uppercase mt-2">Bank Statement</span>
                {sel.bankStatementURL ? (
                  isPdf(sel.bankStatementURL) ? (
                    <div className="space-y-1">
                      <iframe src={sel.bankStatementURL} className="w-full h-40 border rounded bg-white" />
                      <a href={sel.bankStatementURL} target="_blank" rel="noreferrer" className="text-xs text-[#68123D] font-semibold flex items-center gap-1 justify-end">Open PDF <HiOutlineExternalLink size={12} /></a>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="border rounded p-1 flex justify-center bg-white"><img src={sel.bankStatementURL} alt="Statement" className="max-h-36 object-contain" /></div>
                      <a href={sel.bankStatementURL} target="_blank" rel="noreferrer" className="text-xs text-[#68123D] font-semibold flex items-center gap-1 justify-end">Open Image <HiOutlineExternalLink size={12} /></a>
                    </div>
                  )
                ) : <p className="text-xs text-amber-700">No bank statement attached.</p>}
              </div>
            </div>
            <div className="pt-4 border-t space-y-2">
              <div className="flex gap-3">
                <button disabled className="flex-1 bg-green-600/50 text-white py-2 rounded-lg font-semibold cursor-not-allowed">Approve</button>
                <button disabled className="flex-1 bg-white border text-rose-600/50 border-rose-200 py-2 rounded-lg font-semibold cursor-not-allowed">Reject</button>
              </div>
              <p className="text-[10px] text-center text-[#8A94A6]">Approve and Reject operations are currently placeholder stubs for review flow.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

