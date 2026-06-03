import { initializeApp, getApps, getApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    sendPasswordResetEmail,
    confirmPasswordReset,
    verifyPasswordResetCode
} from "firebase/auth";
import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
    getFirestore
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDkL97giZawPNhSnl8oKJiSIzS7_pgnkZA",
    authDomain: "drastroapp.firebaseapp.com",
    projectId: "drastroapp",
    storageBucket: "drastroapp.firebasestorage.app",
    messagingSenderId: "1023563808684",
    appId: "1:1023563808684:web:9966b5c366fcbad03b4409"
};

// Initialize Firebase (Singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Initialize Firestore with modern persistent cache (replaces deprecated enableIndexedDbPersistence)
// This ensures books and data survive browser refreshes and app restarts
let db: ReturnType<typeof getFirestore>;
if (typeof window !== 'undefined') {
    try {
        db = initializeFirestore(app, {
            localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager()
            })
        });
    } catch {
        // Already initialized (singleton guard)
        db = getFirestore(app);
    }
} else {
    db = getFirestore(app);
}

const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Detect if running inside a Capacitor native app (Android/iOS WebView)
const isNativeApp = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!(window as any).Capacitor?.isNativePlatform?.();
};

/**
 * Smart Google Sign-In that works in both browser and Capacitor WebView.
 * - Browser: uses signInWithPopup (fast, no redirect)
 * - Capacitor WebView: uses signInWithRedirect (popups are blocked in WebViews)
 */
const signInWithGoogle = async () => {
    if (isNativeApp()) {
        await signInWithRedirect(auth, googleProvider);
        return null;
    } else {
        return signInWithPopup(auth, googleProvider);
    }
};

export {
    auth,
    db,
    storage,
    googleProvider,
    signInWithPopup,
    signInWithGoogle,
    signInWithRedirect,
    getRedirectResult,
    sendPasswordResetEmail,
    confirmPasswordReset,
    verifyPasswordResetCode,
    isNativeApp
};
