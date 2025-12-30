// POST /api/auth/google - Google OAuth authentication
import { query } from '@/lib/db';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request) {
    try {
        const { credential } = await request.json();

        if (!credential) {
            return Response.json(
                { error: 'Google credential is required' },
                { status: 400 }
            );
        }

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;

        // Check if user exists
        let result = await query(
            'SELECT id, full_name, email, interests FROM users WHERE oauth_provider = $1 AND oauth_id = $2',
            ['google', googleId]
        );

        let user;

        if (result.rows.length === 0) {
            // Check if email already exists with regular signup
            const emailCheck = await query(
                'SELECT id FROM users WHERE email = $1',
                [email.toLowerCase()]
            );

            if (emailCheck.rows.length > 0) {
                return Response.json(
                    { error: 'An account with this email already exists. Please use regular login.' },
                    { status: 409 }
                );
            }

            // Create new user
            result = await query(
                `INSERT INTO users (full_name, email, oauth_provider, oauth_id) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, full_name, email`,
                [name, email.toLowerCase(), 'google', googleId]
            );

            user = result.rows[0];
        } else {
            user = result.rows[0];
        }

        // Generate JWT
        const token = generateToken({
            userId: user.id,
            email: user.email
        });

        // Return response with cookie
        return Response.json(
            {
                message: 'Google authentication successful',
                user: {
                    id: user.id,
                    fullName: user.full_name,
                    email: user.email,
                    interests: user.interests || []
                }
            },
            {
                status: 200,
                headers: setAuthCookie(token)
            }
        );

    } catch (error) {
        console.error('Google auth error:', error);
        return Response.json(
            { error: 'Google authentication failed' },
            { status: 500 }
        );
    }
}
