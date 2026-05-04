
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
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

async function extract() {
    const docRef = doc(db, 'subjects-v2', 'general-medicine');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/07c92556-3154-4a89-896e-04d8b5f5c5cb/general-medicine-lock.json', JSON.stringify(data, null, 2));
        console.log("Data extracted successfully to general-medicine-lock.json");
    } else {
        console.log("No such document!");
    }
}

extract().catch(console.error);
