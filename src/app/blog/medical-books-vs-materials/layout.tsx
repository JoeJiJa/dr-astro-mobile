import React from 'react';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 font-sans selection:bg-red-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-red-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-indigo-600/5 blur-[120px] rounded-full"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-24">
        {children}
      </div>
    </div>
  );
}
