import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET || 'letscart_super_secret_jwt_key_2026';
        let decoded;
        try {
            decoded = jwt.verify(token, jwtSecret);
        } catch (err) {
            return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
        }

        const body = await request.json();
        const { targetRole } = body;

        if (!targetRole) {
            return NextResponse.json({ success: false, message: 'targetRole is required' }, { status: 400 });
        }

        // Find the target user account with same email and the requested targetRole
        const targetUser = await prisma.user.findFirst({
            where: {
                email: decoded.email,
                role: targetRole
            }
        });

        if (!targetUser) {
            return NextResponse.json({ 
                success: false, 
                message: `You do not have a profile registered under the ${targetRole} role.` 
            }, { status: 404 });
        }

        // Find all accounts under this email to set multi-role flags correctly
        const allAccounts = await prisma.user.findMany({
            where: { email: targetUser.email },
            select: { role: true }
        });

        const newToken = jwt.sign(
            { userId: targetUser.id, email: targetUser.email, role: targetUser.role },
            jwtSecret,
            { expiresIn: '30d' }
        );

        const safeUser = {
            id: targetUser.id,
            name: targetUser.name,
            email: targetUser.email,
            role: targetUser.role,
            avatar: targetUser.avatar,
            hasMultipleRoles: allAccounts.length > 1,
            availableRoles: allAccounts.map(a => a.role)
        };

        return NextResponse.json({
            success: true,
            message: `Switched portal to ${targetRole === 'SELLER' ? 'Seller Store' : targetRole === 'DELIVERY' ? 'Delivery Dispatch' : targetRole === 'ADMIN' ? 'Master Admin' : 'Customer'} successfully!`,
            user: safeUser,
            token: newToken
        }, { status: 200 });

    } catch (error) {
        console.error('Switch Role Error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error during role switch', error: error.message },
            { status: 500 }
        );
    }
}
