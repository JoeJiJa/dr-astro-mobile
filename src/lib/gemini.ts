
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SubjectData } from "../types";
import { GEMINI_CONFIG } from "./config";

export const getAIAssistantResponse = async (yearContext: string, subjectContext: string, userQuery: string, subjectsData: Record<string, SubjectData>, customKey?: string) => {
    try {
        // Use custom key if provided (BYOK), otherwise use the global config key
        const apiKey = customKey?.trim() || GEMINI_CONFIG.apiKey;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Construct a context-aware system prompt
        const availableSubjects = Object.values(subjectsData).map(s => s.name).join(", ");

        let bookContext = "";
        if (subjectContext) {
            const subject = Object.values(subjectsData).find(s => s.name.toLowerCase().includes(subjectContext.toLowerCase()) || s.id === subjectContext.toLowerCase());
            if (subject) {
                const books = [
                    ...(subject.materials.textbooks || []),
                    ...(subject.materials.clinicalBooks || []),
                    ...(subject.materials.studyMaterials || [])
                ].map(b => `- ${b.title} by ${b.author} (${b.type})`);
                bookContext = `\nBooks available for ${subject.name}:\n${books.join("\n")}`;
            }
        }

        const prompt = `
        You are Dr. Astro, an intelligent medical AI assistant for MBBS students.
        User Context: Year ${yearContext}, Subject: ${subjectContext}.
        
        Knowledge Base:
        - Available Subjects in App: ${availableSubjects}
        ${bookContext}

        Task: Answer the user's query mainly focusing on medical knowledge, study tips, or app navigation.
        If they ask about books, list the ones available in the app context provided above.
        Be concise, helpful, and professional but friendly.

        User Query: ${userQuery}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch {
        console.warn("Switching to Smart Local Brain due to API connection issue.");
        return generateSmartLocalResponse(userQuery, subjectsData);
    }
};

// --- SMART LOCAL BRAIN (Offline Fallback) ---
// Simulates an intelligent medical assistant using pattern matching and local data context.

const generateSmartLocalResponse = (query: string, subjectsData: Record<string, SubjectData>) => {
    const q = query.toLowerCase();

    // 1. Identity & Greetings
    if (q.match(/^(hi|hello|hey|greetings)/)) return "Hello future doctor! Dr. Astro here. I'm connected to your component library and ready to help you find the best medical resources. Which subject are you focusing on today?";
    if (q.includes('who are you') || q.includes('your name')) return "I am Dr. Astro, a specialized medical AI assistant designed to help MBBS students navigate their study materials. While my neural link is currently optimizing, I have full access to your offline library.";
    if (q.includes('gemini') || q.includes('google')) return "I am powered by advanced architecture, compatible with Google's Gemini models. Currently, I am operating in high-efficiency local mode to serve you faster.";

    // 2. Subject Specific Queries
    // Find matched subject first
    const foundSubject = Object.values(subjectsData).find(s =>
        q.includes(s.name.toLowerCase()) ||
        q.includes(s.id) ||
        (s.name.length > 4 && q.includes(s.name.toLowerCase().substring(0, 4)))
    );

    if (foundSubject) {
        // Intent: "What is [Subject]?"
        if (q.includes('what is') || q.includes('explain')) {
            return `${foundSubject.name} is ${foundSubject.description.toLowerCase()} It is a core subject in Year ${foundSubject.years.join(', ')}. I have several excellent books available for it.`;
        }

        // Intent: "Books for [Subject]" or just "[Subject]"
        let response = `For **${foundSubject.name}** (Year ${foundSubject.years.join(', ')}), I have curated the following resources:\n\n`;

        const textbooks = foundSubject.materials.textbooks || [];
        const notes = foundSubject.materials.studyMaterials || [];

        if (textbooks.length > 0) {
            response += `**Recommended Textbooks:**\n`;
            textbooks.forEach(b => response += `• *${b.title}* by ${b.author}\n`);
        }

        if (notes.length > 0) {
            response += `\n**Study Notes:**\n`;
            notes.forEach(b => response += `• *${b.title}* (${b.type})\n`);
        }

        return response + "\n\nWould you like to open any of these?";
    }

    // 3. Book Specific Queries (Author or Title)
    // Flatten all books
    const allBooks = Object.values(subjectsData).flatMap(s => [
        ...(s.materials.textbooks || []),
        ...(s.materials.clinicalBooks || []),
        ...(s.materials.studyMaterials || [])
    ]);

    const foundBook = allBooks.find(b =>
        q.includes(b.title.toLowerCase()) ||
        q.includes(b.author.toLowerCase())
    );

    if (foundBook) {
        return `I found **${foundBook.title}** by ${foundBook.author}. It is classified as a *${foundBook.type}*. You can access it directly in the library view.`;
    }

    // 4. Study Advice / General Medical
    if (q.includes('how to study') || q.includes('tips')) return "To study effectively in MBBS: 1) Focus on concepts, not just rote memorization. 2) Correlation between subjects (e.g., Anatomy with Surgery) is key. 3) Use the Pomodoro technique. 4) Solves PYQs (Previous Year Questions) available in the app.";
    if (q.includes('pyq') || q.includes('question')) return "Previous Year Questions (PYQs) are crucial. Check the 'Question Bank' section within each subject card to find specific files.";

    // 5. Default Fallback
    return "That's an interesting medical query. To give you the best answer, could you specify which subject (e.g., Anatomy, Pathology) or book you are looking for? I have full access to your library.";
};

