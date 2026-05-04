export const CLINICAL_CASES = [
    // SURGERY CASES
    {
        "id": "surg_001",
        "subject": "Surgery",
        "case": "A 45-year-old female presents with right upper quadrant pain radiating to the right shoulder, exacerbated by fatty meals. She reports accompanying nausea and vomiting. Physical examination reveals a positive Murphy's sign and tenderness in the right upper quadrant. Laboratory results show mildly elevated alkaline phosphatase.",
        "options": [
            "Acute Appendicitis",
            "Acute Cholecystitis",
            "Acute Pancreatitis",
            "Peptic Ulcer Disease"
        ],
        "correctIndex": 1,
        "explanation": "The clinical presentation of RUQ pain radiating to the right shoulder (Boas' sign), aggravated by fatty meals, along with a positive Murphy's sign, is classic for Acute Cholecystitis. The elevated alkaline phosphatase suggests possible biliary involvement."
    },
    {
        "id": "surg_002",
        "subject": "Surgery",
        "case": "A 25-year-old male is brought to the ER after a motor vehicle accident. He is hypotensive (BP 80/50 mmHg) and tachycardic (HR 120 bpm). Physical exam reveals bruising over the left flank (Grey Turner's sign) and left upper quadrant tenderness. FAST scan is positive for fluid in the splenorenal recess.",
        "options": [
            "Liver Laceration",
            "Splenic Rupture",
            "Renal Contusion",
            "Mesenteric Ischemia"
        ],
        "correctIndex": 1,
        "explanation": "Hypotension + Tachycardia + LUQ tenderness + Positive FAST in splenorenal recess + Trauma history strongly suggests Splenic Rupture. Grey Turner's sign can indicate retroperitoneal hemorrhage."
    },
    {
        "id": "surg_003",
        "subject": "Surgery",
        "case": "A 60-year-old male with a history of smoking presents with painless gross hematuria. He reports a 5kg weight loss over the last 2 months. Urinalysis confirms hematuria with no casts. CT scan reveals a solid mass in the right kidney.",
        "options": [
            "Renal Cell Carcinoma",
            "Bladder Cancer",
            "Prostate Cancer",
            "Nephrolithiasis"
        ],
        "correctIndex": 0,
        "explanation": "Painless hematuria + Weight loss + Smoking history + Renal mass is the classic triad (though rare to see all 3) for Renal Cell Carcinoma (RCC)."
    },

    // GENERAL MEDICINE CASES
    {
        "id": "med_001",
        "subject": "General Medicine",
        "case": "A 30-year-old female presents with fatigue, cold intolerance, and weight gain despite decreased appetite. Physical exam reveals dry skin, bradycardia, and delayed relaxation of deep tendon reflexes. TSH is elevated (15 mIU/L) and Free T4 is low.",
        "options": [
            "Graves' Disease",
            "Hashimoto's Thyroiditis",
            "Subacute Thyroiditis",
            "Euthyroid Sick Syndrome"
        ],
        "correctIndex": 1,
        "explanation": "The symptoms (hypothyroidism) combined with elevated TSH and low T4 point to primary hypothyroidism. Hashimoto's Thyroiditis is the most common cause in this demographic."
    },
    {
        "id": "med_002",
        "subject": "General Medicine",
        "case": "A 65-year-old male with COPD presents with worsening dyspnea and increased sputum production. Arterial Blood Gas (ABG) shows pH 7.32, PaCO2 60 mmHg, PaO2 55 mmHg, HCO3 30 mEq/L.",
        "options": [
            "Acute Respiratory Acidosis",
            "Acute on Chronic Respiratory Acidosis",
            "Metabolic Alkalosis",
            "Respiratory Alkalosis"
        ],
        "correctIndex": 1,
        "explanation": "The pH is acidotic (<7.35) and PaCO2 is high (Respiratory Acidosis). The HCO3 is elevated (>26), indicating renal compensation which takes days, suggesting a chronic underlying retention (COPD). The pH being low signifies an acute exacerbation. Hence, Acute on Chronic."
    },
    {
        "id": "med_003",
        "subject": "General Medicine",
        "case": "A 55-year-old male presents with crushing substernal chest pain radiating to the jaw, diaphoresis, and nausea for 2 hours. ECG shows ST-segment elevation in leads II, III, and aVF.",
        "options": [
            "Anterior Wall MI",
            "Inferior Wall MI",
            "Lateral Wall MI",
            "Posterior Wall MI"
        ],
        "correctIndex": 1,
        "explanation": "ST elevation in leads II, III, and aVF is diagnostic for an Inferior Wall Myocardial Infarction, typically involving the Right Coronary Artery (RCA)."
    },

    // PEDIATRICS CASES
    {
        "id": "ped_001",
        "subject": "Pediatrics",
        "case": "A 2-year-old boy presents with barking cough, stridor, and hoarseness, which worsens at night. X-ray of the neck shows the 'Steeple sign'. The child appears non-toxic.",
        "options": [
            "Epiglottitis",
            "Croup (Laryngotracheobronchitis)",
            "Foreign Body Aspiration",
            "Retropharyngeal Abscess"
        ],
        "correctIndex": 1,
        "explanation": "Barking cough + Stridor + Steeple sign on X-ray + Non-toxic appearance is the classic presentation of Croup, usually caused by Parainfluenza virus."
    },
    {
        "id": "ped_002",
        "subject": "Pediatrics",
        "case": "A 5-year-old girl is brought with high fever for 5 days, bilateral conjunctivitis without exudate, strawberry tongue, cracked lips, and swollen hands. Cervical lymphadenopathy is noted.",
        "options": [
            "Scarlet Fever",
            "Kawasaki Disease",
            "Measles",
            "Stevens-Johnson Syndrome"
        ],
        "correctIndex": 1,
        "explanation": "These are the diagnostic criteria (CRASH and Burn) for Kawasaki Disease. It is crucial to diagnose early to prevent coronary artery aneurysms."
    },
    {
        "id": "ped_003",
        "subject": "Pediatrics",
        "case": "A newborn, born at 28 weeks gestation, develops respiratory distress shortly after birth. Chest X-ray reveals a reticulogranular pattern with air bronchograms. The infant requires surfactant therapy.",
        "options": [
            "Transient Tachypnea of Newborn",
            "Meconium Aspiration Syndrome",
            "Respiratory Distress Syndrome (RDS)",
            "Congenital Diaphragmatic Hernia"
        ],
        "correctIndex": 2,
        "explanation": "Prematurity + Respiratory Distress + Ground glass (reticulogranular) appearance on CXR is characteristic of RDS (Hyaline Membrane Disease) due to surfactant deficiency."
    },
    // ENT CASES
    {
        "id": "ent_001",
        "subject": "ENT",
        "case": "A 45-year-old male presents with right-sided hearing loss and tinnitus. He also reports occasional dizziness. Audiometry reveals asymmetric sensorineural hearing loss. MRI shows a mass in the right cerebellopontine angle.",
        "options": [
            "Meniere's Disease",
            "Vestibular Schwannoma",
            "Labyrinthitis",
            "Presbycusis"
        ],
        "correctIndex": 1,
        "explanation": "Asymmetric sensorineural hearing loss + Tinnitus + CPA angle mass on MRI is highly suggestive of Vestibular Schwannoma (Acoustic Neuroma)."
    },
    {
        "id": "ent_002",
        "subject": "ENT",
        "case": "A 5-year-old boy presents with severe throat pain, difficulty swallowing, and high fever. He is sitting forward and drooling. Lateral neck X-ray shows the 'Thumb sign'.",
        "options": [
            "Acute Tonsillitis",
            "Epiglottitis",
            "Croup",
            "Peritonsillar Abscess"
        ],
        "correctIndex": 1,
        "explanation": "High fever + Drooling + Tripod position + Thumb sign on X-ray is a medical emergency indicating Acute Epiglottitis."
    },
    {
        "id": "ent_003",
        "subject": "ENT",
        "case": "A 25-year-old female presents with recurrent episodes of vertigo lasting 2-4 hours, accompanied by fluctuating hearing loss and a sense of aural fullness in the right ear.",
        "options": [
            "BPPV",
            "Meniere's Disease",
            "Vestibular Neuritis",
            "Migraine-associated Vertigo"
        ],
        "correctIndex": 1,
        "explanation": "The tetrad of Episodic Vertigo + Fluctuating Sensorineural Hearing Loss + Tinnitus + Aural Fullness characterizes Meniere's Disease."
    }
];
