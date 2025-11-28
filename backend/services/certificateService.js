// Certificate Generation Service
// Creates PDF certificates and manages verification hashes

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pool = require('../database/connection').pool;

// Ensure certificate directory exists
const CERT_DIR = process.env.CERTIFICATE_DIR || path.join(__dirname, '../certificates');
if (!fs.existsSync(CERT_DIR)) {
    fs.mkdirSync(CERT_DIR, { recursive: true });
}

/**
 * Generate a certificate for a user who passed a course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {string} quizAttemptId - Quiz attempt ID
 * @param {object} client - PostgreSQL client (for transaction)
 * @returns {object} Certificate data
 */
async function generateCertificate(userId, courseId, quizAttemptId, client) {
    try {
        // Use provided client or get from pool
        const db = client || pool;

        // Get user info
        const userResult = await db.query(
            'SELECT full_name, email FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            throw new Error('User not found');
        }

        const user = userResult.rows[0];

        // Get course info
        const courseResult = await db.query(
            'SELECT title FROM courses WHERE id = $1',
            [courseId]
        );

        if (courseResult.rows.length === 0) {
            throw new Error('Course not found');
        }

        const course = courseResult.rows[0];

        // Check if certificate already exists
        const existingCert = await db.query(
            'SELECT id, verification_hash FROM certificates WHERE user_id = $1 AND course_id = $2',
            [userId, courseId]
        );

        if (existingCert.rows.length > 0) {
            // Return existing certificate
            return {
                id: existingCert.rows[0].id,
                verificationHash: existingCert.rows[0].verification_hash
            };
        }

        // Generate unique verification hash
        const verificationHash = crypto
            .createHash('sha256')
            .update(`${userId}-${courseId}-${Date.now()}-${Math.random()}`)
            .digest('hex');

        // Create PDF
        const pdfPath = path.join(CERT_DIR, `${verificationHash}.pdf`);
        await createCertificatePDF(user.full_name, course.title, verificationHash, pdfPath);

        // Save certificate to database
        const certResult = await db.query(
            `INSERT INTO certificates 
             (user_id, course_id, quiz_attempt_id, recipient_name, course_title, verification_hash, pdf_path)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, verification_hash, completion_date, issued_at`,
            [userId, courseId, quizAttemptId, user.full_name, course.title, verificationHash, pdfPath]
        );

        const certificate = certResult.rows[0];

        return {
            id: certificate.id,
            verificationHash: certificate.verification_hash,
            completionDate: certificate.completion_date,
            issuedAt: certificate.issued_at,
            recipientName: user.full_name,
            courseTitle: course.title
        };

    } catch (error) {
        console.error('Certificate generation error:', error);
        throw error;
    }
}

/**
 * Create PDF certificate
 */
async function createCertificatePDF(recipientName, courseTitle, verificationHash, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // Certificate border
            doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
                .lineWidth(2)
                .stroke('#0071e3');

            // Inner border
            doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
                .lineWidth(1)
                .stroke('#d2d2d7');

            // Title
            doc.fontSize(48)
                .font('Helvetica-Bold')
                .fillColor('#1d1d1f')
                .text('Certificate of Completion', 0, 100, {
                    align: 'center',
                    width: doc.page.width
                });

            // Decorative line
            doc.moveTo(doc.page.width / 2 - 100, 170)
                .lineTo(doc.page.width / 2 + 100, 170)
                .lineWidth(2)
                .stroke('#0071e3');

            // "This is to certify that"
            doc.fontSize(16)
                .font('Helvetica')
                .fillColor('#6e6e73')
                .text('This is to certify that', 0, 200, {
                    align: 'center',
                    width: doc.page.width
                });

            // Recipient name
            doc.fontSize(36)
                .font('Helvetica-Bold')
                .fillColor('#1d1d1f')
                .text(recipientName, 0, 240, {
                    align: 'center',
                    width: doc.page.width
                });

            // "has successfully completed"
            doc.fontSize(16)
                .font('Helvetica')
                .fillColor('#6e6e73')
                .text('has successfully completed', 0, 300, {
                    align: 'center',
                    width: doc.page.width
                });

            // Course title
            doc.fontSize(24)
                .font('Helvetica-Bold')
                .fillColor('#0071e3')
                .text(courseTitle, 0, 340, {
                    align: 'center',
                    width: doc.page.width
                });

            // Organization
            doc.fontSize(14)
                .font('Helvetica')
                .fillColor('#6e6e73')
                .text('Issued by You Learn', 0, 400, {
                    align: 'center',
                    width: doc.page.width
                });

            // Date
            const completionDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            doc.fontSize(12)
                .text(`Date of Completion: ${completionDate}`, 0, 440, {
                    align: 'center',
                    width: doc.page.width
                });

            // Verification info
            doc.fontSize(10)
                .fillColor('#86868b')
                .text(`Verification ID: ${verificationHash}`, 0, doc.page.height - 100, {
                    align: 'center',
                    width: doc.page.width
                });

            doc.text(`Verify at: ${process.env.FRONTEND_URL || 'https://youlearn.com'}/verify?id=${verificationHash}`, 0, doc.page.height - 80, {
                align: 'center',
                width: doc.page.width
            });

            // Digital signature placeholder
            doc.fontSize(10)
                .fillColor('#1d1d1f')
                .text('Digitally Signed', doc.page.width - 200, doc.page.height - 120);

            doc.moveTo(doc.page.width - 250, doc.page.height - 130)
                .lineTo(doc.page.width - 100, doc.page.height - 130)
                .stroke('#1d1d1f');

            doc.end();

            stream.on('finish', () => {
                resolve(outputPath);
            });

            stream.on('error', (error) => {
                reject(error);
            });

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    generateCertificate
};
