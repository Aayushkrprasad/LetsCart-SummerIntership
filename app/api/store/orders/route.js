import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

async function getSellerStore(request) {
    let userId = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const jwtSecret = process.env.JWT_SECRET || 'letscart_super_secret_jwt_key_2026';
            const decoded = jwt.verify(token, jwtSecret);
            userId = decoded.userId;
        } catch (err) {}
    }

    if (!userId) {
        const { searchParams } = new URL(request.url);
        userId = searchParams.get('userId');
    }

    if (!userId) return null;

    return await prisma.store.findUnique({
        where: { ownerId: userId }
    });
}

// GET: Fetch seller store orders
export async function GET(request) {
    try {
        const store = await getSellerStore(request);

        if (!store) {
            return NextResponse.json({ success: false, message: 'Store not found' }, { status: 404 });
        }

        // Fetch orders where items belong to this store, or storeId matches
        const orders = await prisma.order.findMany({
            where: {
                OR: [
                    { storeId: store.id },
                    {
                        items: {
                            some: {
                                product: { storeId: store.id }
                            }
                        }
                    }
                ]
            },
            include: {
                buyer: {
                    select: { name: true, email: true }
                },
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            count: orders.length,
            orders
        }, { status: 200 });

    } catch (error) {
        console.error('Seller GET Orders Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch store orders', error: error.message },
            { status: 500 }
        );
    }
}

// PUT: Update order status
export async function PUT(request) {
    try {
        const body = await request.json();
        const { orderId, status } = body;

        if (!orderId || !status) {
            return NextResponse.json({ success: false, message: 'orderId and status required' }, { status: 400 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status }
        });

        return NextResponse.json({
            success: true,
            message: `Order status updated to ${status}`,
            order: updatedOrder
        }, { status: 200 });

    } catch (error) {
        console.error('Seller PUT Orders Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update order status', error: error.message },
            { status: 500 }
        );
    }
}
