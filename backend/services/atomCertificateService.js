// Atom Certificate Service
// Generates certificates for Atom Path tracks

const PDFDocument = require('pdfkit');
const crypto = require('crypto');
const pool = require('../database/connection').pool;

/**
 * Generate a certificate for a user who completed an Atom Path track
 */
async function generateAtomCertificate(userId, trackId, client) {
    try {
        const db = client || pool;

        // Get user info
        const userResult = await db.query(
            'SELECT full_name, email FROM users WHERE id = $1',
            [userId]
        );
        if (userResult.rows.length === 0) throw new Error('User not found');
        const user = userResult.rows[0];

        // Get track info
        const trackResult = await db.query(
            'SELECT title FROM atom_tracks WHERE id = $1',
            [trackId]
        );
        if (trackResult.rows.length === 0) throw new Error('Track not found');
        const track = trackResult.rows[0];

        // Check for existing certificate
        // We need a table for atom certificates or reuse the existing one with a different schema?
        // The existing `certificates` table has `course_id`. We can add `track_id` or use a new table.
        // Let's check the schema again. `atom_schema.sql` didn't define a certificate table.
        // We should probably add `atom_certificates` table or modify `certificates`.
        // For minimal friction, let's create a new table `atom_certificates` in this service's context if it doesn't exist,
        // OR just assume we added it.
        // Wait, I didn't add it in Phase 1. I need to add it now.

        // Let's create `atom_certificates` table dynamically or assume I'll run a migration.
        // I'll create a migration script for it in a moment.

        // Check if certificate exists
        const existingCert = await db.query(
            'SELECT * FROM atom_certificates WHERE user_id = $1 AND track_id = $2',
            [userId, trackId]
        );

        if (existingCert.rows.length > 0) {
            const cert = existingCert.rows[0];
            return {
                id: cert.id,
                verificationHash: cert.verification_hash,
                completionDate: cert.completion_date,
                issuedAt: cert.issued_at,
                recipientName: cert.recipient_name,
                trackTitle: cert.track_title,
                courseTitle: cert.track_title, // Alias for frontend compatibility
                verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?id=${cert.verification_hash}`
            };
        }

        // Generate hash
        const verificationHash = crypto
            .createHash('sha256')
            .update(`ATOM-${userId}-${trackId}-${Date.now()}`)
            .digest('hex');

        const now = new Date();

        // Insert
        const certResult = await db.query(
            `INSERT INTO atom_certificates 
             (user_id, track_id, recipient_name, track_title, verification_hash, completion_date, issued_at)
             VALUES ($1, $2, $3, $4, $5, $6, $6)
             RETURNING id, verification_hash, completion_date, issued_at`,
            [userId, trackId, user.full_name, track.title, verificationHash, now]
        );

        const certificate = certResult.rows[0];

        return {
            id: certificate.id,
            verificationHash: certificate.verification_hash,
            completionDate: certificate.completion_date,
            issuedAt: certificate.issued_at,
            recipientName: user.full_name,
            trackTitle: track.title
        };

    } catch (error) {
        console.error('Atom certificate generation error:', error);
        throw error;
    }
}

/**
 * Create PDF Stream
 */
async function createAtomCertificatePDF(recipientName, trackTitle, verificationHash, stream) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margins: { top: 0, bottom: 0, left: 0, right: 0 }
            });

            doc.pipe(stream);

            const width = doc.page.width;
            const height = doc.page.height;
            const centerX = width / 2;

            // --- 1. Background (Rounded Black Card - Full Bleed) ---
            const cornerRadius = 40;
            doc.roundedRect(0, 0, width, height, cornerRadius).fill('#000000');

            // --- Define Metallic Gold Gradient ---
            // A complex gradient to simulate light reflection (Dark -> Light -> Dark)
            const goldGradient = doc.linearGradient(0, 0, width, height);
            goldGradient.stop(0, '#BF953F')   // Dark Gold
                .stop(0.3, '#FCF6BA') // Light/Shiny Gold (The Glare)
                .stop(0.6, '#B38728') // Dark Gold
                .stop(0.8, '#FBF5B7') // Highlight
                .stop(1, '#AA771C');  // Dark Bronze

            // --- 2. Borders (Single Gold Gradient) ---
            const borderMargin = 40; // Increased margin to make space for ID at bottom
            doc.roundedRect(borderMargin, borderMargin, width - (borderMargin * 2), height - (borderMargin * 2), 30)
                .lineWidth(3)
                .stroke(goldGradient);

            // ... (rest of the code)

            // --- 9. ID (Bottom Center) ---
            const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?id=${verificationHash}`;

            // Position ID below the border (height - 40 is border bottom)
            doc.font('Courier').fontSize(8).fillColor('#444444')
                .text(`ID: ${verificationHash}`, 0, height - 32, {
                    align: 'center',
                    link: verifyUrl,
                    underline: false
                });

            // Add explicit "Click to Verify" text below
            doc.font('Helvetica').fontSize(6).fillColor('#333333')
                .text('(Click ID to Verify)', 0, height - 20, {
                    align: 'center'
                });

            // --- Glare/Shiny Effect (Subtle Overlay) ---
            doc.save();
            // Add a diagonal shine across the top-left
            const glareGradient = doc.linearGradient(0, 0, width / 2, height / 2);
            glareGradient.stop(0, '#FFFFFF', 0.1) // White with low opacity
                .stop(1, '#000000', 0);  // Fade to transparent

            doc.path(`M 0 0 L ${width / 2} 0 L 0 ${height / 2} Z`)
                .fill(glareGradient);
            doc.restore();

            // --- 3. Header ---
            doc.font('Helvetica').fontSize(14).fill(goldGradient) // Use Gradient Fill
                .text('ATOM PATH CERTIFICATION', 0, 100, {
                    align: 'center',
                    characterSpacing: 8
                });

            // --- 4. Recipient Name ---
            // Vertically centered around Y=220
            doc.font('Helvetica-Bold').fontSize(50).fillColor('#FFFFFF')
                .text(recipientName, 0, 180, {
                    align: 'center'
                });

            // --- 5. Separator Line ---
            const lineY = 250;
            const lineWidth = 200;
            doc.lineWidth(1) // Slightly thicker to show gradient
                .moveTo(centerX - (lineWidth / 2), lineY)
                .lineTo(centerX + (lineWidth / 2), lineY)
                .stroke(goldGradient);

            // --- 6. Body Text ---
            doc.font('Helvetica').fontSize(12).fillColor('#CCCCCC')
                .text('HAS SUCCESSFULLY COMPLETED THE COURSE', 0, 280, {
                    align: 'center',
                    characterSpacing: 2
                });

            // --- 7. Track Title ---
            doc.font('Helvetica-Bold').fontSize(36).fill(goldGradient)
                .text(trackTitle, 0, 320, {
                    align: 'center'
                });

            // --- 8. Footer Section ---
            const footerY = height - 120;
            const sectionWidth = 200;
            const leftCenterX = 180; // Center point for Date section
            const rightCenterX = width - 180; // Center point for Signature section

            // Date Section (Left)
            const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();

            // Date Value (Centered Above Line)
            doc.font('Helvetica').fontSize(10).fillColor('#888888')
                .text(date, leftCenterX - (sectionWidth / 2), footerY, {
                    width: sectionWidth,
                    align: 'center'
                });

            // Line
            doc.lineWidth(0.5).strokeColor('#555555')
                .moveTo(leftCenterX - 75, footerY + 15)
                .lineTo(leftCenterX + 75, footerY + 15)
                .stroke();

            // Label (Centered Below Line)
            doc.font('Helvetica').fontSize(8).fillColor('#666666')
                .text('DATE', leftCenterX - (sectionWidth / 2), footerY + 22, {
                    width: sectionWidth,
                    align: 'center'
                });

            // Signature Section (Right)
            const sigText = 'The One Atom';

            // Signature Value (Centered Above Line, Mild Thin Gold)
            doc.font('Times-Italic').fontSize(24).fill(goldGradient) // Gradient Signature
                .text(sigText, rightCenterX - (sectionWidth / 2), footerY - 5, {
                    width: sectionWidth,
                    align: 'center'
                });

            // Line
            doc.lineWidth(0.5).strokeColor('#555555')
                .moveTo(rightCenterX - 75, footerY + 15)
                .lineTo(rightCenterX + 75, footerY + 15)
                .stroke();

            // Label (Centered Below Line)
            doc.font('Helvetica').fontSize(8).fillColor('#666666')
                .text('OFFICIAL SIGNATURE', rightCenterX - (sectionWidth / 2), footerY + 22, {
                    width: sectionWidth,
                    align: 'center'
                });

            doc.end();
            resolve();

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    generateAtomCertificate,
    createAtomCertificatePDF
};
