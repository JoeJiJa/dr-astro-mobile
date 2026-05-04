import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Save, Trash2, BookOpen, Plus } from 'lucide-react';
import { Book, SubjectData } from '../types';

interface BookEditModalProps {
    isOpen: boolean;
    mode: 'add' | 'edit';
    book?: Book;
    currentSubjectId: string;
    currentSectionId: string;
    subjects: Record<string, SubjectData>; // For potential move logic
    onSave: (book: Book, targetSubjectId: string, targetSectionId: string) => void;
    onDelete?: (bookId: string) => void;
    onClose: () => void;
}

const SECTION_LABELS: Record<string, string> = {
    'textbooks': 'Standard Textbooks',
    'generalAnatomy': 'General Anatomy',
    'grossAnatomy': 'Gross Anatomy',
    'anatomyAtlas': 'Anatomy Atlas',
    'histology': 'Histology',
    'embryology': 'Embryology',
    'obstetricsTextbooks': 'Obstetrics Textbooks',
    'gynecologyTextbooks': 'Gynecology Textbooks',
    'clinicalBooks': 'Clinical Manuals',
    'studyMaterials': 'Notes & Mind Maps',
    'questionBank': 'Question Banks',
    'previousYearQuestions': 'Previous Year Questions',
    'practicalMaterials': 'Practical Materials',
};

