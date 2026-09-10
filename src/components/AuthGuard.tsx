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

// Local extension of the admin-status payload to support granular page permissions
// without mutating the shared RTK Query type. Supports both shapes:
// - string[] e.g. ["transactions", "dashboard"]
// - object[] e.g. [{ pageKey: "transactions" }]
type PermissionEntry = string | { pageKey: string };
type AdminStatusWithPermissions = {
  isAdmin?: boolean;
  adminRole?: string;
  permissions?: PermissionEntry[];
};

function hasPagePermission(
  permissions: PermissionEntry[] | undefined,
  pageKey: string
): boolean {
  if (!permissions || !Array.isArray(permissions)) return false;
  return permissions.some((p) => {
    if (typeof p === 'string') return p === pageKey;
    if (p && typeof p === 'object' && 'pageKey' in p) return p.pageKey === pageKey;
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

  // Super Admin bypass: automatically grants access to every page.
  if (data?.adminRole === 'SUPERADMIN') {
    return <>{children}</>;
  }

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

  const typedData = data as unknown as AdminStatusWithPermissions;
  const granted = hasPagePermission(typedData?.permissions, pageKey);

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
        <button
          onClick={() => router.replace('/admin')}
          className="w-full bg-[#68123D] hover:bg-[#520e30] text-white font-medium py-2 px-4 rounded transition-colors text-sm"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}


