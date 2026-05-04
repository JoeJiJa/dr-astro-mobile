export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface GlobalTimerState {
    isRunning: boolean;
    timeLeft: number;
    mode: TimerMode;
    subjectId: string | null;
    isAlarmRinging: boolean;
    initialTime: number;
}

export type NavTab = 'dashboard' | 'tasks' | 'notes' | 'stats' | 'leaderboard';

export interface Note {
    id: string;
    text: string;
    createdAt: string;
}

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    createdAt: string;
}

export interface StudySession {
    date: string; // YYYY-MM-DD
    minutes: number;
}

export interface SoundOption {
    id: string;
    label: string;
    url: string;
}

export interface TimerSettings {
    focus: number;
    shortBreak: number;
    longBreak: number;
}

export interface StudyTopic {
    id: string;
    title: string;
    completed: boolean;
    progress: number; // 0 to 100
}

export interface StudySubject {
    id: string;
    title: string;
    color: string;
    totalTime: number; // in minutes
}

export interface SessionLog {
    _id: string;
    userId: string;
    subjectId: string;
    subjectTitle: string;
    durationPlanned: number;
    durationCompleted: number;
    date: string; // ISO string
    timestamp: number;
    status: 'completed' | 'partial';
}
