
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Your web app's Firebase configuration
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
const db = getFirestore(app);

// Enable Offline Persistence for a truly "Stable" version
if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.");
        } else if (err.code === 'unimplemented') {
            console.warn("The current browser does not support all of the features required to enable persistence.");
        }
    });
}

const googleProvider = new GoogleAuthProvider();

// Detect if running inside a Capacitor native app (Android/iOS WebView)
const isNativeApp = (): boolean => {
    if (typeof window === 'undefined') return false;
    // Capacitor injects this object into the WebView
    return !!(window as any).Capacitor?.isNativePlatform?.();
};

/**
 * Smart Google Sign-In that works in both browser and Capacitor WebView.
 * - Browser: uses signInWithPopup (fast, no redirect)
 * - Capacitor WebView: uses signInWithRedirect (popups are blocked in WebViews)
 */
const signInWithGoogle = async () => {
    if (isNativeApp()) {
        // In native app, redirect-based flow works reliably
        await signInWithRedirect(auth, googleProvider);
        // After redirect, getRedirectResult will be called on page reload
        return null; // Result will come from getRedirectResult on next load
    } else {
        // In browser, popup is the best experience
        return signInWithPopup(auth, googleProvider);
    }
};

export { auth, db, googleProvider, signInWithPopup, signInWithGoogle, signInWithRedirect, getRedirectResult, sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode, isNativeApp };

