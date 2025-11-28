// Gemini Quiz Generation Service
// Generates structured quizzes from YouTube video content using Google's Gemini API

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a quiz from YouTube video URL(s)
 * @param {string|string[]} videoUrls - Single URL or array of YouTube URLs
 * @param {string} courseTitle - Title of the course (for context)
 * @returns {Promise<Object>} Structured quiz object
 */
async function generateQuiz(videoUrls, courseTitle) {
    try {
        // Ensure videoUrls is an array
        const urls = Array.isArray(videoUrls) ? videoUrls : [videoUrls];

        // Construct the prompt
        const prompt = `You are an expert educational assessment designer. Generate a comprehensive 10-question quiz based on the content from the following YouTube video(s) for the course "${courseTitle}":

${urls.map((url, i) => `${i + 1}. ${url}`).join('\n')}

REQUIREMENTS:
- Create exactly 10 questions total
- Question distribution:
  * 5 Multiple Choice questions (with 4 options each, labeled A, B, C, D)
  * 3 True/False questions
  * 2 Fill-in-the-Blank questions
- Questions should test understanding and application, not just memorization
- Difficulty level: Intermediate
- Questions should cover the main concepts from the video content
- For fill-in-the-blank, use "___" to indicate the blank space

CRITICAL: Return ONLY valid JSON in this EXACT format (no markdown, no code blocks, no additional text):

{
  "questions": [
    {
      "type": "multiple_choice",
      "question": "What is the primary purpose of...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    },
    {
      "type": "true_false",
      "question": "JavaScript is a compiled language.",
      "correctAnswer": false
    },
    {
      "type": "fill_blank",
      "question": "The ___ operator is used to assign values to variables.",
      "correctAnswer": "assignment"
    }
  ]
}

Notes:
- For multiple_choice: correctAnswer is the index (0-3) of the correct option
- For true_false: correctAnswer is a boolean (true or false)
- For fill_blank: correctAnswer is the exact string that fills the blank (case-insensitive matching will be used)

Generate the quiz now:`;

        // Get the generative model
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        });

        // Generate content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up response (remove markdown code blocks if present)
        text = text.trim();
        if (text.startsWith('```json')) {
            text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (text.startsWith('```')) {
            text = text.replace(/```\n?/g, '');
        }

        // Parse JSON
        const quizData = JSON.parse(text);

        // Validate structure
        if (!quizData.questions || !Array.isArray(quizData.questions)) {
            throw new Error('Invalid quiz structure: missing questions array');
        }

        if (quizData.questions.length !== 10) {
            console.warn(`Expected 10 questions, got ${quizData.questions.length}`);
        }

        // Validate each question
        quizData.questions.forEach((q, index) => {
            if (!q.type || !q.question || q.correctAnswer === undefined) {
                throw new Error(`Invalid question at index ${index}: missing required fields`);
            }

            if (q.type === 'multiple_choice') {
                if (!Array.isArray(q.options) || q.options.length !== 4) {
                    throw new Error(`Invalid multiple choice question at index ${index}: must have 4 options`);
                }
                if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
                    throw new Error(`Invalid multiple choice question at index ${index}: correctAnswer must be 0-3`);
                }
            } else if (q.type === 'true_false') {
                if (typeof q.correctAnswer !== 'boolean') {
                    throw new Error(`Invalid true/false question at index ${index}: correctAnswer must be boolean`);
                }
            } else if (q.type === 'fill_blank') {
                if (typeof q.correctAnswer !== 'string' || !q.correctAnswer.trim()) {
                    throw new Error(`Invalid fill-in-blank question at index ${index}: correctAnswer must be non-empty string`);
                }
                if (!q.question.includes('___')) {
                    throw new Error(`Invalid fill-in-blank question at index ${index}: question must contain "___"`);
                }
            } else {
                throw new Error(`Invalid question type at index ${index}: ${q.type}`);
            }
        });

        return quizData;

    } catch (error) {
        console.error('Quiz generation error:', error);

        if (error instanceof SyntaxError) {
            throw new Error('Failed to parse quiz JSON from Gemini API');
        }

        throw error;
    }
}

/**
 * Score a quiz attempt
 * @param {Object} quizData - The original quiz data
 * @param {Object} userAnswers - User's submitted answers { questionIndex: answer }
 * @returns {Object} { score: number, totalQuestions: number, passed: boolean, details: array }
 */
function scoreQuiz(quizData, userAnswers) {
    const questions = quizData.questions;
    let correctCount = 0;
    const details = [];

    questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        let isCorrect = false;

        if (question.type === 'multiple_choice') {
            isCorrect = userAnswer === question.correctAnswer;
        } else if (question.type === 'true_false') {
            isCorrect = userAnswer === question.correctAnswer;
        } else if (question.type === 'fill_blank') {
            // Case-insensitive comparison, trim whitespace
            const correctAnswer = question.correctAnswer.toLowerCase().trim();
            const submittedAnswer = (userAnswer || '').toLowerCase().trim();
            isCorrect = submittedAnswer === correctAnswer;
        }

        if (isCorrect) {
            correctCount++;
        }

        details.push({
            questionIndex: index,
            question: question.question,
            userAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect
        });
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 80; // 80% passing threshold

    return {
        score,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        passed,
        details
    };
}

module.exports = {
    generateQuiz,
    scoreQuiz
};
