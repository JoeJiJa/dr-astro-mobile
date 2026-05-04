
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDkL97giZawPNhSnl8oKJiSIzS7_pgnkZA",
    authDomain: "drastroapp.firebaseapp.com",
    projectId: "drastroapp",
    storageBucket: "drastroapp.firebasestorage.app",
    messagingSenderId: "1023563808684",
    appId: "1:1023563808684:web:9966b5c366fcbad03b4409"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const entRef = doc(db, "subjects-v2", "ent");
    const snap = await getDoc(entRef);
    if (!snap.exists()) {
        console.error("ENT subject not found");
        process.exit(1);
    }
    
    const sections = [
        { id: "clinicalBooks", label: "Clinical Books" },
        { id: "caseNotesAndViva", label: "Case notes & VIVA" }
    ];
    
    await updateDoc(entRef, {
        practicalSections: sections
    });
    console.log("ENT practical sections updated successfully");
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
