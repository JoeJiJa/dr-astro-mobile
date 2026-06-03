'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion } from 'framer-motion';

const DrAstroApp = dynamic(() => import('@/components/dr-astro-app'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative"
      >
        {/* Subtle Ambient Radial Metallic Glow */}
        <div className="absolute inset-0 bg-zinc-700/5 blur-[100px] rounded-full animate-pulse" />
        
        <motion.div
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-36 h-36 md:w-48 md:h-48"
        >
          <Image
            src="/logo.png"
            alt="Dr. Astro Logo"
            fill
            className="object-contain filter invert-[0.9] brightness-[1.1] contrast-[1.2] drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            priority
          />
        </motion.div>
      </motion.div>
    </div>
  )
});

export default function Home() {
  return <DrAstroApp />;
}
