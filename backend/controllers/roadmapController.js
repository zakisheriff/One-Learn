const { GoogleGenerativeAI } = require("@google/generative-ai");
const { pool } = require('../database/connection');

// Initialize Gemini API
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

exports.generateRoadmap = async (req, res) => {
    try {
        const { goal } = req.body;

        if (!goal) {
            return res.status(400).json({ error: 'Goal is required' });
        }

        if (!genAI) {
            console.error('Gemini API Key is missing');
            return res.status(503).json({ error: 'Roadmap generation is currently unavailable (API Key missing)' });
        }

        // Use Gemini to generate the roadmap
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        Create a detailed, step-by-step learning roadmap for someone who wants to become a "${goal}".
        Return the response ONLY as a valid JSON object with the following structure:
        {
            "title": "Roadmap Title",
            "description": "Brief description of the path",
            "steps": [
                {
                    "stepNumber": 1,
                    "title": "Step Title (e.g., Learn Python Basics)",
                    "description": "What to learn in this step",
                    "topics": ["Topic 1", "Topic 2", "Topic 3"],
                    "estimatedTime": "2 weeks"
                }
            ]
        }
        Do not include any markdown formatting or extra text. Just the JSON.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up the response if it contains markdown code blocks
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let roadmapData;
        try {
            roadmapData = JSON.parse(jsonStr);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Raw Text:', text);
            return res.status(500).json({ error: 'Failed to parse AI response', details: text });
        }

        res.json({ roadmap: roadmapData });

    } catch (error) {
        console.error('Generate roadmap error:', error);
        res.status(500).json({
            error: 'Failed to generate roadmap',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.saveRoadmap = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.userId; // From auth middleware

        const result = await pool.query(
            `INSERT INTO roadmaps (user_id, title, content)
             VALUES ($1, $2, $3)
             RETURNING id, title, created_at`,
            [userId, title, content]
        );

        res.status(201).json({
            message: 'Roadmap saved successfully',
            roadmap: result.rows[0]
        });

    } catch (error) {
        console.error('Save roadmap error:', error);
        res.status(500).json({ error: 'Failed to save roadmap' });
    }
};

exports.getUserRoadmaps = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT id, title, content, created_at 
             FROM roadmaps 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [userId]
        );

        res.json({ roadmaps: result.rows });

    } catch (error) {
        console.error('Get roadmaps error:', error);
        res.status(500).json({ error: 'Failed to fetch roadmaps' });
    }
};

exports.deleteRoadmap = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        await pool.query(
            `DELETE FROM roadmaps WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        res.json({ message: 'Roadmap deleted successfully' });

    } catch (error) {
        console.error('Delete roadmap error:', error);
        res.status(500).json({ error: 'Failed to delete roadmap' });
    }
};
