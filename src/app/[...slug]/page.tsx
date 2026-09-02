'use client';

import dynamic from 'next/dynamic';

const FigmaApp = dynamic(() => import('@/components/FigmaApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1823] text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#0EA5A0] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-400 font-medium">Loading AccessChain...</span>
      </div>
    </div>
  ),
});

export default function CatchAllPage() {
  return <FigmaApp />;
}
