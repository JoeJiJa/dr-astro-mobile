import React, { useState } from 'react';

interface SimpleInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (val: string) => void;
    title: string;
    placeholder: string;
}

export const SimpleInputModal = React.memo(({ isOpen, onClose, onSubmit, title, placeholder }: SimpleInputModalProps) => {
    const [val, setVal] = useState('');
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#18181b] p-6 rounded-2xl w-full max-w-sm border border-zinc-800 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
                <input
                    autoFocus
                    value={val}
                    onChange={e => setVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && val.trim() && (onSubmit(val), setVal(''), onClose())}
                    placeholder={placeholder}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500 mb-6"
                />
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 text-zinc-500 font-bold hover:text-zinc-300">Cancel</button>
                    <button
                        onClick={() => { if (val.trim()) { onSubmit(val); setVal(''); onClose(); } }}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
});
SimpleInputModal.displayName = 'SimpleInputModal';

export default SimpleInputModal;
