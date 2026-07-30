import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json({ success: false, message: 'username query parameter is required' }, { status: 400 });
        }

        const store = await prisma.store.findUnique({
            where: { username },
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                products: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!store) {
            return NextResponse.json({ success: false, message: 'Store not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, store }, { status: 200 });
    } catch (error) {
        console.error("GET /api/store/details error:", error);
        return NextResponse.json({ success: false, message: 'Failed to fetch store details', error: error.message }, { status: 500 });
    }
}
