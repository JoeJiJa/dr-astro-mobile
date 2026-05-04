
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

const caseBooks = [
    { id: "ent_case_1", title: "Approach to ear case", author: "Dr. Astro", coverColor: "bg-red-600", type: "clinical", downloadUrl: "https://drive.google.com/file/d/1H4Gt71kWBrGc3qVbcI6tApBPp7C8HTZD/view?usp=drive_link" },
    { id: "ent_case_2", title: "Ear anatomy", author: "Dr. Astro", coverColor: "bg-red-600", type: "clinical", downloadUrl: "https://drive.google.com/file/d/1FraqWaUqcG_JkuTqxy_69l6ANN5UAwYJ/view?usp=drive_link" },
    { id: "ent_case_3", title: "ENT 101 Probable Viva Questions", author: "Dr. Astro", coverColor: "bg-red-600", type: "clinical", downloadUrl: "https://drive.google.com/file/d/1G37nT1vgYSicbtqJtinIJW9CfX5iLZJW/view?usp=drive_link" },
    { id: "ent_case_4", title: "ENT Notes", author: "Dr. Astro", coverColor: "bg-red-600", type: "clinical", downloadUrl: "https://drive.google.com/file/d/1Ig3Z6DZ5KAxvW0obVQJi5obCO4BSRtHo/view?usp=drive_link" },
    { id: "ent_case_5", title: "ENT viva questions bank", author: "Dr. Astro", coverColor: "bg-red-600", type: "clinical", downloadUrl: "https://drive.google.com/file/d/1GxZSeziTuUGdt8ZGY8R5QGZunQa5uPVd/view?usp=drive_link" },
    { id: "ent_case_6", title: "Key to ENT Diagnosis", author: "Dr. Astro", coverColor: "bg-red-600", type: "clinical", downloadUrl: "https://drive.google.com/file/d/11VHDpbePECT8-7rbivEHbDJQlivzgkxX/view?usp=drive_link" },
    { id: "ent_case_7", title: "Syndromes and signs in ENT", author: "Dr. Astro", coverColor: "bg-red-600", type: "clinical", downloadUrl: "https://drive.google.com/file/d/1wmzwmUq0-6jckWGPNTnMppLqHvUtZ5if/view?usp=drive_link" },
    { id: "ent_case_8", title: "Theory for major case", author: "Dr. Astro", coverColor: "bg-red-600", type: "clinical", downloadUrl: "https://drive.google.com/file/d/1B5ON4yzhVRDVCbOWceCYXPUlb7vZZcx8/view?usp=drive_link" },
    { id: "ent_case_9", title: "Tonsillitis Viva Questions ENT", author: "Dr. Astro", coverColor: "bg-red-600", type: "clinical", downloadUrl: "https://drive.google.com/file/d/1aINbFmKnUtuVQ1dY1jawlSBjeD6oOv8R/view?usp=drive_link" }
];

const pptBook = {
    id: "ent_ppt_collection",
    title: "ppt",
    author: "Dr. Astro",
    coverColor: "bg-blue-600",
    type: "clinical",
    downloadUrl: "https://drive.google.com/file/d/11cmaT15f7LUX_6kWdagX6WZPVJmB_KWl/view?usp=drive_link",
    parts: [
        { id: "ppt_part_1", title: "Complications of CSOM", downloadUrl: "https://drive.google.com/file/d/11cmaT15f7LUX_6kWdagX6WZPVJmB_KWl/view?usp=drive_link" },
        { id: "ppt_part_2", title: "Ear disease (Symptom oriented approach)", downloadUrl: "https://drive.google.com/file/d/1lsStSi-ZPO_bXWpLmI2HL5gidJ9qm_r2/view?usp=drive_link" },
        { id: "ppt_part_3", title: "ENT ear practical notes", downloadUrl: "https://drive.google.com/file/d/1Cr5R0_DaaadqhqT7KvhP8ej3d2QHe1N2/view?usp=drive_link" },
        { id: "ppt_part_4", title: "nose examination and diagnosis sid", downloadUrl: "https://drive.google.com/file/d/1q449bQBUe-ZioVATs6b3d_oPkx2jeRMp/view?usp=drive_link" },
        { id: "ppt_part_5", title: "nose history sid", downloadUrl: "https://drive.google.com/file/d/1j3rVciTrAlGMofIjc46bAZSwR2VpvrNx/view?usp=drive_link" },
        { id: "ppt_part_6", title: "Symptomatology Of Throat sid", downloadUrl: "https://drive.google.com/file/d/1GZSYVfzViyySDDW5DKqr9pgyTTUIrY4R/view?usp=drive_link" },
        { id: "ppt_part_7", title: "throat examination by dr Rajeswari", downloadUrl: "https://drive.google.com/file/d/1FkceYyyyFikY1QgeXM8KekEiGN9SC67W/view?usp=drive_link" },
        { id: "ppt_part_8", title: "throat history and examination by dr Vikram", downloadUrl: "https://drive.google.com/file/d/1qZZ4bjOZbzHHnWhwn0pdXKS-_hAggmEQ/view?usp=drive_link" }
    ]
};

async function run() {
    const entRef = doc(db, "subjects-v2", "ent");
    const snap = await getDoc(entRef);
    if (!snap.exists()) {
        console.error("ENT subject not found");
        process.exit(1);
    }
    const data = snap.data();
    data.materials = data.materials || {};
    
    // Combine case books and the PPT collection book
    data.materials.caseNotesAndViva = [...caseBooks, pptBook];
    
    await updateDoc(entRef, {
        materials: data.materials
    });
    console.log("ENT subject updated successfully with Case notes & VIVA section and PPT book");
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
