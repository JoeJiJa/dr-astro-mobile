
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from 'fs';

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

async function extractAll() {
    const querySnapshot = await getDocs(collection(db, 'subjects-v2'));
    const allSubjects: Record<string, unknown> = {};
    
    querySnapshot.forEach((doc) => {
        allSubjects[doc.id] = doc.data();
    });

    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/07c92556-3154-4a89-896e-04d8b5f5c5cb/all-subjects-lock.json', JSON.stringify(allSubjects, null, 2));
    console.log(`Extracted ${Object.keys(allSubjects).length} subjects successfully to all-subjects-lock.json`);
}

extractAll().catch(console.error);
