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
const { YoutubeTranscript } = require('youtube-transcript');

/**
 * Generate a quiz from YouTube video content using Gemini AI
 * @param {string|string[]} videoUrls - YouTube video URL(s)
 * @param {string} courseTitle - Title of the course
 * @returns {Promise<Object>} Generated quiz data with 5 MCQs
 */
async function generateQuiz(videoUrls, courseTitle) {
    try {
        // Ensure videoUrls is an array
        const urls = Array.isArray(videoUrls) ? videoUrls : [videoUrls];
        const videoUrl = urls[0]; // Use the first video for now

        console.log(`Generating quiz for: ${courseTitle} (${videoUrl})`);

        // Fetch Transcript
        let transcriptText = '';
        try {
            const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
            transcriptText = transcript.map(t => t.text).join(' ');
            // Limit transcript length to avoid token limits (approx 15k chars)
            if (transcriptText.length > 15000) {
                transcriptText = transcriptText.substring(0, 15000) + '...';
            }
            console.log('Successfully fetched transcript.');
        } catch (err) {
            console.warn('Failed to fetch transcript, falling back to title/metadata:', err.message);
            transcriptText = `Transcript not available. Generate questions based on the course title: "${courseTitle}" and general knowledge about this topic.`;
        }

        const prompt = `You are an expert educational assessment creator for the "You Learn" platform.

TASK: Create a comprehensive certification quiz based on the following video content.

VIDEO CONTEXT:
Title: ${courseTitle}
Transcript/Content: "${transcriptText}"

REQUIREMENTS:
1. Generate EXACTLY 10 Multiple Choice Questions (MCQs)
2. Each question must have EXACTLY 4 options (A, B, C, D)
3. Questions must be STRICTLY based on the provided transcript/content. Do not ask generic questions.
4. Focus on specific details, facts, and concepts mentioned in the video.
5. DIFFICULTY: EXTREME. These must be the hardest possible questions derived from the content.
6. One and only one option should be correct for each question
7. Questions should be clear, unambiguous, and test deep understanding of this specific video.

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
            model: 'gemini-flash-latest', // Use available model from list
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
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

        if (quizData.questions.length !== 10) {
            console.warn(`Warning: Expected 10 questions, got ${quizData.questions.length}. Proceeding anyway.`);
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

        console.log(`Successfully generated ${quizData.questions.length}-question quiz for: ${courseTitle}`);
        return quizData;

    } catch (error) {
        console.error('Quiz generation error:', error);
        // Fallback to basic quiz if generation fails
        return {
            questions: Array(10).fill(null).map((_, i) => ({
                type: 'multiple_choice',
                question: `Question ${i + 1}: What is a key concept from ${courseTitle}?`,
                options: ['Concept A', 'Concept B', 'Concept C', 'Concept D'],
                correctAnswer: 0
            }))
        };
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
