import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: {
                store: {
                    select: {
                        name: true,
                        username: true,
                        logo: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json({ success: true, products }, { status: 200 });
    } catch (error) {
        console.error("GET /api/products error:", error);
        return NextResponse.json({ success: false, message: 'Failed to fetch products', error: error.message }, { status: 500 });
    }
}
