import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

const LeaderboardView: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 pb-20"
        >
            <div className="flex flex-col gap-1 px-2">
                <h3 className="text-2xl font-black text-white font-display uppercase tracking-wider">The Focus Hall of Fame</h3>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Global Ranks • Updated Live</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {[
                    { name: "Dr. Sanjay (You)", time: "42h 15m", rank: 1, medal: '🥇' },
                    { name: "Dr. Sarah Miller", time: "38h 20m", rank: 2, medal: '🥈' },
                    { name: "Dr. James Wilson", time: "35h 45m", rank: 3, medal: '🥉' },
                    { name: "Dr. Emily Chen", time: "31h 10m", rank: 4, medal: '🎖️' },
                    { name: "Dr. Michael Abet", time: "28h 55m", rank: 5, medal: '🎖️' },
                ].map((user, i) => (
                    <div key={i} className={`group relative p-4 rounded-3xl border transition-all duration-200 hover:scale-[1.02] ${user.name.includes('(You)') ? 'bg-red-600 border-red-500 shadow-2xl shadow-red-600/20' : 'bg-[#121212] border-zinc-800'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-2xl">{user.medal}</div>
                                <div>
                                    <p className={`font-black uppercase text-[12px] tracking-tight ${user.name.includes('(You)') ? 'text-white' : 'text-zinc-200'}`}>{user.name}</p>
                                    <div className={`flex items-center gap-1.5 mt-0.5 ${user.name.includes('(You)') ? 'text-white/70' : 'text-zinc-500'}`}>
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="text-[10px] font-bold uppercase">Online Now</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-mono text-lg font-black ${user.name.includes('(You)') ? 'text-white' : 'text-zinc-100'}`}>{user.time}</p>
                                <p className={`text-[9px] font-black uppercase tracking-widest ${user.name.includes('(You)') ? 'text-white/60' : 'text-zinc-600'}`}>Weekly Focus</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Telegram Reward Box */}
            <div className="relative group overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col gap-4 shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-600 rounded-2xl shadow-xl shadow-red-600/30">
                        <Trophy size={24} className="text-white" />
                    </div>
                    <h4 className="font-black text-white font-display uppercase tracking-tight italic">Rewards for Heroes</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-bold">
                    Maintain your Top 10 rank until Sunday to unlock the <strong>Exclusive Clinical Cases PDF</strong> delivered directly via @DrAstroBot.
                </p>
                <button className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">
                    View Full Standings
                </button>
            </div>
        </motion.div>
    );
};

export default LeaderboardView;
