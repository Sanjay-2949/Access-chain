'use client';

import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from '@/app/routes';

export default function FigmaApp() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1823] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#0EA5A0] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400 font-medium">Loading AccessChain...</span>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
