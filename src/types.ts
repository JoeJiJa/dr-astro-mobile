export type ViewState = 'HOME' | 'THEORY' | 'SUBJECT_DETAIL' | 'EXAM_PREP' | 'QUIZ' | 'STUDY_MODE' | 'PROFILE' | 'EXAM_SUBJECT_DETAIL' | 'PRACTICAL_SUBJECT_DETAIL' | 'NEURAL_LAB';

export type Subject = {
    id: string;
    name: string;
    description: string;
    icon: string;
    years: number[];
    color: string;
};

export type BookPart = {
    id: string;
    title: string;
    downloadUrl: string;
};

export type Book = {
    id: string;
    title: string;
    author: string;
    coverColor: string;
    coverUrl?: string;
    type: 'textbook' | 'clinical' | 'notes' | 'question-bank';
    downloadUrl: string;
    parts?: BookPart[];
    recommendationLevel?: 'gold-standard' | 'preferred' | 'exam-oriented' | 'none'; // Replaces isHighYield
    description?: string; // Admin Markdown Editor field
    calendarEventDate?: string; // Calendar Integration
    driveId?: string; // Permanent Google Drive ID
};

export type PracticalSection = {
    id: string;
    label: string;
    description?: string; // Admin Markdown Editor field for sections
};

export type SubjectData = Subject & {
    materials: {
        textbooks: Book[];
        // Anatomy Specific
        generalAnatomy?: Book[];
        grossAnatomy?: Book[];
        anatomyAtlas?: Book[];
        histology?: Book[];
        embryology?: Book[];
        // OBG Specific
        obstetricsTextbooks?: Book[];
        gynecologyTextbooks?: Book[];
        clinicalBooks: Book[];
        studyMaterials: Book[];
        questionBank?: Book[];
        previousYearQuestions?: Book[];
        practicalMaterials?: Book[];
        osce?: Book[];
        viva?: Book[];
        "case-notes"?: Book[];
        "case-proforma"?: Book[];
        cases?: Book[];
        [key: string]: Book[] | undefined;
    };
    practicalSections?: PracticalSection[];
    examSections?: PracticalSection[];
};

export type QuizQuestion = {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
};

export type ChatMessage = {
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
};

export type AppUser = {
    id: string;
    name: string;
    email: string;
    password?: string; // In real app, never store plain text
    phone?: string;
    college?: string;
    batchYear?: string;
    gender?: 'male' | 'female';
    avatarUrl?: string; // New field for profile picture
    yearOfStudy?: string;
    role: 'admin' | 'user';
    joinedAt: string;
    lastLoginAt?: string;
    lastActiveAt?: string;
    status?: 'active' | 'inactive' | 'dead'; // 'dead' as requested for long-term inactivity
    recentlyViewed?: string[]; // Array of book IDs
    favorites?: string[]; // Array of pinned book IDs for "My Study Shelf"
    streak?: number; // Gamification streak
    totalXP?: number; // Gamification XP
};

export type UserActivity = {
    id?: string;
    userId: string;
    userName: string;
    action: 'view_book' | 'view_subject' | 'start_quiz' | 'login' | 'download_book' | 'simulation_complete' | 'start_simulation';
    targetId: string;
    targetName: string;
    timestamp: string;
};
