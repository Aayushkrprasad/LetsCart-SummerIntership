import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// GET: Fetch past orders for logged-in user
export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');
        let userId = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const jwtSecret = process.env.JWT_SECRET || 'letscart_secret';
                const decoded = jwt.verify(token, jwtSecret);
                userId = decoded.userId;
            } catch (err) {
                return NextResponse.json(
                    { success: false, message: 'Invalid or expired token' },
                    { status: 401 }
                );
            }
        }

        // Also allow passing userId as query parameter for flexibility
        const { searchParams } = new URL(request.url);
        const queryUserId = searchParams.get('userId');
        const targetUserId = userId || queryUserId;

        if (!targetUserId) {
            return NextResponse.json(
                { success: false, message: 'User authentication required' },
                { status: 400 }
            );
        }

        // Fetch orders from PostgreSQL
        const orders = await prisma.order.findMany({
            where: { buyerId: targetUserId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                category: true,
                                images: true,
                                tags: true
                            }
                        }
                    }
                },
                store: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        logo: true
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
        console.error('Fetch Orders Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch orders', error: error.message },
            { status: 500 }
        );
    }
}

// POST: Create a new order (Checkout)
export async function POST(request) {
    try {
        const body = await request.json();
        const { buyerId, storeId, items, totalAmount, stripeSessionId } = body;

        if (!buyerId || !items || items.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Buyer ID and items are required' },
                { status: 400 }
            );
        }

        // Create Order and OrderItems in PostgreSQL transaction
        const newOrder = await prisma.order.create({
            data: {
                buyerId,
                storeId: storeId || null,
                totalAmount: totalAmount || 0,
                status: 'PAID',
                stripeSessionId: stripeSessionId || `session_${Date.now()}`,
                items: {
                    create: items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity || 1,
                        price: item.price || 0
                    }))
                }
            },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Order placed successfully!',
            order: newOrder
        }, { status: 201 });

    } catch (error) {
        console.error('Create Order Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create order', error: error.message },
            { status: 500 }
        );
    }
}
