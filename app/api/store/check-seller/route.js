import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ success: false, message: 'Email query parameter is required' }, { status: 400 });
        }

        // Check if there is any user account with this email and role = 'SELLER'
        const sellerUser = await prisma.user.findFirst({
            where: {
                email,
                role: 'SELLER'
            }
        });

        return NextResponse.json({ 
            success: true, 
            exists: !!sellerUser 
        }, { status: 200 });

    } catch (error) {
        console.error("GET /api/store/check-seller error:", error);
        return NextResponse.json({ success: false, message: 'Failed to verify seller status', error: error.message }, { status: 500 });
    }
}
