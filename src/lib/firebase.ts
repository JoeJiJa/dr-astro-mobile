
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
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

export { auth, db, googleProvider, signInWithPopup, sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode };

