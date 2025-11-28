// Gemini Quiz Generation Service
// Generates structured quizzes from YouTube video content using Google's Gemini API

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a quiz from FreeCodeCamp YouTube video content using Gemini AI
 * @param {string|string[]} videoUrls - YouTube video URL(s) from FreeCodeCamp
 * @param {string} courseTitle - Title of the course
 * @returns {Promise<Object>} Generated quiz data with 5 MCQs
 */
async function generateQuiz(videoUrls, courseTitle) {
    try {
        // Ensure videoUrls is an array
        const urls = Array.isArray(videoUrls) ? videoUrls : [videoUrls];

        // Validate URLs are from FreeCodeCamp
        const isValidFCC = urls.every(url =>
            url.includes('youtube.com') && url.includes('freecodecamp')
        );

        if (!isValidFCC) {
            console.warn('Warning: URLs should be from FreeCodeCamp YouTube channel');
        }

        const prompt = `You are an expert educational assessment creator for the "You Learn" platform, which offers FreeCodeCamp courses.

TASK: Create a comprehensive certification quiz for the following course.

Course: ${courseTitle}

REQUIREMENTS:
1. Generate EXACTLY 5 Multiple Choice Questions (MCQs)
2. Each question must have EXACTLY 4 options (A, B, C, D)
3. Questions should test comprehensive knowledge of ${courseTitle}
4. Cover fundamental concepts, practical applications, and best practices
5. Difficulty should be appropriate for certification (80% passing threshold = 4/5 correct)
6. One and only one option should be correct for each question
7. Questions should be clear, unambiguous, and test real understanding

OUTPUT FORMAT (strict JSON only, no markdown, no explanations):
{
    "questions": [
        {
            "type": "multiple_choice",
            "question": "Clear, specific question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0
        }
    ]
}

IMPORTANT:
- correctAnswer is the index (0-3) of the correct option
- Return ONLY the JSON object, nothing else
- No markdown code blocks, no explanations
- Ensure all JSON is properly formatted with no trailing commas

Generate the quiz now:`;

        // Get the generative model
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
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
        const text = response.text();

        // Extract JSON from response
        let quizData;
        try {
            // Try to parse the entire response as JSON
            quizData = JSON.parse(text);
        } catch (e) {
            // If that fails, try to extract JSON from markdown code blocks
            const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (jsonMatch) {
                try {
                    quizData = JSON.parse(jsonMatch[1]);
                } catch (e2) {
                    // Try cleaning the JSON
                    const cleaned = jsonMatch[1]
                        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
                        .replace(/'/g, '"'); // Replace single quotes with double quotes
                    quizData = JSON.parse(cleaned);
                }
            } else {
                // Try to find JSON object in the text
                const objectMatch = text.match(/\{[\s\S]*"questions"[\s\S]*\}/);
                if (objectMatch) {
                    try {
                        quizData = JSON.parse(objectMatch[0]);
                    } catch (e3) {
                        // Try cleaning the JSON
                        const cleaned = objectMatch[0]
                            .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
                            .replace(/'/g, '"') // Replace single quotes
                            .replace(/\n/g, ' '); // Remove newlines
                        quizData = JSON.parse(cleaned);
                    }
                } else {
                    console.error('Gemini response:', text.substring(0, 500));
                    throw new Error('Could not extract valid JSON from Gemini response');
                }
            }
        }

        // Validate quiz structure
        if (!quizData.questions || !Array.isArray(quizData.questions)) {
            throw new Error('Invalid quiz format: missing questions array');
        }

        if (quizData.questions.length !== 5) {
            throw new Error(`Invalid quiz: expected 5 questions, got ${quizData.questions.length}`);
        }

        // Validate each question
        quizData.questions.forEach((q, index) => {
            if (q.type !== 'multiple_choice') {
                throw new Error(`Question ${index + 1}: must be multiple_choice type`);
            }
            if (!q.question || typeof q.question !== 'string') {
                throw new Error(`Question ${index + 1}: missing or invalid question text`);
            }
            if (!Array.isArray(q.options) || q.options.length !== 4) {
                throw new Error(`Question ${index + 1}: must have exactly 4 options`);
            }
            if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
                throw new Error(`Question ${index + 1}: correctAnswer must be 0-3`);
            }
        });

        console.log(`Successfully generated 5-question quiz for: ${courseTitle}`);
        return quizData;

    } catch (error) {
        console.error('Quiz generation error:', error);
        throw new Error(`Failed to generate quiz: ${error.message}`);
    }
}

/**
 * Score a quiz submission (5 MCQs, 80% passing = 4/5 correct)
 * @param {Object} quizData - The quiz structure with questions
 * @param {Object} userAnswers - User's submitted answers {0: answerIndex, 1: answerIndex, ...}
 * @returns {Object} Scoring result with pass/fail status
 */
function scoreQuiz(quizData, userAnswers) {
    const questions = quizData.questions;
    let correctAnswers = 0;
    const details = [];

    questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        let isCorrect = false;

        // All questions are multiple choice
        if (question.type === 'multiple_choice') {
            isCorrect = userAnswer === question.correctAnswer;
        }

        if (isCorrect) {
            correctAnswers++;
        }

        details.push({
            questionIndex: index,
            correct: isCorrect,
            userAnswer,
            correctAnswer: question.correctAnswer
        });
    });

    const totalQuestions = questions.length; // Should be 5
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= 80; // 80% = 4 out of 5 correct

    return {
        score,
        passed,
        correctAnswers,
        totalQuestions,
        details
    };
}

module.exports = {
    generateQuiz,
    scoreQuiz
};
