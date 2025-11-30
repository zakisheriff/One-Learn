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

        // Fetch available courses from database to recommend
        let availableCourses = [];
        try {
            const coursesResult = await pool.query(
                `SELECT title, slug, category, description 
                 FROM courses 
                 WHERE is_published = true
                 ORDER BY category, title 
                 LIMIT 100`
            );
            availableCourses = coursesResult.rows;
            console.log(`Fetched ${availableCourses.length} courses for roadmap recommendations`);
        } catch (dbError) {
            console.warn('Could not fetch courses for recommendations:', dbError.message);
            // Continue without courses if DB query fails
        }

        // Format courses for AI prompt
        const coursesContext = availableCourses.length > 0
            ? `\n\nAVAILABLE COURSES ON OUR PLATFORM:\n${availableCourses.map(c =>
                `- "${c.title}" (Category: ${c.category})`
            ).join('\n')}\n\nWhen recommending courses, ONLY suggest courses from this list that are relevant to the profession. Match course titles exactly as shown above.`
            : '\n\nNote: Recommend that users can find relevant courses on the platform to study and earn certificates.';

        // Use Gemini to generate the roadmap
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        You are an expert career advisor. The user wants to become a "${goal}". Generate a complete, realistic, and actionable roadmap for this profession.
        ${coursesContext}
        
        PROFESSION OVERVIEW:
        - Provide a brief description of the role
        - Explain why this profession is important
        - List typical responsibilities
        
        Return the response ONLY as a valid JSON object with the following structure:
        {
            "title": "Roadmap to become a ${goal}",
            "description": "Brief description of the role, why it's important, and typical responsibilities (2-3 sentences)",
            "steps": [
                {
                    "stepNumber": 1,
                    "title": "Foundation & Education",
                    "description": "Recommended degrees, certifications, or formal education. Include optional but helpful courses or subjects. Be specific about degree names and certifications.",
                    "topics": ["Bachelor's in [Field]", "Certification Name", "Optional: Course Subject"],
                    "estimatedTime": "1-4 years",
                    "recommendedCourses": []
                },
                {
                    "stepNumber": 2,
                    "title": "Beginner Skills (0-6 months)",
                    "description": "Core concepts, foundational skills, and tools to get started. Focus on what absolute beginners need to learn first.",
                    "topics": ["Fundamental Concept 1", "Basic Tool/Technology", "Core Skill", "Getting Started Resource"],
                    "estimatedTime": "3-6 months",
                    "recommendedCourses": ["Exact course title from available courses list"]
                },
                {
                    "stepNumber": 3,
                    "title": "Intermediate Skills (6-18 months)",
                    "description": "Advanced skills, frameworks, and small projects to build competency. Include specific technologies and project types.",
                    "topics": ["Framework/Library Name", "Advanced Concept", "Project: Build a [Type]", "Tool/Platform"],
                    "estimatedTime": "6-12 months",
                    "recommendedCourses": ["Exact course title from available courses list"]
                },
                {
                    "stepNumber": 4,
                    "title": "Advanced/Professional Skills (18+ months)",
                    "description": "Specializations, real-world projects, portfolio-building, and professional-level skills. Include industry-standard practices.",
                    "topics": ["Specialization Area", "Complex Project Type", "Portfolio: Create [X]", "Professional Tool"],
                    "estimatedTime": "12+ months",
                    "recommendedCourses": ["Exact course title from available courses list"]
                },
                {
                    "stepNumber": 5,
                    "title": "Practical Experience & Projects",
                    "description": "Hands-on projects, internships, open-source contributions, competitions, or freelance opportunities. Be specific about project ideas.",
                    "topics": ["Project Idea: Build [Specific Thing]", "Contribute to [Type] Open Source", "Apply for [Type] Internship", "Participate in [Competition/Hackathon]"],
                    "estimatedTime": "Ongoing throughout journey",
                    "recommendedCourses": []
                },
                {
                    "stepNumber": 6,
                    "title": "Career Progression & Milestones",
                    "description": "Entry-level → mid-level → senior-level → expert. Include typical salary ranges (in USD), career milestones, and what to expect at each level.",
                    "topics": ["Entry: [Job Title] ($XX-XX,XXX/year)", "Mid: [Job Title] ($XX-XX,XXX/year)", "Senior: [Job Title] ($XXX,XXX+/year)", "Expert: [Specialization/Leadership Role]"],
                    "estimatedTime": "5-10+ years career progression",
                    "recommendedCourses": []
                },
                {
                    "stepNumber": 7,
                    "title": "Challenges & How to Overcome Them",
                    "description": "Common obstacles people face in this career and practical tips to overcome them. Be honest and helpful.",
                    "topics": ["Challenge: [Specific Obstacle]", "Tip: [Practical Solution]", "Challenge: [Another Obstacle]", "Tip: [Another Solution]"],
                    "estimatedTime": "Ongoing awareness",
                    "recommendedCourses": []
                },
                {
                    "stepNumber": 8,
                    "title": "Specializations & Emerging Trends",
                    "description": "Sub-fields, niche roles, or future trends in this profession. Help users understand where the field is heading.",
                    "topics": ["Specialization: [Niche Area 1]", "Specialization: [Niche Area 2]", "Emerging Trend: [Future Technology/Practice]", "Growing Field: [New Opportunity]"],
                    "estimatedTime": "Explore based on interest",
                    "recommendedCourses": ["Exact course title from available courses list if relevant"]
                }
            ]
        }
        
        IMPORTANT GUIDELINES FOR COURSE RECOMMENDATIONS:
        - ONLY recommend courses from the "AVAILABLE COURSES ON OUR PLATFORM" list provided above
        - Match course titles EXACTLY as they appear in the list
        - Recommend 1-3 relevant courses per step where applicable
        - DO NOT recommend courses for Step 1 (Foundation & Education) - formal degrees cannot be replaced by online courses
        - ONLY recommend courses for skill-building steps (Steps 2, 3, 4, and 8 if relevant)
        - If no relevant courses are available for a step, use an empty array []
        - Prioritize courses that match the skill level (Beginner for early steps, Intermediate/Advanced for later steps)
        - Users can study these courses and earn certificates upon completion
        
        OTHER GUIDELINES:
        - Be honest and realistic about timelines, challenges, and salary expectations
        - Mention specific tools, technologies, frameworks, and platforms relevant to this profession
        - Include both technical skills AND soft skills (communication, teamwork, problem-solving, etc.)
        - Make it beginner-friendly with clear, actionable steps
        - Focus on practical, real-world skills that employers actually look for
        - Emphasize that learning pace varies per individual - these are guidelines, not strict rules
        - Include specific project ideas that can be added to a portfolio
        
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

        // Create a mapping of course titles to slugs for the frontend
        const courseMap = {};
        availableCourses.forEach(course => {
            courseMap[course.title] = course.slug;
        });

        res.json({
            roadmap: roadmapData,
            courseMap: courseMap  // Send course title -> slug mapping
        });

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
