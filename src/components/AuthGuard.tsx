"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetProfileQuery } from '../services/padiApi/userApi';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading, isError } = useGetProfileQuery();

  useEffect(() => {
    if (!isLoading && (isError || !data)) {
      router.replace('/login');
    }
  }, [isLoading, isError, data, router]);

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

  if (isError || !data) {
    return null;
  };

  return <>{children}</>;
};
