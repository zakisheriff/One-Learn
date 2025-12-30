import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        const result = await query('SELECT password_hash FROM users WHERE id = $1', [user.userId]);
        const dbUser = result.rows[0];

        if (!dbUser.password_hash) {
            return Response.json({ error: 'Account uses Google Sign-in' }, { status: 400 });
        }

        const isValid = await bcrypt.compare(currentPassword, dbUser.password_hash);
        if (!isValid) {
            return Response.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashed, user.userId]);

        return Response.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Update password error:', error);
        return Response.json({ error: 'Failed to update password' }, { status: 500 });
    }
}
