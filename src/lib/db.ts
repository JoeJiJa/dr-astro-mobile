import { db as firestoreDb } from './firebase';
import { collection, doc, getDocs, setDoc, addDoc, query, limit } from 'firebase/firestore';
import { SubjectData, AdminAuditLog } from '../types';

/**
 * Centered Database Service that ensures MongoDB Atlas is the source of truth,
 * while mirroring writes to Firebase Firestore for instant real-time client broadcasting.
 */
export const DbService = {
    /**
     * Fetch all subjects.
     * Starts by hitting MongoDB Atlas API, and falls back to Firestore if offline/client-only.
     */
    fetchSubjects: async (): Promise<Record<string, SubjectData> | null> => {
        try {
            const res = await fetch('/api/subjects');
            if (res.ok) {
                const data = await res.json();
                if (data && Object.keys(data).length > 0) {
                    return data;
                }
            }
        } catch (err) {
            console.warn('[DbService] Fetch subjects from MongoDB API failed, falling back to Firestore:', err);
        }

        // Firestore Fallback
        try {
            const querySnap = await getDocs(collection(firestoreDb, 'subjects-v2'));
            if (querySnap.empty) return null;
            const cloudData: Record<string, SubjectData> = {};
            querySnap.forEach(docSnap => {
                cloudData[docSnap.id] = docSnap.data() as SubjectData;
            });
            return cloudData;
        } catch (err) {
            console.error('[DbService] Firestore fallback failed:', err);
            return null;
        }
    },

    /**
     * Save subject data to MongoDB Atlas and mirror to Firestore.
     */
    saveSubject: async (subjectId: string, subject: SubjectData): Promise<boolean> => {
        let savedToMongo = false;
        
        // 1. Commit to MongoDB Atlas
        try {
            const res = await fetch('/api/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subjectId, subject })
            });
            if (res.ok) {
                savedToMongo = true;
            } else {
                console.error('[DbService] Failed to write subject to MongoDB API:', await res.text());
            }
        } catch (err) {
            console.warn('[DbService] Write to MongoDB API failed, syncing with Firestore only:', err);
        }

        // 2. Mirror to Firestore for instant real-time sync / broadcast
        try {
            await setDoc(doc(firestoreDb, 'subjects-v2', subjectId), subject);
        } catch (err) {
            console.error('[DbService] Firestore write failed:', err);
            if (!savedToMongo) throw err; // Throw if both databases failed
        }

        return savedToMongo;
    },

    /**
     * Fetch the admin audit logs (History).
     */
    fetchAuditLogs: async (): Promise<AdminAuditLog[]> => {
        try {
            const res = await fetch('/api/admin/audit-logs');
            if (res.ok) {
                const data = await res.json();
                return data as AdminAuditLog[];
            }
        } catch (err) {
            console.warn('[DbService] Fetch audit logs from MongoDB API failed, falling back to Firestore:', err);
        }

        // Firestore Fallback
        try {
            const auditCol = collection(firestoreDb, 'admin-audit');
            const q = query(auditCol, limit(100));
            const querySnap = await getDocs(q);
            const logs: AdminAuditLog[] = [];
            querySnap.forEach(docSnap => {
                logs.push({ id: docSnap.id, ...docSnap.data() } as AdminAuditLog);
            });
            logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            return logs;
        } catch (err) {
            console.error('[DbService] Firestore fetch audit logs failed:', err);
            return [];
        }
    },

    /**
     * Save a new audit log.
     */
    writeAuditLog: async (log: AdminAuditLog): Promise<boolean> => {
        let savedToMongo = false;

        // 1. Commit to MongoDB Atlas
        try {
            const res = await fetch('/api/admin/audit-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(log)
            });
            if (res.ok) {
                savedToMongo = true;
            }
        } catch (err) {
            console.warn('[DbService] Write audit log to MongoDB API failed:', err);
        }

        // 2. Mirror to Firestore
        try {
            await addDoc(collection(firestoreDb, 'admin-audit'), log);
        } catch (err) {
            console.error('[DbService] Firestore write audit log failed:', err);
            if (!savedToMongo) throw err;
        }

        return savedToMongo;
    }
};
