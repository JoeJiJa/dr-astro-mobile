import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import StudyHeatmap from './StudyHeatmap';
import { StudySession, StudySubject } from './types';
import { formatDuration } from './utils';

interface StatsViewProps {
    studyHistory: StudySession[];
    totalHours: number;
    remainingMinutes: number;
    subjects: StudySubject[];
}

const StatsView: React.FC<StatsViewProps> = ({
    studyHistory,
    totalHours,
    remainingMinutes,
    subjects
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
        >
            <StudyHeatmap history={studyHistory} />

            <div className="grid grid-cols-1 gap-4">
                <div className="bg-[#121212] p-5 rounded-2xl border border-zinc-800 text-center">
                    <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Total Study Time</h3>
                    <p className="text-4xl font-bold text-white font-mono">{totalHours}h {remainingMinutes}m</p>
                </div>
            </div>

            <div className="bg-[#121212] p-6 rounded-3xl border border-zinc-800/50">
                <h3 className="text-lg font-bold text-white mb-6">Subject Distribution (Minutes)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={subjects}>
                            <XAxis dataKey="title" hide />
                            <YAxis stroke="#52525b" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="totalTime" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-white px-2">Detailed Breakdown</h3>
                {subjects.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-[#121212] rounded-2xl border border-zinc-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></div>
                            <span className="font-medium text-zinc-300">{s.title}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-white font-mono">{formatDuration(s.totalTime)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default StatsView;
