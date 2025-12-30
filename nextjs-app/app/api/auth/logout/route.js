// POST /api/auth/logout - Logout
import { clearAuthCookie } from '@/lib/auth';

export async function POST(request) {
    return Response.json(
        { message: 'Logout successful' },
        {
            status: 200,
            headers: clearAuthCookie()
        }
    );
}
