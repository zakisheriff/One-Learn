// You Learn LMS - Express Server
// Main server file with security configurations and route mounting

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Security Middleware =====

// Helmet for security headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable for development, configure for production
}));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ===== Body Parsing =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ===== Request Logging (Development) =====
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Import route handlers
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const quizRoutes = require('./routes/quizRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin', adminRoutes);

// Certificate verification (public)
app.get('/api/verify', async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Verification ID is required' });
        }

        const { pool } = require('./database/connection');

        const result = await pool.query(
            `SELECT c.recipient_name, c.course_title, c.completion_date, c.issued_at
             FROM certificates c
             WHERE c.verification_hash = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Certificate not found',
                message: 'This verification ID does not match any certificate in our system.'
            });
        }

        const cert = result.rows[0];

        res.json({
            valid: true,
            certificate: {
                recipientName: cert.recipient_name,
                courseTitle: cert.course_title,
                completionDate: cert.completion_date,
                issuedAt: cert.issued_at,
                organization: 'You Learn'
            }
        });

    } catch (error) {
        console.error('Certificate verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// ===== Error Handling =====

// Health check with DB status
app.get('/health', async (req, res) => {
    try {
        const { pool } = require('./database/connection');
        const dbResult = await pool.query('SELECT NOW()');

        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            database: {
                connected: true,
                time: dbResult.rows[0].now
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            database: {
                connected: false,
                error: error.message
            }
        });
    }
});

// ===== Static Files (Production) =====
if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    // Serve static files from frontend build
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    // Handle client-side routing
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    });
} else {
    // 404 handler for API routes in dev
    app.use((req, res) => {
        res.status(404).json({
            error: 'Not found',
            message: `Route ${req.method} ${req.path} not found`
        });
    });
}

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);

    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ===== Server Startup =====

// Test database connection before starting server
const { pool } = require('./database/connection');

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Failed to connect to database:', err);
        process.exit(1);
    }

    console.log('✓ Database connection verified');

    // Start server
    app.listen(PORT, () => {
        console.log(`\n🚀 You Learn API Server`);
        console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`   Port: ${PORT}`);
        console.log(`   URL: http://localhost:${PORT}`);
        console.log(`   Frontend: ${process.env.FRONTEND_URL}\n`);
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    pool.end(() => {
        console.log('Database pool closed');
        process.exit(0);
    });
});

module.exports = app; // For testing
