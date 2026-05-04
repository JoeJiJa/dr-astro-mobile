export interface AICase {
  id: string;
  q: string;
  options: string[];
  answer: string;
  explanation: string;
  system: string;
}

export const AI_CASES: AICase[] = [
    {
        q: "A 45-year-old female presents with recurrent epigastric pain that improves with food. Urea breath test is positive.",
        options: [
            "Peptic Ulcer Disease",
            "GERD",
            "Gastritis"
        ],
        answer: "Peptic Ulcer Disease",
        explanation: "Epigastric pain improved by food suggests a Duodenal Ulcer (part of PUD). The positive Urea Breath Test confirms H. pylori infection, the primary cause.",
        system: "Gastrointestinal",
        id: "AI-101"
    },
    {
        q: "A 28-year-old male presents with sudden onset of 'worst headache of my life'. CT shows hyperdensity in the subarachnoid space.",
        options: [
            "Subarachnoid Hemorrhage",
            "Migraine",
            "Cluster Headache"
        ],
        answer: "Subarachnoid Hemorrhage",
        explanation: "The 'thunderclap' headache and CT evidence of hyperdensity in the cisterns are pathognomonic for Subarachnoid Hemorrhage, often due to a ruptured berry aneurysm.",
        system: "Neurology",
        id: "AI-102"
    },
    {
        q: "A 62-year-old male smoker has a 2-month history of hemoptysis and weight loss. Chest X-ray shows a hilar mass.",
        options: [
            "Bronchogenic Carcinoma",
            "Tuberculosis",
            "Sarcoidosis"
        ],
        answer: "Bronchogenic Carcinoma",
        explanation: "In a chronic smoker, hemoptysis, weight loss, and a hilar mass on X-ray highly suggest Bronchogenic Carcinoma (Lung Cancer) until proven otherwise.",
        system: "Pulmonology",
        id: "AI-103"
    },
    {
        q: "An 8-year-old child presents with periorbital edema and cola-colored urine following a throat infection 2 weeks ago.",
        options: [
            "Post-streptococcal Glomerulonephritis",
            "Nephrotic Syndrome",
            "UTI"
        ],
        answer: "Post-streptococcal Glomerulonephritis",
        explanation: "The triad of edema, hematuria (cola-colored urine), and a preceding streptococcal throat infection suggests PSGN, a Type III hypersensitivity reaction.",
        system: "Pediatrics/Nephrology",
        id: "AI-104"
    },
    {
        q: "A 55-year-old female presents with morning stiffness in her fingers lasting over an hour, improved with activity.",
        options: [
            "Rheumatoid Arthritis",
            "Osteoarthritis",
            "Psoriatic Arthritis"
        ],
        answer: "Rheumatoid Arthritis",
        explanation: "Symmetrical morning stiffness lasting >1 hour that improves with use is the hallmark of inflammatory arthritis like Rheumatoid Arthritis.",
        system: "Rheumatology",
        id: "AI-105"
    },
    {
        q: "A 35-year-old pregnant woman in her 32nd week presents with BP 160/110 mmHg and proteinuria.",
        options: [
            "Preeclampsia",
            "Gestational Hypertension",
            "Eclampsia"
        ],
        answer: "Preeclampsia",
        explanation: "New-onset hypertension (≥140/90) and proteinuria after 20 weeks of gestation defines Preeclampsia. BP ≥160/110 indicates severe features.",
        system: "Obstetrics",
        id: "AI-106"
    },
    {
        q: "A 50-year-old heavy drinker presents with hematemesis and spider angiomata on physical examination.",
        options: [
            "Esophageal Varices",
            "Mallory-Weiss Tear",
            "Gastric Ulcer"
        ],
        answer: "Esophageal Varices",
        explanation: "In a patient with signs of portal hypertension (spider angiomata, history of alcohol), hematemesis is most likely due to ruptured Esophageal Varices.",
        system: "Gastrointestinal",
        id: "AI-107"
    },
    {
        q: "A 22-year-old athlete collapsed during practice. Echo shows asymmetrical septal hypertrophy.",
        options: [
            "Hypertrophic Cardiomyopathy",
            "Dilated Cardiomyopathy",
            "Myocarditis"
        ],
        answer: "Hypertrophic Cardiomyopathy",
        explanation: "Asymmetrical septal hypertrophy on echo in a young athlete who collapses is characteristic of HCM, the most common cause of sudden cardiac death in young people.",
        system: "Cardiology",
        id: "AI-108"
    },
    {
        q: "A 40-year-old male presents with excruciating pain and swelling in his big toe after a seafood dinner.",
        options: [
            "Gouty Arthritis",
            "Pseudogout",
            "Septic Arthritis"
        ],
        answer: "Gouty Arthritis",
        explanation: "Urate crystal deposition (Gout) commonly presents as Podagra (first MTP joint involvement), often triggered by high-purine foods like seafood.",
        system: "Rheumatology",
        id: "AI-109"
    },
    {
        q: "A 12-year-old boy presents with polyuria, polydipsia, and unexplained weight loss. Random blood glucose is 350 mg/dL.",
        options: [
            "Type 1 Diabetes",
            "Type 2 Diabetes",
            "Diabetes Insipidus"
        ],
        answer: "Type 1 Diabetes",
        explanation: "The classic '3 Ps' (Polyuria, Polydipsia, weight loss) and severe hyperglycemia in a child are classic for new-onset Type 1 Diabetes Mellitus.",
        system: "Endocrinology",
        id: "AI-110"
    }
];
