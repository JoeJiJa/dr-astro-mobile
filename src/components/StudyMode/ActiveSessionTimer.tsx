import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    X, Volume2, VolumeX, Maximize, Minimize, RefreshCw, CheckCircle, Play, Pause, Sun, Moon, CloudRain, Trees, Waves
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { GlobalTimerState, TimerMode, StudySubject } from './types';
import { SOUNDS } from './constants';
import { formatTimer } from './utils';

export const ActiveSessionTimer = React.memo(({
    timerState,
    subject,
    onClose,
    onToggleTimer,
    onModeChange,
    onNextSession,
    onStopAlarm,
    onRestart,
    activeSoundId,
    onSoundChange
}: {
    timerState: GlobalTimerState,
    subject: StudySubject | null,
    onClose: () => void,
    onToggleTimer: () => void,
    onModeChange: (m: TimerMode) => void,
    onNextSession: () => void,
    onStopAlarm: () => void,
    onRestart: (extend?: boolean) => void,
    activeSoundId: string,
    onSoundChange: (id: string) => void
}) => {
    const [showEndOptions, setShowEndOptions] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [keepScreenOn, setKeepScreenOn] = useState(true);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const alarmRef = useRef<HTMLAudioElement | null>(null);
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);

    const { isRunning, timeLeft, mode, isAlarmRinging, initialTime } = timerState;

    useEffect(() => {
        const requestWakeLock = async () => {
            if (isRunning && keepScreenOn && 'wakeLock' in navigator) {
                try {
                    wakeLockRef.current = await navigator.wakeLock.request('screen');
                } catch (err) { console.log('Wake Lock Error:', err); }
            }
        };
        const releaseWakeLock = async () => {
            if (wakeLockRef.current) {
                await wakeLockRef.current.release();
                wakeLockRef.current = null;
            }
        };
        if (isRunning) requestWakeLock();
        else releaseWakeLock();
        return () => { releaseWakeLock(); };
    }, [isRunning, keepScreenOn]);

    useEffect(() => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: mode === 'focus' ? 'Focus Session' : 'Rest Break',
                artist: subject?.title || 'Dr. Astro',
                album: isRunning ? 'Running' : 'Paused',
                artwork: [{ src: '/focus-art.png', sizes: '512x512', type: 'image/png' }]
            });

            navigator.mediaSession.setActionHandler('play', () => onToggleTimer());
            navigator.mediaSession.setActionHandler('pause', () => onToggleTimer());
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                onRestart();
            });
        }
    }, [mode, subject, isRunning, onToggleTimer, onRestart]);

    useEffect(() => {
        if (isRunning && activeSoundId !== 'none' && !isAlarmRinging) {
            const sound = SOUNDS.find(s => s.id === activeSoundId);
            if (sound && sound.url) {
                if (!audioRef.current) audioRef.current = new Audio(sound.url);
                else if (audioRef.current.src !== sound.url) audioRef.current.src = sound.url;

                audioRef.current.loop = true;
                audioRef.current.volume = 0.5;
                audioRef.current.play().catch(e => console.log("Audio play failed", e));
            }
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [isRunning, activeSoundId, isAlarmRinging]);

    useEffect(() => {
        if (isAlarmRinging) {
            if (!alarmRef.current) alarmRef.current = new Audio('https://cdn.pixabay.com/audio/2024/09/20/audio_51c6c59216.mp3');
            alarmRef.current.loop = true;
            alarmRef.current.volume = 1.0;
            alarmRef.current.play().catch(e => console.log("Alarm failed", e));
        } else {
            if (alarmRef.current) {
                alarmRef.current.pause();
                alarmRef.current.currentTime = 0;
            }
        }
    }, [isAlarmRinging]);

    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const handleFullscreenToggle = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => console.log(e));
        } else {
            document.exitFullscreen().catch(e => console.log(e));
        }
    }, []);

    const [isLandscape, setIsLandscape] = useState(false);
    useEffect(() => {
        const checkOrientation = () => {
            setIsLandscape(window.innerWidth > window.innerHeight && window.innerWidth < 1024);
        };
        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        return () => window.removeEventListener('resize', checkOrientation);
    }, []);

    const showMinimalUI = isFullscreen || isLandscape;

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    if (!subject) return null;

    const totalTimeForMode = initialTime * 60;
    const progress = totalTimeForMode > 0 ? 100 - (timeLeft / totalTimeForMode) * 100 : 0;
    const COLORS: Record<TimerMode, string> = { focus: subject?.color || '#3B82F6', shortBreak: '#10B981', longBreak: '#8B5CF6' };
    const RING_COLOR = COLORS[mode];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-gradient-to-br from-black via-zinc-900 to-black flex flex-col items-center justify-center overflow-hidden"
            >
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] opacity-20 pointer-events-none transition-colors duration-1000 ${mode === 'focus' ? 'bg-blue-600' : 'bg-green-500'}`} />

                {!isFullscreen && (
                    <button onClick={onClose} className="absolute top-6 right-6 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-all z-20 group">
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                )}
                {isAlarmRinging && (
                    <div className="absolute inset-0 z-[110] bg-red-950/80 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-200">
                        <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent animate-pulse" />
                        <Volume2 size={100} className="text-white mb-8 animate-bounce drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]" />
                        <h2 className="text-6xl font-black text-white mb-12 uppercase tracking-widest drop-shadow-xl">Time&apos;s Up!</h2>
                        <button
                            onClick={onStopAlarm}
                            className="px-16 py-6 bg-white text-red-600 rounded-full text-2xl font-black shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all"
                        >
                            STOP
                        </button>
                    </div>
                )}

                {showEndOptions && (
                    <div className="absolute inset-0 z-[110] bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                        <div className="bg-zinc-900/90 border border-zinc-700/50 p-8 rounded-[40px] shadow-2xl max-w-sm w-full mx-4 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500" />

                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={40} className="text-green-500" />
                            </div>

                            <h2 className="text-3xl font-bold text-white mb-2">Session Complete</h2>
                            <p className="text-zinc-400 mb-8 font-medium">Excellent work! Stay consistent.</p>

                            <div className="space-y-3">
                                <button
                                    onClick={onNextSession}
                                    className="w-full py-4 bg-white text-black rounded-2xl font-bold hover:bg-zinc-200 transition-colors shadow-lg active:scale-95"
                                >
                                    {mode === 'focus' ? 'Start Break ☕' : 'Start Focus ⚡'}
                                </button>
                                <button
                                    onClick={() => { onRestart(true); setShowEndOptions(false); }}
                                    className="w-full py-4 bg-zinc-800/50 border border-zinc-700 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-colors active:scale-95"
                                >
                                    +10 Minutes
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 text-zinc-500 font-medium hover:text-white transition-colors text-sm"
                                >
                                    End Session
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showMinimalUI ? (
                    <div className="flex flex-col items-center justify-center w-full h-full p-4 relative">
                        {isFullscreen && (
                            <div className="absolute top-8 right-8 flex gap-4 z-50">
                                <button onClick={handleFullscreenToggle} className="flex items-center gap-2 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all font-bold group">
                                    <Minimize size={24} />
                                    <span className="text-sm uppercase tracking-wider hidden group-hover:block animate-in fade-in">Exit</span>
                                </button>
                            </div>
                        )}

                        <div className="absolute top-8 left-8 flex gap-4 z-50 animate-in fade-in slide-in-from-top-4">
                            <div className="px-4 py-2 bg-white/5 rounded-full border border-white/5 text-sm font-bold text-zinc-300">
                                {subject.title}
                            </div>
                            <div className={`px-4 py-2 rounded-full border border-white/5 text-sm font-bold ${isRunning ? 'text-green-400 bg-green-500/10' : 'text-zinc-500 bg-white/5'}`}>
                                {mode === 'focus' ? 'FOCUS' : 'BREAK'}
                            </div>
                        </div>

                        <div className="flex flex-col items-center z-10 scale-100 transition-transform duration-200">
                            <div className="text-[25vw] md:text-[35vh] font-bold text-white leading-none font-variant-numeric tabular-nums tracking-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] select-none">
                                {formatTimer(timeLeft)}
                            </div>
                            <div className="flex w-full justify-between px-4 text-zinc-600 font-bold uppercase tracking-[0.5em] text-sm md:text-xl -mt-4 md:-mt-8">
                                <span>Minutes</span>
                                <span>Seconds</span>
                            </div>
                        </div>

                        <div className="mt-16 md:mt-24 flex items-center gap-8 z-20">
                            <button
                                onClick={onToggleTimer}
                                className={`px-12 py-4 rounded-full text-xl font-bold transition-all uppercase tracking-widest ${isRunning
                                    ? 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-white'
                                    : 'bg-[#Facc15] text-black shadow-[0_0_30px_rgba(250,204,21,0.4)] hover:scale-105'
                                    }`}
                            >
                                {isRunning ? 'Pause' : timeLeft < (totalTimeForMode) ? 'Resume' : 'Start'}
                            </button>
                            {!isRunning && timeLeft < (totalTimeForMode) && (
                                <button
                                    onClick={() => onRestart()}
                                    className="p-4 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-white hover:bg-zinc-700"
                                >
                                    <RefreshCw size={24} />
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex bg-black/30 backdrop-blur-lg border border-white/5 p-1.5 rounded-full relative z-10 mb-12 shadow-2xl">
                            {[
                                { id: 'focus', label: 'Focus' },
                                { id: 'shortBreak', label: 'Short Break' },
                                { id: 'longBreak', label: 'Long Break' }
                            ].map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => onModeChange(m.id as TimerMode)}
                                    className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${mode === m.id
                                        ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative mb-12 group cursor-pointer" onClick={onToggleTimer}>
                            <svg className="w-80 h-80 md:w-96 md:h-96 transform -rotate-90 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                <circle cx="50%" cy="50%" r="48%" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="transparent" />

                                <motion.circle
                                    animate={{ strokeDashoffset: totalTimeForMode > 0 ? (300 * Math.PI) - ((300 * Math.PI) * progress) / 100 : 0 }}
                                    cx="50%" cy="50%" r="48%"
                                    stroke={RING_COLOR} strokeWidth="6"
                                    fill="transparent"
                                    strokeDasharray={300 * Math.PI}
                                    strokeLinecap="round"
                                    pathLength={100}
                                    className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                                />
                            </svg>

                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                <div className="text-8xl md:text-[140px] font-bold text-white tracking-widest font-display leading-none tabular-nums drop-shadow-2xl">
                                    {formatTimer(timeLeft)}
                                </div>
                                <div className={`text-sm md:text-base font-bold uppercase tracking-[0.3em] mt-4 transition-colors duration-200 ${isRunning ? 'opacity-0' : 'text-zinc-600'}`}>
                                    {timeLeft === totalTimeForMode ? 'Can i begin' : 'Paused'}
                                </div>
                                <div className="mt-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs text-zinc-400 font-medium backdrop-blur-md max-w-[200px] truncate">
                                    {subject.title}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-8 z-10 w-full max-w-md px-6">
                            <div className="flex items-center gap-6">
                                {!isRunning && timeLeft < (totalTimeForMode) ? (
                                    <div className="flex items-center gap-6 animate-in fade-in zoom-in-50">
                                        <div className="flex flex-col items-center gap-2">
                                            <button
                                                onClick={() => onRestart()}
                                                title="Restart Session"
                                                className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all shadow-xl"
                                            >
                                                <RefreshCw size={24} />
                                            </button>
                                            <span className="text-xs text-zinc-500 font-medium">Restart</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <button
                                                onClick={onToggleTimer}
                                                title="Resume Session"
                                                className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all"
                                            >
                                                <Play size={36} fill="currentColor" className="ml-2" />
                                            </button>
                                            <span className="text-xs text-white font-medium">Resume</span>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={onToggleTimer}
                                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 ${isRunning
                                            ? 'bg-zinc-800 text-white border border-zinc-700'
                                            : 'bg-white text-black hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] border border-transparent'
                                            }`}
                                    >
                                        {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-2" />}
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center justify-between w-full max-w-sm bg-zinc-900/50 backdrop-blur-2xl border border-white/10 p-1.5 rounded-full shadow-2xl">
                                <div className="relative group">
                                    <button className={`p-3.5 rounded-full transition-all duration-300 ${activeSoundId !== 'none' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                                        {activeSoundId === 'none' ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                    </button>
                                    <div className="absolute bottom-full left-0 mb-4 w-64 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 z-50">
                                        <div className="text-[10px] font-bold text-zinc-500 px-3 py-2 uppercase tracking-wider mb-1">Focus Sounds</div>
                                        {SOUNDS.map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => onSoundChange(s.id)}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium mb-1 transition-all ${activeSoundId === s.id ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {s.id === 'rain' && <CloudRain size={16} />}
                                                    {s.id === 'forest' && <Trees size={16} />}
                                                    {s.id === 'white' && <Waves size={16} />}
                                                    {s.id === 'none' && <VolumeX size={16} />}
                                                    {s.label}
                                                </div>
                                                {activeSoundId === s.id && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setKeepScreenOn(!keepScreenOn)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 font-bold text-sm ${keepScreenOn
                                        ? 'bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                                        : 'bg-transparent text-zinc-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {keepScreenOn ? <Sun size={18} fill="currentColor" /> : <Moon size={18} />}
                                    <span>{keepScreenOn ? 'Awake' : 'Sleep'}</span>
                                </button>

                                <button
                                    onClick={handleFullscreenToggle}
                                    className="p-3.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    <Maximize size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
});
ActiveSessionTimer.displayName = 'ActiveSessionTimer';

export default ActiveSessionTimer;
