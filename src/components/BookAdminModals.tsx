import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Save, Trash2, BookOpen, Plus } from 'lucide-react';
import { Book, SubjectData } from '../types';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_CUSTOM_DOMAIN } from '../lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';

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

    const [bookFile, setBookFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [urlCheckResult, setUrlCheckResult] = useState<{
        status: 'idle' | 'checking' | 'valid' | 'invalid';
        message?: string;
    }>({ status: 'idle' });

    const checkUrlReachability = async (url: string) => {
        if (!url) {
            setUrlCheckResult({ status: 'idle' });
            return;
        }
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            setUrlCheckResult({ status: 'invalid', message: 'Must start with http:// or https://' });
            return;
        }
        setUrlCheckResult({ status: 'checking' });
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout
            
            await fetch(url, {
                mode: 'no-cors',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            setUrlCheckResult({ status: 'valid', message: 'Reachable (Pinger verified)' });
        } catch (err: any) {
            if (err.name === 'AbortError') {
                setUrlCheckResult({ status: 'invalid', message: 'Verification timed out (6s)' });
            } else {
                setUrlCheckResult({ status: 'invalid', message: 'Network offline or invalid host' });
            }
        }
    };

    const isDuplicateTitle = React.useMemo(() => {
        if (!formData.title) return false;
        const currentBooks = (subjects[targetSubjectId]?.materials?.[targetSectionId] || []) as Book[];
        return currentBooks.some(b => b.id !== formData.id && b.title.trim().toLowerCase() === formData.title.trim().toLowerCase());
    }, [formData.title, formData.id, targetSubjectId, targetSectionId, subjects]);

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
            setBookFile(null);
            setCoverFile(null);
            setUrlCheckResult({ status: 'idle' });
            setLoading(false);
            setTargetSubjectId(currentSubjectId);
            setTargetSectionId(currentSectionId);
        }
    }, [isOpen, mode, book, currentSubjectId, currentSectionId]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let finalDownloadUrl = formData.downloadUrl;
            if (bookFile) {
                const uniqueObjectKey = `library_books/${Date.now()}_${bookFile.name}`;
                const fileArrayBuffer = await bookFile.arrayBuffer();
                
                const uploadCommand = new PutObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: uniqueObjectKey,
                    Body: new Uint8Array(fileArrayBuffer),
                    ContentType: bookFile.type,
                });
                
                await r2Client.send(uploadCommand);
                finalDownloadUrl = `https://${R2_PUBLIC_CUSTOM_DOMAIN}/${uniqueObjectKey}`;
            }

            let finalCoverUrl = formData.coverUrl;
            if (coverFile) {
                const uniqueObjectKey = `library_covers/${Date.now()}_${coverFile.name}`;
                const fileArrayBuffer = await coverFile.arrayBuffer();
                
                const uploadCommand = new PutObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: uniqueObjectKey,
                    Body: new Uint8Array(fileArrayBuffer),
                    ContentType: coverFile.type,
                });
                
                await r2Client.send(uploadCommand);
                finalCoverUrl = `https://${R2_PUBLIC_CUSTOM_DOMAIN}/${uniqueObjectKey}`;
            }

            const updatedBook = {
                ...formData,
                downloadUrl: finalDownloadUrl,
                coverUrl: finalCoverUrl
            };

            await onSave(updatedBook, targetSubjectId, targetSectionId);
            setBookFile(null);
            setCoverFile(null);
        } catch (err) {
            console.error("Cloud transactional write failure: ", err);
            alert("Failed to upload file or save book metadata.");
        } finally {
            setLoading(false);
        }
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
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                                {mode === 'add' ? 'Add New Book' : 'Edit Book Details'}
                            </h2>
                            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-0.5">
                                Subject: <span className="text-blue-500">{subjects[currentSubjectId]?.name}</span> • Section: <span className="text-red-500">{SECTION_LABELS[targetSectionId] || targetSectionId}</span>
                            </span>
                        </div>
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
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Book Title</label>
                                    {isDuplicateTitle && (
                                        <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400 animate-pulse uppercase tracking-wider">⚠️ Duplicate Title</span>
                                    )}
                                </div>
                                <input
                                    required
                                    disabled={loading}
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                                    placeholder="e.g. Gray's Anatomy"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Author / Publisher</label>
                                <input
                                    required
                                    disabled={loading}
                                    value={formData.author}
                                    onChange={e => setFormData({ ...formData, author: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                                    placeholder="e.g. Elsevier"
                                />
                            </div>
                        </div>

                        {/* Recommendation Level Select */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Recommendation Level</label>
                            <select
                                disabled={loading}
                                value={formData.recommendationLevel || 'none'}
                                onChange={e => setFormData({ ...formData, recommendationLevel: e.target.value as Book['recommendationLevel'] })}
                                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium disabled:opacity-50"
                            >
                                <option value="none">Standard Resource</option>
                                <option value="gold-standard">Gold Standard Book</option>
                                <option value="preferred">Preferred Book</option>
                                <option value="exam-oriented">Exam Oriented Book</option>
                            </select>
                        </div>

                         {/* 2. Visuals & Links */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Cover Image URL</label>
                                <div className="flex gap-2">
                                    <input
                                        disabled={loading}
                                        value={formData.coverUrl || ''}
                                        onChange={e => setFormData({ ...formData, coverUrl: e.target.value })}
                                        className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm disabled:opacity-50"
                                        placeholder="https://..."
                                    />
                                    {formData.coverUrl && (
                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-zinc-200 shrink-0">
                                            <Image src={formData.coverUrl} fill className="object-cover" alt="Preview" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex justify-between items-center">
                                    <span>Upload Cover Image File</span>
                                    {coverFile && <span className="text-[10px] font-bold text-green-500">READY</span>}
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => {
                                        if (e.target.files && e.target.files[0]) {
                                            setCoverFile(e.target.files[0]);
                                        }
                                    }}
                                    disabled={loading}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs font-medium cursor-pointer file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-600 file:text-white file:hover:bg-blue-700 disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex justify-between items-center">
                                    <span>Upload Book File (PDF/Image)</span>
                                    {bookFile && <span className="text-[10px] font-bold text-green-500">READY</span>}
                                </label>
                                <input
                                    type="file"
                                    onChange={e => {
                                        if (e.target.files && e.target.files[0]) {
                                            setBookFile(e.target.files[0]);
                                        }
                                    }}
                                    disabled={loading}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs font-medium cursor-pointer file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-600 file:text-white file:hover:bg-blue-700 disabled:opacity-50"
                                />
                            </div>
                             <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                        <span>Or Paste Download URL</span>
                                        {urlCheckResult.status === 'checking' && (
                                            <span className="text-[10px] text-zinc-400 animate-pulse font-semibold">Checking...</span>
                                        )}
                                        {urlCheckResult.status === 'valid' && (
                                            <span className="text-[10px] text-emerald-500 font-bold">✓ {urlCheckResult.message}</span>
                                        )}
                                        {urlCheckResult.status === 'invalid' && (
                                            <span className="text-[10px] text-red-500 font-bold">✗ {urlCheckResult.message}</span>
                                        )}
                                    </label>
                                    {formData.parts && formData.parts.length > 0 && (
                                        <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">Optional if Parts Exist</span>
                                    )}
                                </div>
                                <input
                                    required={!bookFile && !(formData.parts && formData.parts.length > 0)}
                                    value={formData.downloadUrl}
                                    onChange={e => {
                                        setFormData({ ...formData, downloadUrl: e.target.value });
                                        if (urlCheckResult.status !== 'idle') {
                                            setUrlCheckResult({ status: 'idle' });
                                        }
                                    }}
                                    onBlur={e => checkUrlReachability(e.target.value)}
                                    disabled={loading}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-blue-600 dark:text-blue-400 font-medium disabled:opacity-50"
                                    placeholder="https://drive.google.com/..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Permanent Drive ID (for Persistence)</label>
                                <input
                                    disabled={loading}
                                    value={formData.driveId || ''}
                                    onChange={e => setFormData({ ...formData, driveId: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all font-mono text-sm disabled:opacity-50"
                                    placeholder="e.g. 1A2b3C4d5E6f7G..."
                                />
                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tight">Direct ID ensures files remain accessible even if URLs change.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Calendar Event Date (Optional)</label>
                                <input
                                    type="datetime-local"
                                    disabled={loading}
                                    value={formData.calendarEventDate || ''}
                                    onChange={e => setFormData({ ...formData, calendarEventDate: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                                />
                                <p className="text-[10px] text-zinc-400 font-medium">Setting a date adds an &apos;Add to Calendar&apos; button for students.</p>
                            </div>
                        </div>

                        {/* Admin Markdown Editor */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Markdown Description / Syllabus</label>
                            <textarea
                                disabled={loading}
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full h-32 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-mono disabled:opacity-50"
                                placeholder="Add clinical pearls, syllabus notes, or markdown formatted instructions..."
                            />
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
                                disabled={loading}
                                onClick={() => {
                                    if (confirm('Are you sure? This action cannot be undone.')) {
                                        onDelete(book!.id);
                                    }
                                }}
                                className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                            >
                                <Trash2 size={18} /> Delete Book
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            type="button"
                            disabled={loading}
                            className="px-6 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            form="book-form"
                            type="submit"
                            disabled={loading}
                            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save size={18} />
                            {loading ? 'Saving...' : (mode === 'add' ? 'Create Book' : 'Save Changes')}
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
