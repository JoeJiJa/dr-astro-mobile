import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BlogPage() {
  return (
    <article className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-black uppercase tracking-widest">Back to Neural Hub</span>
      </Link>

      <header className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/10 border border-red-500/20 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest">
           Neural Insights
        </div>
        <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tighter leading-tight">
          Medical Books vs Study Materials:<br />
          <span className="text-red-500">Key Differences Explained</span>
        </h1>
        <p className="text-xl text-zinc-500 leading-relaxed font-medium italic">
          Mastering the medical curriculum requires a strategic choice of resources. Understanding when to dive deep into reference textbooks and when to rely on high-yield study materials is the key to clinical mastery.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 py-8">
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-4">
          <BookOpen className="text-red-500" size={32} />
          <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Standard Textbooks</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Reference textbooks like Guyton & Hall for Physiology or Harrison&apos;s for Internal Medicine provide the foundational &quot;Why&quot; behind medical science. They are essential for building a long-term first principles understanding.
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-4">
          <Layers className="text-red-500" size={32} />
          <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Study Materials</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            High-yield guides, clinical notes, and mind maps (like those found in Dr. Astro) are optimized for &quot;What&quot; you need to know for examinations and bedside rounds. They prioritize pattern recognition and recall.
          </p>
        </div>
      </div>

      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">The Core Divergence</h2>
        <div className="prose prose-invert max-w-none space-y-6 text-zinc-400 leading-relaxed">
          <p>
            The primary difference lies in <strong>Structural Intent</strong>. A textbook is a repository of knowledge, designed to be exhaustive. It provides context, historical clinical trials, and detailed molecular mechanisms. In contrast, study materials are <strong>Filtered Registries</strong>. They remove the fluff and leave the &quot;Must-Know&quot; facts required for NEET PG, USMLE, or FMGE hurdles.
          </p>
          
          <div className="bg-red-600/5 border-l-4 border-red-500 p-6 rounded-r-[2rem] my-8">
            <div className="flex gap-4">
              <AlertCircle className="text-red-500 shrink-0" size={24} />
              <p className="text-sm text-zinc-300 italic">
                &quot;Studying from study materials without a foundational base from textbooks is like building a skyscraper on sand. Conversely, using only textbooks for exam prep is like trying to find a needle in a haystack—you have the needle, but you&apos;ll run out of time finding it.&quot;
              </p>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white">When to Choose Textbooks?</h3>
          <ul className="space-y-4 list-none p-0">
            {[
              "Building First Principles: During the first read of a subject in professional years.",
              "Complex Pathophysiology: When you can&apos;t grasp why a symptom occurs.",
              "Research & Reference: When verifying updated clinical guidelines.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="text-red-500 mt-1 shrink-0" size={18} />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <h3 className="text-2xl font-bold text-white">When to Choose Study Materials?</h3>
          <ul className="space-y-4 list-none p-0">
            {[
              "Final Revision: In the last 3-6 months before a competitive exam.",
              "Quick Reference: During hospital rounds to refresh clinical signs.",
              "Active Recall: When testing clinical diagnostic patterns through cases.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="text-red-500 mt-1 shrink-0" size={18} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="pt-16 border-t border-white/5 text-center space-y-6">
        <h3 className="text-2xl font-bold text-white">Ready for Neural Optimization?</h3>
        <p className="text-zinc-500">
          Dr. Astro bridges the gap by providing high-yield summaries that link directly to verified medical foundations.
        </p>
        <Link href="/" className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-12 py-4 rounded-2xl transition-all shadow-xl shadow-red-600/20 active:scale-95">
          Explore Intelligence Hub
        </Link>
      </footer>
    </article>
  );
}
