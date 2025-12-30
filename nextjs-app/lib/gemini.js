// Gemini AI service for quiz generation
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateQuiz(courseTitle, lessonTitles) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `Generate a comprehensive quiz for the course "${courseTitle}".
The course covers the following topics: ${lessonTitles.join(', ')}.

Create 10 multiple-choice questions that test understanding of the key concepts.
Each question should have 4 options with only one correct answer.

Return ONLY a valid JSON array in this exact format (no markdown, no explanations):
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]

The correctAnswer should be the index (0-3) of the correct option.
Make the questions challenging but fair. Cover different difficulty levels.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up response - remove markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Parse the JSON
        const questions = JSON.parse(text);

        // Validate the structure
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error('Invalid quiz format received from AI');
        }

        return questions;

    } catch (error) {
        console.error('Gemini quiz generation error:', error);
        throw new Error(`Failed to generate quiz: ${error.message}`);
    }
}

export default { generateQuiz };