export const BookEditModal = ({
    isOpen,
    mode,
    book,
    currentSubjectId,
    currentSectionId,
    subjects,
    onSave,
    onDelete,
    onClose
}: BookEditModalProps) => {
    const [formData, setFormData] = useState<Book>({
        id: '',
        title: '',
        author: '',
        coverColor: 'bg-slate-500',
        coverUrl: '',
        type: 'textbook',
        downloadUrl: '',
        description: '',
        driveId: ''
    });

    // Move/Migration State
    const [targetSubjectId, setTargetSubjectId] = useState(currentSubjectId);
    const [targetSectionId, setTargetSectionId] = useState(currentSectionId);

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && book) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setFormData(book);
            } else {
                // Reset for add
                setFormData({
                    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
                    title: '',
                    author: '',
                    coverColor: 'bg-blue-600',
                    coverUrl: '',
                    type: 'textbook',
                    downloadUrl: '',
                    description: '',
                    driveId: ''
                });
            }
            setTargetSubjectId(currentSubjectId);
            setTargetSectionId(currentSectionId);
        }
    }, [isOpen, mode, book, currentSubjectId, currentSectionId]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, targetSubjectId, targetSectionId);
    };

    const isMoving = targetSubjectId !== currentSubjectId || targetSectionId !== currentSectionId;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-zinc-700 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${mode === 'add' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                            {mode === 'add' ? <BookOpen size={20} /> : <Save size={20} />}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                            {mode === 'add' ? 'Add New Book' : 'Edit Book Details'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <X size={20} className="text-zinc-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <form id="book-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* 1. Core Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Book Title</label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="e.g. Gray's Anatomy"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Author / Publisher</label>
                                <input
                                    required
                                    value={formData.author}
                                    onChange={e => setFormData({ ...formData, author: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="e.g. Elsevier"
                                />
                            </div>
                        </div>

                        {/* Recommendation Level Select */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Recommendation Level</label>
                            <select
                                value={formData.recommendationLevel || 'none'}
                                onChange={e => setFormData({ ...formData, recommendationLevel: e.target.value as Book['recommendationLevel'] })}
                                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                            >
                                <option value="none">Standard Resource</option>
                                <option value="gold-standard">Gold Standard Book</option>
                                <option value="preferred">Preferred Book</option>
                                <option value="exam-oriented">Exam Oriented Book</option>
                            </select>
                        </div>

                        {/* 2. Visuals & Links */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Cover Image URL</label>
                            <div className="flex gap-2">
                                <input
                                    value={formData.coverUrl || ''}
                                    onChange={e => setFormData({ ...formData, coverUrl: e.target.value })}
                                    className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                                    placeholder="https://..."
                                />
                                {formData.coverUrl && (
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-zinc-200 shrink-0">
                                        <Image src={formData.coverUrl} fill className="object-cover" alt="Preview" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Master Download Link</label>
                                    {formData.parts && formData.parts.length > 0 && (
                                        <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">Optional if Parts Exist</span>
                                    )}
                                </div>
                                <input
                                    required={!(formData.parts && formData.parts.length > 0)}
                                    value={formData.downloadUrl}
                                    onChange={e => setFormData({ ...formData, downloadUrl: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-blue-600 dark:text-blue-400 font-medium"
                                    placeholder="https://drive.google.com/..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Permanent Drive ID (for Persistence)</label>
                                <input
                                    value={formData.driveId || ''}
                                    onChange={e => setFormData({ ...formData, driveId: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all font-mono text-sm"
                                    placeholder="e.g. 1A2b3C4d5E6f7G..."
                                />
                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tight">Direct ID ensures files remain accessible even if URLs change.</p>
                            </div>
                        </div>

                        {/* Admin Markdown Editor & Calendar Integration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Markdown Description / Syllabus</label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full h-32 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-mono"
                                    placeholder="Add clinical pearls, syllabus notes, or markdown formatted instructions..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Calendar Event Date (Optional)</label>
                                <input
                                    type="datetime-local"
                                    value={formData.calendarEventDate || ''}
                                    onChange={e => setFormData({ ...formData, calendarEventDate: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                                <p className="text-[10px] text-zinc-400 font-medium">Setting a date adds an &apos;Add to Calendar&apos; button for students.</p>
                            </div>
                        </div>

                        {/* 2.5. Multi-Volume Parts */}
                        <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Multi-Volume Parts</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newPart = { 
                                            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11), 
                                            title: `Volume ${(formData.parts?.length || 0) + 1}`, 
                                            downloadUrl: '' 
                                        };
                                        setFormData({ ...formData, parts: [...(formData.parts || []), newPart] });
                                    }}
                                    className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <Plus size={14} strokeWidth={3} /> Add Part
                                </button>
                            </div>
                            
                            {formData.parts && formData.parts.length > 0 && (
                                <div className="space-y-3">
                                    {formData.parts.map((part, index) => (
                                        <div key={part.id} className="flex gap-3 bg-zinc-50 dark:bg-zinc-800/30 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 items-start shadow-sm">
                                            <div className="flex-1 space-y-3">
                                                <input
                                                    required
                                                    value={part.title}
                                                    onChange={e => {
                                                        const newParts = [...formData.parts!];
                                                        newParts[index].title = e.target.value;
                                                        setFormData({ ...formData, parts: newParts });
                                                    }}
                                                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                                    placeholder="Part Title (e.g. Volume 1)"
                                                />
                                                <input
                                                    required
                                                    value={part.downloadUrl}
                                                    onChange={e => {
                                                        const newParts = [...formData.parts!];
                                                        newParts[index].downloadUrl = e.target.value;
                                                        setFormData({ ...formData, parts: newParts });
                                                    }}
                                                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-blue-600 dark:text-blue-400"
                                                    placeholder="Part Download URL"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newParts = formData.parts!.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, parts: newParts.length > 0 ? newParts : undefined });
                                                }}
                                                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-0.5"
                                                title="Remove Part"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 3. Location (Move Logic) */}
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Location</label>
                                {isMoving && <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">RELOCATING</span>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs text-zinc-400 ml-1">Subject</span>
                                    <select
                                        value={targetSubjectId}
                                        onChange={(e) => setTargetSubjectId(e.target.value)}
                                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                                    >
                                        {Object.values(subjects).map(sub => (
                                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-zinc-400 ml-1">Section</span>
                                    <select
                                        value={targetSectionId}
                                        onChange={(e) => setTargetSectionId(e.target.value)}
                                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                                    >
                                        <optgroup label="Standard Sections">
                                            {Object.entries(SECTION_LABELS).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </optgroup>
                                        {/* Dynamic Exam Hub sections from the selected subject */}
                                        {subjects[targetSubjectId]?.examSections && subjects[targetSubjectId].examSections!.length > 0 && (
                                            <optgroup label="📋 Exam Hub Sections">
                                                {subjects[targetSubjectId].examSections!.map(sec => (
                                                    <option key={`exam-${sec.id}`} value={sec.id}>{sec.label}</option>
                                                ))}
                                            </optgroup>
                                        )}
                                        {/* Dynamic Practical Vault sections from the selected subject */}
                                        {subjects[targetSubjectId]?.practicalSections && subjects[targetSubjectId].practicalSections!.filter(s => !SECTION_LABELS[s.id]).length > 0 && (
                                            <optgroup label="🔬 Practical Vault Sections">
                                                {subjects[targetSubjectId].practicalSections!.filter(s => !SECTION_LABELS[s.id]).map(sec => (
                                                    <option key={`prac-${sec.id}`} value={sec.id}>{sec.label}</option>
                                                ))}
                                            </optgroup>
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-md">
                    <div>
                        {mode === 'edit' && onDelete && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('Are you sure? This action cannot be undone.')) {
                                        onDelete(book!.id);
                                    }
                                }}
                                className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            >
                                <Trash2 size={18} /> Delete Book
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            type="button"
                            className="px-6 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            form="book-form"
                            type="submit"
                            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
                        >
                            <Save size={18} />
                            {mode === 'add' ? 'Create Book' : 'Save Changes'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

interface SectionEditModalProps {
    isOpen: boolean;
    mode: 'add' | 'edit';
    section?: { id: string, label: string, description?: string };
    onSave: (label: string, description: string) => void;
    onClose: () => void;
}

export const SectionEditModal = ({
    isOpen,
    mode,
    section,
    onSave,
    onClose
}: SectionEditModalProps) => {
    const [label, setLabel] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && section) {
                setTimeout(() => {
                    setLabel(section.label);
                    setDescription(section.description || '');
                }, 0);
            } else {
                setTimeout(() => {
                    setLabel('');
                    setDescription('');
                }, 0);
            }
        }
    }, [isOpen, mode, section]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(label, description);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-zinc-700 animate-in zoom-in-95 duration-300 flex flex-col">
                <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${mode === 'add' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                            <Plus size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                            {mode === 'add' ? 'Add New Section' : 'Edit Section Details'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full">
                        <X size={20} className="text-zinc-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Section Name</label>
                        <input
                            required
                            value={label}
                            onChange={e => setLabel(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="e.g. Clinical Case Proforma"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Markdown Description / Instructions</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full h-48 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-mono"
                            placeholder="Add clinical pearls, syllabus notes, or markdown formatted instructions for this entire section..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/25 transition-all"
                        >
                            {mode === 'add' ? 'Create Section' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
