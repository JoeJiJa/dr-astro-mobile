import React, { useState, useEffect, useCallback } from 'react';
import { 
    ArrowLeft, 
    Activity, 
    Check, 
    Sparkles, 
    ArrowRight, 
    Database, 
    HeartPulse, 
    LayoutGrid, 
    Terminal,
    Monitor,
    Cpu,
    Dna,
    ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppUser } from '../../types'; 
import { AI_CASES } from '../../data/ai-cases';

type LabModule = 'SIMULATION' | 'REGISTRY' | 'BIOMETRICS';

interface Scenario {
    vignette: string;
    options: string[];
    answer: number;
    explanation: string;
    pearl: string;
}

export default function NeuralLabView({ 
    onBack, 
    onSimulationComplete
}: { 
    onBack: () => void,
    currentUser: AppUser | null,
    onSimulationComplete: (isCorrect: boolean) => void
}) {
    const [activeModule, setActiveModule] = useState<LabModule>('SIMULATION');
    const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'result'>('idle');
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);

    // Mock data for the "Something Bigger" Registry view
    const subjects = [
        { id: 'anatomy', name: 'Anatomy', status: 85 },
        { id: 'physiology', name: 'Physiology', status: 60 },
        { id: 'biochemistry', name: 'Biochemistry', status: 45 },
        { id: 'pathology', name: 'Pathology', status: 92 },
        { id: 'pharmacology', name: 'Pharmacology', status: 78 },
        { id: 'microbiology', name: 'Microbiology', status: 65 },
        { id: 'medicine', name: 'Medicine', status: 88 },
        { id: 'surgery', name: 'Surgery', status: 82 },
        { id: 'obg', name: 'OBG', status: 95 },
        { id: 'pediatrics', name: 'Pediatrics', status: 70 },
        { id: 'ent', name: 'ENT', status: 55 },
        { id: 'ophthalmology', name: 'Ophthalmology', status: 40 },
        { id: 'forensic', name: 'Forensic', status: 30 },
        { id: 'psm', name: 'PSM', status: 20 },
        { id: 'orthopedics', name: 'Orthopedics', status: 15 },
        { id: 'radiology', name: 'Radiology', status: 10 },
        { id: 'anesthesia', name: 'Anesthesia', status: 5 },
        { id: 'psychiatry', name: 'Psychiatry', status: 0 },
        { id: 'dermatology', name: 'Dermatology', status: 0 },
    ];

    // Stable session values moved out of render to avoid purity errors
    const [caseId] = useState(() => Math.floor(Math.random() * 9000) + 1000);
    const [matrixContent] = useState(() => Array(2000).fill(0).map(() => Math.floor(Math.random() * 2)).join(''));

    const synthesizeCase = useCallback(async () => {
        setStatus('loading');
        try {
            // In a real app, this calls the Gemini Genkit Flow
            // For now, we prioritize our recovered AI_CASES database
            await new Promise(r => setTimeout(r, 1200)); // Simulate neural synthesis
            
            const randomCase = AI_CASES[Math.floor(Math.random() * AI_CASES.length)];
            
            setScenario({
                vignette: randomCase.q,
                options: randomCase.options,
                answer: randomCase.options.indexOf(randomCase.answer),
                explanation: randomCase.explanation,
                pearl: `Clinical Focus: ${randomCase.system}`
            });
            setStatus('active');
            setSelectedIdx(null);
            setShowExplanation(false);
        } catch (err) {
            console.error(err);
            setStatus('idle');
            setStatus('active');
        }
    }, []); // Removed config dependency as it is not used inside synthesizeCase

    useEffect(() => {
        if (activeModule === 'SIMULATION' && !scenario) {
            setTimeout(() => synthesizeCase(), 0);
        }
    }, [activeModule, scenario, synthesizeCase]);

    // UI Styles
    const activeTabStyle = "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]";
    const inactiveTabStyle = "bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10";

    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-600/30 overflow-x-hidden font-sans pb-40">
            {/* ── CINEMATIC HEADER ── */}
            <div className="relative h-[40vh] w-full flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(220,38,38,0.2),transparent_70%)]" />
                    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                    {/* Pulsing Neural Core */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 blur-[120px] rounded-full animate-pulse" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-6 pt-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-20 h-20 rounded-[2rem] bg-red-600 flex items-center justify-center text-white shadow-[0_0_50px_rgba(220,38,38,0.5)] border border-white/20"
                    >
                        <Cpu size={40} className="animate-pulse" />
                    </motion.div>
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black font-display tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-white to-red-600 bg-[size:200%_auto] animate-shimmer">
                            NEURAL <span className="text-white not-italic font-serif opacity-30">LAB</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-red-500/60 mt-4">Clinical Command & Control Center</p>
                    </div>
                </div>

                {/* Back Link */}
                <button 
                    onClick={onBack}
                    className="absolute top-12 left-12 group flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-red-600 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Exit Terminal
                </button>
            </div>

            {/* ── COMMAND TABS ── */}
            <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-20">
                <div className="flex p-2 bg-zinc-900/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl">
                    <button 
                        onClick={() => setActiveModule('SIMULATION')}
                        className={`flex-1 py-4 rounded-[2rem] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeModule === 'SIMULATION' ? activeTabStyle : inactiveTabStyle}`}
                    >
                        <Activity size={16} /> Clinical Simulation
                    </button>
                    <button 
                        onClick={() => setActiveModule('REGISTRY')}
                        className={`flex-1 py-4 rounded-[2rem] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeModule === 'REGISTRY' ? activeTabStyle : inactiveTabStyle}`}
                    >
                        <Database size={16} /> Neural Registry
                    </button>
                    <button 
                        onClick={() => setActiveModule('BIOMETRICS')}
                        className={`flex-1 py-4 rounded-[2rem] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeModule === 'BIOMETRICS' ? activeTabStyle : inactiveTabStyle}`}
                    >
                        <HeartPulse size={16} /> Biometrics
                    </button>
                </div>
            </div>

            {/* ── MODULE CONTENT ── */}
            <div className="max-w-6xl mx-auto px-4 mt-20">
                <AnimatePresence mode="wait">
                    {activeModule === 'SIMULATION' && (
                        <motion.div 
                            key="sim"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12"
                        >
                            {status === 'loading' ? (
                                <div className="py-40 flex flex-col items-center justify-center space-y-8">
                                    <div className="relative">
                                        <div className="w-24 h-24 border-2 border-red-600/20 rounded-full animate-spin-slow"></div>
                                        <div className="absolute inset-0 w-24 h-24 border-t-2 border-red-600 rounded-full animate-spin"></div>
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 animate-pulse">Synthesizing Patient Matrix...</p>
                                </div>
                            ) : (
                                <div className="max-w-3xl mx-auto space-y-12">
                                    {/* Simulation Console */}
                                    <div className="relative p-10 md:p-16 bg-zinc-900 border border-white/5 rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-3xl">
                                        <div className="absolute top-0 right-0 p-10 opacity-5">
                                            <Monitor size={120} />
                                        </div>
                                        <div className="relative z-10 space-y-8">
                                            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-red-600/10 border border-red-600/20 rounded-full text-[9px] font-black text-red-500 uppercase tracking-widest">
                                                <Terminal size={12} /> Live Uplink: CASE_{caseId}
                                            </div>
                                            <h3 className="text-2xl md:text-4xl text-white font-serif italic leading-snug">
                                                &quot;{scenario?.vignette}&quot;
                                            </h3>
                                        </div>
                                        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                                            <div className="h-full bg-red-600 animate-scan" />
                                        </div>
                                    </div>

                                    {/* Options Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {scenario?.options.map((opt: string, idx: number) => {
                                            const isCorrect = idx === scenario.answer;
                                            const isSelected = idx === selectedIdx;
                                            const revealed = selectedIdx !== null;
                                            
                                            return (
                                                <button
                                                    key={idx}
                                                    disabled={revealed}
                                                    onClick={() => {
                                                        setSelectedIdx(idx);
                                                        setShowExplanation(true);
                                                        onSimulationComplete(isCorrect);
                                                    }}
                                                    className={`p-8 border rounded-3xl text-left transition-all duration-300 group relative overflow-hidden
                                                        ${!revealed ? 'bg-white/5 border-white/10 hover:border-red-600 hover:bg-white/10 active:scale-95' : ''}
                                                        ${revealed && isCorrect ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : ''}
                                                        ${revealed && isSelected && !isCorrect ? 'bg-red-600/20 border-red-500 text-red-400 shadow-[0_0_30px_rgba(220,38,38,0.2)]' : ''}
                                                        ${revealed && !isCorrect && !isSelected ? 'opacity-30 border-white/5 grayscale' : ''}
                                                    `}
                                                >
                                                    <div className="flex items-center justify-between relative z-10">
                                                        <span className="font-black text-xs uppercase tracking-wider">{opt}</span>
                                                        {revealed && isCorrect && <Check size={18} className="text-emerald-500" />}
                                                        {revealed && isSelected && !isCorrect && <ShieldAlert size={18} className="text-red-500" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Feedback Block */}
                                    {showExplanation && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] shadow-4xl space-y-8"
                                        >
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest">Neural Logic</h4>
                                                <p className="text-slate-900 dark:text-zinc-300 font-serif italic text-lg leading-relaxed">{scenario?.explanation}</p>
                                            </div>
                                            <div className="pt-8 border-t border-zinc-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
                                                        <Sparkles size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-yellow-500 uppercase tracking-widest mb-1">Knowledge Pearl</p>
                                                        <p className="text-slate-800 dark:text-zinc-200 text-sm font-bold">{scenario?.pearl}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={synthesizeCase}
                                                    className="w-full md:w-auto px-10 py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-red-600/40 active:scale-95"
                                                >
                                                    Next Transmission <ArrowRight size={16} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeModule === 'REGISTRY' && (
                        <motion.div 
                            key="registry"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {subjects.map((sub) => (
                                    <div key={sub.id} className="p-6 bg-zinc-900 border border-white/5 rounded-3xl group hover:border-red-600/50 transition-all cursor-default">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-red-500 transition-colors">
                                                <LayoutGrid size={20} />
                                            </div>
                                            <span className="text-[10px] font-mono text-zinc-600">ID_{sub.id.substring(0,3).toUpperCase()}</span>
                                        </div>
                                        <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300 group-hover:text-white mb-4">{sub.name}</h4>
                                        <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-white/5">
                                            <div 
                                                className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)] transition-all duration-1000"
                                                style={{ width: `${sub.status}%` }}
                                            />
                                        </div>
                                        <div className="mt-2 flex justify-between items-center">
                                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Readiness</span>
                                            <span className="text-[10px] font-black text-red-500">{sub.status}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeModule === 'BIOMETRICS' && (
                        <motion.div 
                            key="bio"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* ECG Monitor */}
                                <div className="p-10 bg-zinc-900 border border-white/5 rounded-[3rem] h-80 relative overflow-hidden">
                                    <div className="absolute top-6 left-6 flex items-center gap-2">
                                        <Activity size={16} className="text-red-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Neural ECG Monitor</span>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-40">
                                        <svg viewBox="0 0 400 100" className="w-full h-32 text-red-500 stroke-current stroke-2 fill-none">
                                            <path d="M0 50 L100 50 L110 20 L120 80 L130 50 L200 50 L210 10 L220 90 L230 50 L400 50" className="animate-dash" />
                                        </svg>
                                    </div>
                                    <div className="absolute bottom-8 right-8 text-right">
                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Pulse Sync</p>
                                        <p className="text-4xl font-black text-white tabular-nums animate-pulse">72 <span className="text-xs text-red-500">BPM</span></p>
                                    </div>
                                </div>

                                {/* DNA Sequence */}
                                <div className="p-10 bg-zinc-900 border border-white/5 rounded-[3rem] h-80 relative overflow-hidden">
                                    <div className="absolute top-6 left-6 flex items-center gap-2">
                                        <Dna size={16} className="text-blue-500 animate-spin-slow" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Genetic Blueprint Mapping</span>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="flex gap-2">
                                            {[...Array(12)].map((_, i) => (
                                                <div 
                                                    key={i} 
                                                    className="w-1.5 bg-blue-600/20 rounded-full flex flex-col justify-between p-0.5 h-32"
                                                >
                                                    <div className="w-full h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i*0.1}s` }} />
                                                    <div className="w-full h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${i*0.1 + 0.5}s` }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-8 right-8 text-right">
                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Genome Stability</p>
                                        <p className="text-4xl font-black text-white tabular-nums">99.8 <span className="text-xs text-blue-500">%</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Matrix Background Card */}
                            <div className="p-12 bg-white/5 border border-white/5 rounded-[4rem] flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden min-h-[300px]">
                                <div className="absolute inset-0 opacity-10 font-mono text-[8px] leading-tight overflow-hidden break-all whitespace-pre pointer-events-none">
                                    {matrixContent}
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-[0.3em] relative z-10 italic">Secure Data Layer</h3>
                                <p className="text-zinc-500 font-medium text-lg max-w-xl relative z-10 leading-relaxed">
                                    Your clinical progress is being indexed into the Dr. Astro global neural network for lifelong medical excellence.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Global Animation Styles */}
            <style>{`
                @keyframes scan {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-scan {
                    animation: scan 3s linear infinite;
                }
                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }
                @keyframes dash {
                    to { stroke-dashoffset: 0; }
                }
                .animate-dash {
                    stroke-dasharray: 1000;
                    stroke-dashoffset: 1000;
                    animation: dash 5s linear infinite;
                }
                .animate-view-transition {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
