// POST /api/auth/login - Email/password login
import { query } from '@/lib/db';
import { generateToken, setAuthCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        // Validation
        if (!email || !password) {
            return Response.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find user
        const result = await query(
            'SELECT id, full_name, email, password_hash, interests FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return Response.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const user = result.rows[0];

        // Check if user registered with OAuth (no password)
        if (!user.password_hash) {
            return Response.json(
                { error: 'This account uses Google sign-in. Please use "Sign in with Google"' },
                { status: 401 }
            );
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return Response.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Generate JWT
        const token = generateToken({
            userId: user.id,
            email: user.email
        });

        // Return response with cookie
        return Response.json(
            {
                message: 'Login successful',
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
        console.error('Login error:', error);
        return Response.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
