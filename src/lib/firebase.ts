import { initializeApp, getApps, getApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    sendPasswordResetEmail,
    confirmPasswordReset,
    verifyPasswordResetCode,
    signInWithCredential
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
        try {
            const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
            if (typeof window !== 'undefined') {
                GoogleAuth.initialize({
                    clientId: '1023563808684-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com',
                    scopes: ['profile', 'email'],
                });
            }
            const googleUser = await GoogleAuth.signIn();
            const idToken = googleUser?.authentication?.idToken;
            if (!idToken) {
                throw new Error("No ID Token received from Google Sign-In.");
            }
            const credential = GoogleAuthProvider.credential(idToken);
            return await signInWithCredential(auth, credential);
        } catch (error: any) {
            console.error("Native Google Sign-In error:", error);
            throw error;
        }
    } else {
        try {
            return await signInWithPopup(auth, googleProvider);
        } catch (error: any) {
            if (error.code === 'auth/popup-blocked' || error.message?.includes('storage') || error.message?.includes('sessionStorage')) {
                throw new Error("Login popup blocked or browser storage is inaccessible. If you are using Brave or Safari, please disable Brave Shields/allow cross-site cookies, or log in with email and password.");
            }
            throw error;
        }
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
