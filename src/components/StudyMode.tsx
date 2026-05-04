import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    CheckCircle, Trophy, Grid, Layers, BarChart2, ChevronLeft
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

// Sub-components
import DashboardView from './StudyMode/DashboardView';
import StatsView from './StudyMode/StatsView';
import NotesView from './StudyMode/NotesView';
import TasksView from './StudyMode/TasksView';
import LeaderboardView from './StudyMode/LeaderboardView';
import ActiveSessionTimer from './StudyMode/ActiveSessionTimer';
import SettingsModal from './StudyMode/SettingsModal';
import SimpleInputModal from './StudyMode/SimpleInputModal';

// Types & Constants
import {
    TimerMode, GlobalTimerState, NavTab, Note, Task, StudySession,
    TimerSettings, StudySubject, SessionLog
} from './StudyMode/types';
import { INITIAL_DATA } from './StudyMode/constants';

/**
 * ==========================================
 * MAIN COMPONENT (Orchestration Layer)
 * ==========================================
 */
const StudyMode = ({ userId, onExit }: { userId?: string, onExit?: () => void }) => {
    // 1. STATE INITIALIZATION
    const [subjects, setSubjects] = useState<StudySubject[]>(() => {
        if (typeof window === 'undefined' || !userId) return INITIAL_DATA;
        const saved = localStorage.getItem(`study_subjects_${userId}`);
        return saved ? JSON.parse(saved) : INITIAL_DATA;
    });

    const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
    const [showAddSubject, setShowAddSubject] = useState(false);

    const [timerSettings, setTimerSettings] = useState<TimerSettings>(() => {
        if (typeof window === 'undefined') return { focus: 25, shortBreak: 5, longBreak: 15 };
        const saved = localStorage.getItem('dr_astro_timer_settings');
        return saved ? JSON.parse(saved) : { focus: 25, shortBreak: 5, longBreak: 15 };
    });

    const [showSettings, setShowSettings] = useState(false);

    const [studyHistory, setStudyHistory] = useState<StudySession[]>(() => {
        if (typeof window === 'undefined' || !userId) return [];
        const saved = localStorage.getItem(`study_history_${userId}`);
        return saved ? JSON.parse(saved) : [];
    });

    const [activeSoundId, setActiveSoundId] = useState<string>('none');

    const [notes, setNotes] = useState<Note[]>(() => {
        if (typeof window === 'undefined' || !userId) return [];
        const saved = localStorage.getItem(`study_notes_${userId}`);
        return saved ? JSON.parse(saved) : [];
    });

    const [newNote, setNewNote] = useState('');

    const [tasks, setTasks] = useState<Task[]>(() => {
        if (typeof window === 'undefined' || !userId) return [];
        const saved = localStorage.getItem(`study_tasks_${userId}`);
        return saved ? JSON.parse(saved) : [];
    });

    const [newTask, setNewTask] = useState('');
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [timerState, setTimerState] = useState<GlobalTimerState>(() => ({
        isRunning: false,
        timeLeft: timerSettings.focus * 60,
        mode: 'focus',
        subjectId: null,
        isAlarmRinging: false,
        initialTime: timerSettings.focus
    }));

    const [overlayVisible, setOverlayVisible] = useState(false);
    const [sessionLogs, setSessionLogs] = useState<SessionLog[]>(() => {
        if (typeof window === 'undefined' || !userId) return [];
        const saved = localStorage.getItem(`study_sessions_${userId}`);
        return saved ? JSON.parse(saved) : [];
    });

    const [showConflictModal, setShowConflictModal] = useState<{ newSubject: StudySubject } | null>(null);
    const [showRestartModal, setShowRestartModal] = useState(false);
    const [toast, setToast] = useState<{ msg: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    // 2. PERSISTENCE HELPERS
    const saveSubjects = useCallback(async (newSubjects: StudySubject[]) => {
        setSubjects(newSubjects);
        if (userId) {
            localStorage.setItem(`study_subjects_${userId}`, JSON.stringify(newSubjects));
            try {
                const userRef = doc(db, 'users', userId);
                await setDoc(userRef, { studySubjects: newSubjects }, { merge: true });
            } catch (err) { console.error("Error saving subjects:", err); }
        }
    }, [userId]);

    const saveHistory = useCallback(async (newHistory: StudySession[]) => {
        setStudyHistory(newHistory);
        if (userId) {
            localStorage.setItem(`study_history_${userId}`, JSON.stringify(newHistory));
            try {
                const userRef = doc(db, 'users', userId);
                await setDoc(userRef, { studyHistory: newHistory }, { merge: true });
            } catch (err) { console.error("Error saving history:", err); }
        }
    }, [userId]);

    const saveSessionLogs = useCallback(async (updatedLogs: SessionLog[]) => {
        setSessionLogs(updatedLogs);
        if (userId) {
            localStorage.setItem(`study_sessions_${userId}`, JSON.stringify(updatedLogs));
            try {
                const userRef = doc(db, 'users', userId);
                await setDoc(userRef, { studySessions: updatedLogs }, { merge: true });
            } catch (err) { console.error("Error saving sessions:", err); }
        }
    }, [userId]);

    const saveSettings = useCallback((newSettings: TimerSettings) => {
        setTimerSettings(newSettings);
        localStorage.setItem('dr_astro_timer_settings', JSON.stringify(newSettings));
    }, []);

    const saveNotes = useCallback(async (updatedNotes: Note[]) => {
        setNotes(updatedNotes);
        if (userId) {
            localStorage.setItem(`study_notes_${userId}`, JSON.stringify(updatedNotes));
            try {
                const userRef = doc(db, 'users', userId);
                await setDoc(userRef, { studyNotes: updatedNotes }, { merge: true });
            } catch (err) { console.error("Error saving notes:", err); }
        }
    }, [userId]);

    const saveTasks = useCallback(async (updatedTasks: Task[]) => {
        setTasks(updatedTasks);
        if (userId) {
            localStorage.setItem(`study_tasks_${userId}`, JSON.stringify(updatedTasks));
            try {
                const userRef = doc(db, 'users', userId);
                await setDoc(userRef, { studyTasks: updatedTasks }, { merge: true });
            } catch (err) { console.error("Error saving tasks:", err); }
        }
    }, [userId]);

    // 3. CORE HANDLERS
    const handleSessionComplete = useCallback((minutes: number, subjectId: string) => {
        const newSubjects = subjects.map(s =>
            s.id === subjectId ? { ...s, totalTime: s.totalTime + minutes } : s
        );
        saveSubjects(newSubjects);

        const today = new Date().toISOString().split('T')[0];
        const existingEntry = studyHistory.find(h => h.date === today);
        let newHistory;
        if (existingEntry) {
            newHistory = studyHistory.map(h => h.date === today ? { ...h, minutes: h.minutes + minutes } : h);
        } else {
            newHistory = [...studyHistory, { date: today, minutes }];
        }
        saveHistory(newHistory);

        if (userId) {
            const subjectTitle = subjects.find(s => s.id === subjectId)?.title || 'Unknown Subject';
            const newLog: SessionLog = {
                _id: Date.now().toString(),
                userId,
                subjectId,
                subjectTitle,
                durationPlanned: timerState.initialTime,
                durationCompleted: minutes,
                date: new Date().toISOString(),
                timestamp: Date.now(),
                status: minutes >= timerState.initialTime ? 'completed' : 'partial'
            };
            saveSessionLogs([newLog, ...sessionLogs]);
        }

        setToast({ msg: `Session recorded: ${minutes}m for ${subjects.find(s => s.id === subjectId)?.title || 'Subject'}` });
        setTimeout(() => setToast(null), 4000);
    }, [subjects, studyHistory, saveSubjects, saveHistory, userId, timerState.initialTime, sessionLogs, saveSessionLogs]);

    // Timer Tick Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timerState.isRunning && timerState.timeLeft > 0 && !timerState.isAlarmRinging) {
            interval = setInterval(() => {
                setTimerState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
            }, 1000);
        } else if (timerState.timeLeft === 0 && timerState.isRunning && !timerState.isAlarmRinging) {
            setTimeout(() => {
                setTimerState(prev => ({ ...prev, isRunning: false, isAlarmRinging: true }));
                if (timerState.mode === 'focus' && timerState.subjectId) {
                    handleSessionComplete(timerState.initialTime, timerState.subjectId);
                }
            }, 0);
            if (Notification.permission === 'granted') {
                new Notification(timerState.mode === 'focus' ? "Time's Up! Take a break." : "Break Over! Back to work.");
            }
        }
        return () => clearInterval(interval);
    }, [timerState.isRunning, timerState.timeLeft, timerState.isAlarmRinging, timerState.mode, timerState.subjectId, timerState.initialTime, handleSessionComplete]);

    // 4. ACTION CALLBACKS
    const handleAddNote = useCallback(() => {
        if (!newNote.trim()) return;
        const note: Note = { id: Date.now().toString(), text: newNote, createdAt: new Date().toISOString() };
        saveNotes([note, ...notes]);
        setNewNote('');
    }, [newNote, notes, saveNotes]);

    const handleDeleteNote = useCallback((id: string) => {
        saveNotes(notes.filter(n => n.id !== id));
    }, [notes, saveNotes]);

    const handleAddTask = useCallback(() => {
        if (!newTask.trim()) return;
        const task: Task = { id: Date.now().toString(), title: newTask, completed: false, createdAt: new Date().toISOString() };
        saveTasks([task, ...tasks]);
        setNewTask('');
    }, [newTask, tasks, saveTasks]);

    const toggleTask = useCallback((id: string) => {
        saveTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    }, [tasks, saveTasks]);

    const deleteTask = useCallback((id: string) => saveTasks(tasks.filter(t => t.id !== id)), [tasks, saveTasks]);

    const clearCompletedTasks = useCallback(() => saveTasks(tasks.filter(t => !t.completed)), [tasks, saveTasks]);

    const handleAddSubject = useCallback((title: string) => {
        const colors = ['#3B82F6', '#F97316', '#EF4444', '#8B5CF6', '#10B981', '#EC4899'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const newSub: StudySubject = { id: Date.now().toString(), title, color: randomColor, totalTime: 0 };
        saveSubjects([...subjects, newSub]);
    }, [subjects, saveSubjects]);

    const handleToggleTimer = useCallback(() => setTimerState(prev => ({ ...prev, isRunning: !prev.isRunning })), []);

    const handleModeChange = useCallback((m: TimerMode) => {
        setTimerState(prev => ({
            ...prev,
            mode: m,
            timeLeft: timerSettings[m] * 60,
            initialTime: timerSettings[m],
            isRunning: false,
            isAlarmRinging: false
        }));
    }, [timerSettings]);

    const confirmRestart = useCallback((saveStats: boolean) => {
        if (saveStats && timerState.subjectId) {
            const elapsed = Math.max(0, (timerState.initialTime * 60) - timerState.timeLeft) / 60;
            handleSessionComplete(Math.round(elapsed), timerState.subjectId);
        }
        setTimerState(prev => ({
            ...prev,
            timeLeft: timerSettings[prev.mode] * 60,
            initialTime: timerSettings[prev.mode],
            isRunning: true,
            isAlarmRinging: false
        }));
        setShowRestartModal(false);
    }, [timerState, timerSettings, handleSessionComplete]);

    const handleRestart = useCallback((extend: boolean = false) => {
        if (extend) {
            setTimerState(prev => ({ ...prev, timeLeft: prev.timeLeft + (10 * 60), isRunning: true }));
        } else {
            if ((timerState.initialTime * 60) - timerState.timeLeft > 0) setShowRestartModal(true);
            else confirmRestart(false);
        }
    }, [timerState, confirmRestart]);

    const handleNextSession = useCallback(() => {
        const nextMode = timerState.mode === 'focus' ? 'shortBreak' : 'focus';
        setTimerState(prev => ({
            ...prev,
            mode: nextMode,
            timeLeft: timerSettings[nextMode] * 60,
            initialTime: timerSettings[nextMode],
            isRunning: true,
            isAlarmRinging: false
        }));
    }, [timerState.mode, timerSettings]);

    const handleEndSession = useCallback((saveStats: boolean) => {
        if (saveStats && timerState.subjectId) {
            const elapsed = Math.max(0, (timerState.initialTime * 60) - timerState.timeLeft) / 60;
            handleSessionComplete(Math.round(elapsed), timerState.subjectId);
        }
        setTimerState(prev => ({ ...prev, isRunning: false, timeLeft: timerSettings.focus * 60, mode: 'focus', subjectId: null }));
        setOverlayVisible(false);
        setShowRestartModal(false);
    }, [timerState, timerSettings.focus, handleSessionComplete]);

    const handleCloseOverlay = useCallback(() => {
        if (timerState.isRunning || (timerState.timeLeft < timerState.initialTime * 60 && timerState.timeLeft > 0)) {
            setTimerState(p => ({ ...p, isRunning: false }));
            setShowRestartModal(true);
        } else {
            setOverlayVisible(false);
        }
    }, [timerState.isRunning, timerState.timeLeft, timerState.initialTime]);

    const handleStartSession = useCallback((subject: StudySubject) => {
        const isSessionActive = timerState.subjectId && timerState.subjectId !== subject.id && (timerState.isRunning || timerState.timeLeft < (timerState.initialTime * 60));
        if (isSessionActive) setShowConflictModal({ newSubject: subject });
        else if (timerState.subjectId === subject.id) setOverlayVisible(true);
        else {
            setTimerState({ isRunning: false, timeLeft: timerSettings.focus * 60, initialTime: timerSettings.focus, mode: 'focus', subjectId: subject.id, isAlarmRinging: false });
            setOverlayVisible(true);
        }
    }, [timerState, timerSettings.focus]);

    // 5. DATA SYNC & DERIVED
    useEffect(() => {
        if (!userId) return;
        const userRef = doc(db, 'users', userId);
        const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists() && !snapshot.metadata.hasPendingWrites) {
                const data = snapshot.data();
                if (data.studySubjects) setSubjects(data.studySubjects);
                if (data.studyHistory) setStudyHistory(data.studyHistory);
                if (data.studySessions) setSessionLogs(data.studySessions);
                if (data.studyNotes) setNotes(data.studyNotes);
                if (data.studyTasks) setTasks(data.studyTasks);
            }
        });
        return () => unsubscribe();
    }, [userId]);

    const filteredSubjects = useMemo(() =>
        subjects.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())),
        [subjects, searchQuery]
    );

    const { totalHours, remainingMinutes } = useMemo(() => {
        const totalMinutes = subjects.reduce((acc, s) => acc + s.totalTime, 0);
        return { totalHours: Math.floor(totalMinutes / 60), remainingMinutes: totalMinutes % 60 };
    }, [subjects]);

    // 6. RENDERING
    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-32 animate-in fade-in duration-200 pt-16 md:pt-32">
            {/* Modal Components */}
            {showConflictModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl max-w-sm w-full">
                        <h3 className="text-lg font-bold text-white mb-2">Timer Running</h3>
                        <p className="text-zinc-400 text-sm mb-6">
                            A session is already active for another subject. Stop it and start <strong>{showConflictModal.newSubject.title}</strong>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowConflictModal(null)} className="px-4 py-2 text-zinc-400 hover:text-white">Cancel</button>
                            <button
                                onClick={() => {
                                    setTimerState({ isRunning: false, timeLeft: timerSettings.focus * 60, initialTime: timerSettings.focus, mode: 'focus', subjectId: showConflictModal.newSubject.id, isAlarmRinging: false });
                                    setOverlayVisible(true);
                                    setShowConflictModal(null);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold"
                            >
                                Start New
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRestartModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl max-w-sm w-full">
                        <h3 className="text-lg font-bold text-white mb-2">Session Paused</h3>
                        <p className="text-zinc-400 text-sm mb-6">Would you like to save your progress before closing?</p>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => confirmRestart(true)} className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold">Save & Restart</button>
                            <button onClick={() => handleEndSession(true)} className="w-full px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold border border-zinc-700">Save & Close</button>
                            <button onClick={() => confirmRestart(false)} className="w-full px-4 py-3 bg-transparent hover:bg-zinc-800 text-zinc-400 rounded-xl font-bold">Discard & Restart</button>
                            <button onClick={() => setShowRestartModal(false)} className="text-xs text-zinc-500 mt-2 hover:text-zinc-300">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {overlayVisible && (
                <ActiveSessionTimer
                    timerState={timerState}
                    subject={subjects.find(s => s.id === timerState.subjectId) || null}
                    onClose={handleCloseOverlay}
                    onToggleTimer={handleToggleTimer}
                    onModeChange={handleModeChange}
                    onNextSession={handleNextSession}
                    onStopAlarm={() => setTimerState(p => ({ ...p, isAlarmRinging: false }))}
                    onRestart={() => handleRestart(false)}
                    activeSoundId={activeSoundId}
                    onSoundChange={setActiveSoundId}
                />
            )}

            <SimpleInputModal
                isOpen={showAddSubject}
                onClose={() => setShowAddSubject(false)}
                onSubmit={handleAddSubject}
                title="New Subject"
                placeholder="Ex: Microbiology"
            />

            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                settings={timerSettings}
                onSave={saveSettings}
            />

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && (
                        <DashboardView
                            key="dashboard"
                            viewDate={viewDate}
                            selectedDate={selectedDate}
                            onSelectDate={setSelectedDate}
                            onChangeMonth={(delta) => setViewDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + delta); return d; })}
                            onJumpToToday={() => { const now = new Date(); setViewDate(now); setSelectedDate(now); }}
                            showSearch={showSearch}
                            setShowSearch={setShowSearch}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            setShowSettings={setShowSettings}
                            filteredSubjects={filteredSubjects}
                            handleStartSession={handleStartSession}
                            setShowAddSubject={setShowAddSubject}
                        />
                    )}
                    {activeTab === 'stats' && (
                        <StatsView
                            key="stats"
                            studyHistory={studyHistory}
                            totalHours={totalHours}
                            remainingMinutes={remainingMinutes}
                            subjects={subjects}
                        />
                    )}
                    {activeTab === 'notes' && (
                        <NotesView
                            key="notes"
                            newNote={newNote}
                            setNewNote={setNewNote}
                            handleAddNote={handleAddNote}
                            notes={notes}
                            handleDeleteNote={handleDeleteNote}
                        />
                    )}
                    {activeTab === 'tasks' && (
                        <TasksView
                            key="tasks"
                            tasks={tasks}
                            clearCompletedTasks={clearCompletedTasks}
                            newTask={newTask}
                            setNewTask={setNewTask}
                            handleAddTask={handleAddTask}
                            toggleTask={toggleTask}
                            deleteTask={deleteTask}
                        />
                    )}
                    {activeTab === 'leaderboard' && (
                        <LeaderboardView key="leaderboard" />
                    )}
                </AnimatePresence>
            </main>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className="fixed bottom-24 left-1/2 z-[200] flex items-center gap-3 px-6 py-4 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl shadow-black/50"
                    >
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle size={18} className="text-green-500" />
                        </div>
                        <span className="text-zinc-200 font-medium text-sm">{toast.msg}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Navigation Dock */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-200">
                <div className="inline-flex items-center gap-1 p-2 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
                    <div className="flex items-center gap-1">
                        {[
                            { id: 'dashboard', icon: Grid, label: 'Focus' },
                            { id: 'tasks', icon: Layers, label: 'Tasks' },
                            { id: 'stats', icon: BarChart2, label: 'Stats' },
                            { id: 'leaderboard', icon: Trophy, label: 'Ranks' },
                        ].map(tab => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as NavTab)}
                                    className={`relative flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 font-bold text-sm ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <tab.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                    {isActive && <motion.span layoutId="study-nav-text" initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} className="whitespace-nowrap overflow-hidden">{tab.label}</motion.span>}
                                </button>
                            );
                        })}
                    </div>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <button onClick={onExit} className="flex items-center gap-2 px-4 py-3 rounded-full text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-all duration-300 font-bold text-sm group">
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Exit</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudyMode;
