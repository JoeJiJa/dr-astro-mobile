import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";

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
    console.log("Fetching subjects from subjects-v2 collection...");
    const subjectsCol = collection(db, 'subjects-v2');
    const querySnap = await getDocs(subjectsCol);
    
    if (querySnap.empty) {
        console.log("No subjects found.");
        process.exit(0);
    }
    
    const batchPromises: Promise<void>[] = [];
    
    querySnap.forEach(docSnap => {
        const data = docSnap.data();
        console.log(`Wiping examSections for subject: ${docSnap.id}`);
        // Clear exam sections
        data.examSections = [];
        // Note: we're leaving the materials object as is, but since the examSections array
        // is what drives the UI in the Exam Hub, those sections will disappear.
        // We could also clear the materials keys for those sections if needed, but 
        // resetting examSections is enough to "blank" the page as requested.
        const ref = doc(db, 'subjects-v2', docSnap.id);
        batchPromises.push(setDoc(ref, data));
    });
    
    await Promise.all(batchPromises);
    console.log(`Successfully wiped Exam Hub content for ${batchPromises.length} subjects.`);
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
