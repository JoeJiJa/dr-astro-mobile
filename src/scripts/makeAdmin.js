
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

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

async function makeAdmin(email) {
    console.log(`Searching for user with email: ${email}...`);
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.log(`User ${email} not found in Firestore.`);
        // Optionally create a placeholder if needed, but usually we just wait for signup.
        // However, the user might have already signed up.
    } else {
        for (const userDoc of snapshot.docs) {
            const userRef = doc(db, 'users', userDoc.id);
            await updateDoc(userRef, { role: 'admin' });
            console.log(`Successfully made ${email} (UID: ${userDoc.id}) an admin!`);
        }
    }
}

makeAdmin('drastrobot@gmail.com').then(() => {
    console.log('Done.');
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
