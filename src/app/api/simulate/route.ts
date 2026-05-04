import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(request: Request) {
  try {
    const { subject, bookTitle } = await request.json();

    if (!GEMINI_API_KEY) {
      // Mocked fallback for demonstration if key is missing
      return NextResponse.json({
        vignette: `[DEMO MODE] A 62-year-old patient presents with symptoms related to ${subject || 'Medicine'}${bookTitle ? ` according to ${bookTitle}` : ''}. They describe a 2-week history of progressive fatigue and dyspnea on exertion. Physical exam reveals a systolic murmur.`,
        options: ["Aortic Stenosis", "Mitral Regurgitation", "Pulmonary Embolism", "Anxiety Disorder"],
        answer: 0,
        explanation: "The combination of progressive dyspnea and a systolic murmur in an elderly patient highly suggests Aortic Stenosis.",
        pearl: "Aortic Stenosis classic triad: Syncope, Angina, and Dyspnea (SAD)."
      });
    }

    const prompt = `
      You are a senior medical board examiner. 
      Generate a challenging clinical vignette for a medical student based on the following context:
      Subject: ${subject || 'General Medicine'}
      Context/Book: ${bookTitle || 'Standard Medical Curriculum'}

      The output MUST be a valid JSON object with the following structure:
      {
        "vignette": "Detailed case history including patient age, gender, symptoms, physical exam findings, and relevant lab values.",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": 0, (index of the correct option 0-3)
        "explanation": "Brief explanation of why the answer is correct and why others are wrong.",
        "pearl": "A single sentence high-yield medical pearl related to this case."
      }

      Return ONLY the JSON. No markdown formatting.
    `;

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
        }
      })
    });

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) throw new Error('Failed to generate simulation');

    return NextResponse.json(JSON.parse(resultText));
  } catch (error) {
    console.error('Simulation Error:', error);
    return NextResponse.json({ error: 'Failed to synthesize clinical scenario' }, { status: 500 });
  }
}
