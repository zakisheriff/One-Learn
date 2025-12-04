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

        // Note: We do NOT generate the PDF file here anymore.
        // It is generated on-the-fly when requested to support ephemeral hosting (Railway).
        const pdfPath = 'generated-on-demand';

        const now = new Date();

        // Save certificate to database
        const certResult = await db.query(
            `INSERT INTO certificates 
             (user_id, course_id, quiz_attempt_id, recipient_name, course_title, verification_hash, pdf_path, completion_date, issued_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
             RETURNING id, verification_hash, completion_date, issued_at`,
            [userId, courseId, quizAttemptId, user.full_name, course.title, verificationHash, pdfPath, now]
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
 * Create PDF certificate and pipe to stream
 */
async function createCertificatePDF(recipientName, courseTitle, verificationHash, stream) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margins: { top: 0, bottom: 0, left: 0, right: 0 }
            });

            doc.pipe(stream);

            // Colors
            const colors = {
                black: '#000000',
                gold: '#D4AF37', // Metallic Gold
                darkGrey: '#333333',
                white: '#ffffff'
            };

            const width = doc.page.width;
            const height = doc.page.height;

            // --- Background ---
            // Dark background for "Dark Glass" theme with rounded corners
            doc.roundedRect(0, 0, width, height, 40).clip(); // Clip everything to rounded corners
            doc.rect(0, 0, width, height).fill('#0a0a0f'); // Fill background

            // --- Border ---
            // Subtle white border with rounded corners
            const margin = 40;
            doc.roundedRect(margin, margin, width - (margin * 2), height - (margin * 2), 30)
                .lineWidth(1)
                .stroke('#333333');

            // --- Header ---
            doc.moveDown(5);

            // "CERTIFICATE OF COMPLETION"
            doc.font('Helvetica')
                .fontSize(12)
                .fillColor('#aaaaaa') // Light gray
                .text('CERTIFICATE OF COMPLETION', 0, 100, {
                    align: 'center',
                    characterSpacing: 5
                });

            // --- Content ---

            // Recipient Name
            doc.moveDown(3);
            doc.font('Times-Roman')
                .fontSize(48)
                .fillColor('#ffffff') // White
                .text(recipientName, {
                    align: 'center'
                });

            // Separator Line
            const nameBottomY = doc.y;
            const lineLength = 200;
            const lineY = nameBottomY + 5;

            // Gradient-like line (simulated with gray)
            doc.moveTo((width - lineLength) / 2, lineY)
                .lineTo((width + lineLength) / 2, lineY)
                .lineWidth(0.5)
                .strokeColor('#666666')
                .stroke();

            // "For successfully completing the course"
            doc.y = lineY + 20;
            doc.font('Helvetica')
                .fontSize(10)
                .fillColor('#aaaaaa')
                .text('HAS SUCCESSFULLY COMPLETED THE COURSE', {
                    align: 'center',
                    characterSpacing: 2
                });

            // Course Title
            doc.moveDown(1);
            doc.font('Times-Roman')
                .fontSize(32)
                .fillColor('#ffffff')
                .text(courseTitle, {
                    align: 'center'
                });

            // --- Footer ---
            const bottomY = height - 100;

            // Date Section
            const dateLineStart = 100;
            const dateLineEnd = 250;
            const dateLineWidth = dateLineEnd - dateLineStart;

            const completionDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Date Text
            doc.font('Helvetica').fontSize(10).fillColor('#aaaaaa')
                .text(completionDate.toUpperCase(), dateLineStart, bottomY - 15, {
                    width: dateLineWidth,
                    align: 'center',
                    characterSpacing: 1
                });

            // Date Line
            doc.moveTo(dateLineStart, bottomY).lineTo(dateLineEnd, bottomY).lineWidth(0.5).strokeColor('#666666').stroke();

            // Date Label
            doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff')
                .text('DATE', dateLineStart, bottomY + 8, {
                    width: dateLineWidth,
                    align: 'center',
                    characterSpacing: 2
                });


            // Signature Section
            const sigLineEnd = width - 100;
            const sigLineStart = width - 250;
            const sigLineWidth = sigLineEnd - sigLineStart;

            // Signature Text (The One Atom)
            doc.font('Times-Italic').fontSize(24).fillColor('#ffffff')
                .text('The One Atom', sigLineStart, bottomY - 30, {
                    width: sigLineWidth,
                    align: 'center'
                });

            // Signature Line
            doc.moveTo(sigLineStart, bottomY).lineTo(sigLineEnd, bottomY).lineWidth(0.5).strokeColor('#666666').stroke();

            // Signature Label
            doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff')
                .text('SIGNATURE', sigLineStart, bottomY + 8, {
                    width: sigLineWidth,
                    align: 'center',
                    characterSpacing: 2
                });


            // --- Minimal Seal ---
            const sealX = width / 2;
            const sealY = height - 90;

            // Seal Circle
            doc.circle(sealX, sealY, 30).lineWidth(1).stroke('#666666');

            // Seal Text
            doc.font('Helvetica').fontSize(8).fillColor('#ffffff')
                .text('VERIFIED', sealX - 30, sealY - 3, { align: 'center', width: 60, characterSpacing: 1 });


            // --- Verification ID ---
            doc.font('Helvetica').fontSize(6).fillColor('#444444')
                .text(`ID: ${verificationHash}`, 0, height - 20, {
                    align: 'center',
                    characterSpacing: 1
                });

            doc.end();

            // We resolve when the doc is done, the stream handling is up to the caller
            resolve();

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    generateCertificate,
    createCertificatePDF
};
