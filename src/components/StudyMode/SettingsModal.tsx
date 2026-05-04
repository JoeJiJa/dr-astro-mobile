import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TimerSettings } from './types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: TimerSettings;
    onSave: (settings: TimerSettings) => void;
}

export const SettingsModal = React.memo(({ isOpen, onClose, settings, onSave }: SettingsModalProps) => {
    const [local, setLocal] = useState(settings);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setLocal(settings), 0);
        }
    }, [isOpen, settings]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#18181b] p-8 rounded-3xl w-full max-w-md border border-zinc-800 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white font-display">Timer Settings</h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={24} /></button>
                </div>
                <div className="space-y-6 mb-8">
                    {(['focus', 'shortBreak', 'longBreak'] as const).map(m => (
                        <div key={m} className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{m.replace(/([A-Z])/g, ' $1')}</label>
                            <div className="flex items-center gap-6">
                                <input
                                    type="range" min="1" max="60"
                                    value={local[m]}
                                    onChange={e => setLocal({ ...local, [m]: parseInt(e.target.value) })}
                                    className="flex-1 accent-blue-600 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer"
                                />
                                <span className="text-white font-mono font-bold w-12 text-right">{local[m]}m</span>
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => { onSave(local); onClose(); }}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
});
SettingsModal.displayName = 'SettingsModal';

export default SettingsModal;
