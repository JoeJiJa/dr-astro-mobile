import Link from "next/link";
import { Stethoscope } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl h-16 glass-panel rounded-full z-[100] px-6 flex items-center justify-between border border-white/10 transition-all hover:bg-white/10">
      <Link href="/" className="flex items-center space-x-3 group">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
          <Stethoscope className="h-6 w-6 text-white" />
        </div>
        <span className="font-black text-xl text-white tracking-tighter">
          DR.ASTRO
        </span>
      </Link>

      <div className="flex items-center space-x-8">
        <nav className="hidden md:flex items-center space-x-8">
          {['Home', 'Study', 'Analytics'].map((item) => (
            <Link
              key={item}
              href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden sm:block text-xs font-bold uppercase tracking-widest text-white hover:text-accent transition-colors">
            Sign In
          </button>
          <button className="px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full hover:scale-105 transition-all">
            Join Now
          </button>
        </div>
      </div>
    </nav>
  );
}
