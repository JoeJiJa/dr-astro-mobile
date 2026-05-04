import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Settings, Plus, ChevronLeft, ChevronRight, X, Clock, Play } from 'lucide-react';
import CalendarStrip from './CalendarStrip';
import { StudySubject } from './types';
import { formatDuration } from './utils';

interface DashboardViewProps {
    viewDate: Date;
    selectedDate: Date;
    onSelectDate: (d: Date) => void;
    onChangeMonth: (delta: number) => void;
    onJumpToToday: () => void;
    showSearch: boolean;
    setShowSearch: (show: boolean) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    setShowSettings: (show: boolean) => void;
    filteredSubjects: StudySubject[];
    handleStartSession: (subject: StudySubject) => void;
    setShowAddSubject: (show: boolean) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
    viewDate,
    selectedDate,
    onSelectDate,
    onChangeMonth,
    onJumpToToday,
    showSearch,
    setShowSearch,
    searchQuery,
    setSearchQuery,
    setShowSettings,
    filteredSubjects,
    handleStartSession,
    setShowAddSubject
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
        >
            {/* Live Doctors Counter */}
            <div className="flex justify-center -mb-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full flex items-center gap-3 backdrop-blur-md"
                >
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    142 Doctors Focused Right Now
                </motion.div>
            </div>

            {/* 1. Header & Calendar */}
            <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-2 bg-[#18181b] p-1.5 rounded-xl border border-zinc-800">
                        {showSearch ? (
                            <div className="flex items-center px-2 w-[180px]">
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Search subjects..."
                                    className="bg-transparent border-none outline-none text-zinc-200 text-sm w-full placeholder:text-zinc-600"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onBlur={() => !searchQuery && setShowSearch(false)}
                                />
                                <button onClick={() => { setSearchQuery(''); setShowSearch(false); }} className="text-zinc-500 hover:text-white">
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <button onClick={() => onChangeMonth(-1)} className="p-1 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                    <ChevronLeft size={16} />
                                </button>
                                <button onClick={onJumpToToday} className="px-2 text-sm font-bold text-zinc-200 min-w-[100px] text-center">
                                    {viewDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
                                </button>
                                <button onClick={() => onChangeMonth(1)} className="p-1 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                    <ChevronRight size={16} />
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex gap-4 text-zinc-400">
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className={`p-2 rounded-full transition-colors ${showSearch ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800'}`}
                        >
                            <Search size={20} />
                        </button>
                        <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                            <Settings size={20} />
                        </button>
                    </div>
                </div>

                <CalendarStrip
                    viewDate={viewDate}
                    selectedDate={selectedDate}
                    onSelectDate={onSelectDate}
                />
            </div>

            {/* 2. Simplified Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white px-1">Study Dashboard</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode='popLayout'>
                    {filteredSubjects.map(subject => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={subject.id}
                            className="bg-[#121212] border border-zinc-800/50 rounded-3xl overflow-hidden transition-all duration-300 hover:border-zinc-700 hover:shadow-xl"
                        >
                            <div className="p-5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-800/50 flex items-center justify-center text-zinc-500">
                                    <Clock size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg text-zinc-100 truncate pr-2">
                                        {subject.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-zinc-500 font-mono">
                                            {formatDuration(subject.totalTime)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleStartSession(subject)}
                                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg hover:scale-110 active:scale-95 transition-all text-white"
                                    style={{ backgroundColor: subject.color }}
                                >
                                    <Play fill="white" size={20} className="ml-0.5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Bottom Add Button (Floating) */}
            <div className="flex justify-center md:justify-end pb-8">
                <button
                    onClick={() => setShowAddSubject(true)}
                    className="w-full md:w-auto px-8 py-4 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                >
                    <Plus size={20} />
                    Add New Subject
                </button>
            </div>
        </motion.div>
    );
};

export default DashboardView;
