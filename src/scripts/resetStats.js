
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

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

async function resetAllUsers() {
    console.log('Fetching all users...');
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);

    const count = snapshot.size;
    console.log(`Found ${count} users. Starting reset...`);

    let processed = 0;
    for (const userDoc of snapshot.docs) {
        const userData = userDoc.data();
        const userRef = doc(db, 'users', userDoc.id);

        const updates = {
            studyHistory: [],
            studySessions: [],
            studyTasks: [] // Also resetting tasks as they are often treated as stats/progress
        };

        // Reset time for each subject
        if (userData.studySubjects && Array.isArray(userData.studySubjects)) {
            updates.studySubjects = userData.studySubjects.map(s => ({
                ...s,
                totalTime: 0
            }));
        }

        try {
            await updateDoc(userRef, updates);
            processed++;
            console.log(`[${processed}/${count}] Reset data for user: ${userDoc.id}`);
        } catch (err) {
            console.error(`Failed to reset user ${userDoc.id}:`, err);
        }
    }

    console.log('Global statistics reset complete!');
    process.exit(0);
}

resetAllUsers().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
