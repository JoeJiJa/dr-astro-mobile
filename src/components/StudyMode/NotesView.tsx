import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Note } from './types';

interface NotesViewProps {
    newNote: string;
    setNewNote: (val: string) => void;
    handleAddNote: () => void;
    notes: Note[];
    handleDeleteNote: (id: string) => void;
}

const NotesView: React.FC<NotesViewProps> = ({
    newNote,
    setNewNote,
    handleAddNote,
    notes,
    handleDeleteNote
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
        >
            <h2 className="text-2xl font-bold text-white">Quick Notes</h2>

            <div className="bg-[#18181b] p-4 rounded-2xl border border-zinc-800">
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Jot down an idea..."
                    className="w-full bg-transparent text-white resize-none outline-none min-h-[100px] placeholder:text-zinc-600"
                />
                <div className="flex justify-end mt-2">
                    <button
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save Note
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {notes.map(note => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={note.id}
                            className="bg-[#121212] p-5 rounded-2xl border border-zinc-800/50 group relative"
                        >
                            <p className="text-zinc-300 whitespace-pre-wrap">{note.text}</p>
                            <div className="mt-4 text-xs text-zinc-600 font-mono">
                                {new Date(note.createdAt).toLocaleDateString()} • {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="absolute top-4 right-4 p-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {notes.length === 0 && (
                    <div className="col-span-full text-center text-zinc-600 py-12 italic">
                        No notes yet. Start typing above!
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default NotesView;
