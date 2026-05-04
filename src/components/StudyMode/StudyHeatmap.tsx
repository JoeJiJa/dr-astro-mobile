import React, { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { StudySession } from './types';

export const StudyHeatmap = React.memo(({ history }: { history: StudySession[] }) => {
    // Generate last 90 days
    const days = useMemo(() => Array.from({ length: 90 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (89 - i));
        return {
            date: d.toISOString().split('T')[0],
            obj: d
        };
    }), []);

    return (
        <div className="bg-zinc-900/50 backdrop-blur-xl p-6 rounded-3xl border border-zinc-800 shadow-2xl">
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6 flex items-center gap-2">
                <Activity size={18} className="text-blue-400" />
                Study Consistency
            </h3>
            <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                {days.map(day => {
                    const session = history.find(h => h.date === day.date);
                    const mins = session ? session.minutes : 0;

                    let color = 'bg-zinc-800/50';
                    let glow = '';

                    if (mins > 0) { color = 'bg-blue-900/60'; glow = ''; }
                    if (mins > 30) { color = 'bg-blue-600/80'; glow = 'shadow-sm shadow-blue-500/20'; }
                    if (mins > 60) { color = 'bg-blue-500'; glow = 'shadow shadow-blue-500/40'; }
                    if (mins > 120) { color = 'bg-blue-400'; glow = 'shadow-md shadow-blue-400/60'; }

                    return (
                        <div
                            key={day.date}
                            className={`w-3 h-3 rounded-sm ${color} ${glow} transition-all duration-300 hover:scale-125 cursor-help`}
                            title={`${day.date}: ${mins} minutes`}
                        />
                    );
                })}
            </div>
            <div className="flex justify-end items-center gap-2 mt-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-sm bg-zinc-800/50"></div>
                    <div className="w-2 h-2 rounded-sm bg-blue-900/40"></div>
                    <div className="w-2 h-2 rounded-sm bg-blue-600/60"></div>
                    <div className="w-2 h-2 rounded-sm bg-blue-500"></div>
                </div>
                <span>More</span>
            </div>
        </div>
    );
});

StudyHeatmap.displayName = 'StudyHeatmap';
export default StudyHeatmap;
