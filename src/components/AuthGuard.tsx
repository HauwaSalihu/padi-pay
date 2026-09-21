"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetAdminStatusQuery } from '../services/padiApi/userApi';
import { useLogoutMutation } from '../services/padiApi/authApi';

interface AuthGuardProps {
  children: React.ReactNode;
}

interface PagePermissionGuardProps {
  children: React.ReactNode;
  pageKey: string; // The specific string matching the database permission table entry
}

// Local extension of the admin-status payload to support granular page permissions.
// Backend `/auth/admin-status` returns flat string arrays under BOTH
// `permissions` and `pageKeys` (plus legacy/alternate shapes are tolerated):
// - string[] e.g. ["transactions", "dashboard"]
// - object[] e.g. [{ pageKey: "transactions" }]
// - { pageKeys: [...] } / { permissions: [...] } wrappers
type AdminStatusWithPermissions = {
  isAdmin?: boolean;
  adminRole?: string;
  permissions?: unknown;
  pageKeys?: unknown;
};

function normalizeKey(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.toLowerCase() : null;
}

function extractRawPermissions(data: AdminStatusWithPermissions | undefined | null): unknown {
  if (!data || typeof data !== 'object') return undefined;
  // Prefer the canonical flat arrays; fall back to either alias when only
  // one is present. Also tolerate a nested `data` wrapper from older payloads.
  const direct =
    (data as Record<string, unknown>).permissions ??
    (data as Record<string, unknown>).pageKeys;
  if (direct !== undefined) return direct;
  const nested = (data as Record<string, unknown>).data;
  if (nested && typeof nested === 'object') {
    const rec = nested as Record<string, unknown>;
    return rec.permissions ?? rec.pageKeys;
  }
  return undefined;
}

function hasPagePermission(
  permissions: unknown,
  pageKey: string
): boolean {
  const wanted = normalizeKey(pageKey);
  if (!wanted) return false;
  if (!permissions) return false;

  // Tolerate a single string / single object instead of an array.
  const list = Array.isArray(permissions) ? permissions : [permissions];

  return list.some((p) => {
    if (typeof p === 'string') return normalizeKey(p) === wanted;
    if (p && typeof p === 'object') {
      const rec = p as Record<string, unknown>;
      const candidate =
        normalizeKey(rec.pageKey) ??
        normalizeKey(rec.key) ??
        normalizeKey(rec.name) ??
        // Some backends return { data: { pageKeys: [...] } } style nesting
        // inside the array; unwrap one level.
        (Array.isArray(rec.pageKeys)
          ? (rec.pageKeys as unknown[]).some((k) => normalizeKey(k) === wanted)
            ? wanted
            : null
          : null);
      return candidate === wanted;
    }
    return false;
  });
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useGetAdminStatusQuery();
  const [logout] = useLogoutMutation();

  useEffect(() => {
    if (!isLoading && (isError || !data || data?.isAdmin !== true)) {
      logout().unwrap().catch((err) => console.error("Auto logout failed:", err));
      router.replace('/login');
    }
  }, [isLoading, isError, data, router, logout]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 font-satoshi">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-[#68123D] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (isError || !data || data?.isAdmin !== true) {
    return null;
  }

  return <>{children}</>;
}

export function PagePermissionGuard({ children, pageKey }: PagePermissionGuardProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useGetAdminStatusQuery();

  // While the shared admin-status request is in flight, show the same spinner
  // styling so we never flash an "Access Denied" box prematurely.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 font-satoshi">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-[#68123D] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Let the global AuthGuard higher in the tree own the login redirect.
  if (isError || !data || data?.isAdmin !== true) {
    return null;
  }

  // Super Admin bypass: automatically grants access to every page.
  // Case-insensitive so 'superadmin' / 'SUPER_ADMIN' style values still pass.
  const role = typeof data?.adminRole === 'string' ? data.adminRole.toUpperCase().replace(/[^A-Z]/g, '') : '';
  if (role === 'SUPERADMIN') {
    return <>{children}</>;
  }

  const typedData = data as unknown as AdminStatusWithPermissions;
  const granted = hasPagePermission(extractRawPermissions(typedData), pageKey);

  if (granted) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50 font-satoshi p-6 text-center">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-md w-full">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-sm text-gray-500 mb-6">
          You do not have permission to view the {pageKey} section.
        </p>
        {/* <button
          onClick={() => router.replace('/admin')}
          className="w-full bg-[#68123D] hover:bg-[#520e30] text-white font-medium py-2 px-4 rounded transition-colors text-sm"
        >
          Return to Dashboard
        </button> */}
      </div>
    </div>
  );
}


