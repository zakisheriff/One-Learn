// POST /api/auth/register - User registration
import { query } from '@/lib/db';
import { generateToken, setAuthCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function POST(request) {
    try {
        const { fullName, email, password } = await request.json();

        // Validation
        if (!fullName || !email || !password) {
            return Response.json(
                { error: 'Full name, email, and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return Response.json(
                { error: 'Password must be at least 8 characters long' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return Response.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const result = await query(
            `INSERT INTO users (full_name, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, full_name, email, created_at`,
            [fullName, email.toLowerCase(), passwordHash]
        );

        const user = result.rows[0];

        // Generate JWT
        const token = generateToken({
            userId: user.id,
            email: user.email
        });

        // Return response with cookie
        return Response.json(
            {
                message: 'User registered successfully',
                user: {
                    id: user.id,
                    fullName: user.full_name,
                    email: user.email
                }
            },
            {
                status: 201,
                headers: setAuthCookie(token)
            }
        );

    } catch (error) {
        console.error('Registration error:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
