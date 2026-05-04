'use client';
import dynamic from 'next/dynamic';

const DrAstroApp = dynamic(() => import('@/components/dr-astro-app'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1)_0%,transparent_70%)] animate-pulse"></div>
      <div className="relative">
          <div className="w-32 h-32 border-2 border-white/5 rounded-full flex items-center justify-center animate-spin-slow">
              <div className="w-24 h-24 border-t-2 border-red-600 rounded-full animate-spin"></div>
          </div>
      </div>
      <div className="mt-12 space-y-4">
          <h2 className="text-3xl font-black text-white uppercase tracking-[0.4em] italic animate-pulse">Neural Synchronization</h2>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Loading Dr. Astro Core Modules...</p>
      </div>
    </div>
  )
});

export default function Home() {
  return <DrAstroApp />;
}
