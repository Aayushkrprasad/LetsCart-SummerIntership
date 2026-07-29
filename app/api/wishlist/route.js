import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Helper to extract userId from Auth header or search params
function getUserId(request, bodyUserId = null) {
    let userId = bodyUserId;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const jwtSecret = process.env.JWT_SECRET || 'letscart_super_secret_jwt_key_2026';
            const decoded = jwt.verify(token, jwtSecret);
            if (decoded.userId) userId = decoded.userId;
        } catch (err) {
            // Token verification failed
        }
    }
    return userId;
}

// GET: Fetch user's wishlist items
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        let userId = searchParams.get('userId');
        userId = getUserId(request, userId);

        if (!userId) {
            return NextResponse.json({ success: false, message: 'User ID or Auth token required' }, { status: 400 });
        }

        const wishlistItems = await prisma.wishlist.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        store: {
                            select: { name: true, username: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Extract products array
        const products = wishlistItems.map(item => item.product);

        return NextResponse.json({
            success: true,
            count: products.length,
            wishlist: products
        }, { status: 200 });

    } catch (error) {
        console.error('Wishlist GET Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch wishlist', error: error.message },
            { status: 500 }
        );
    }
}

// POST: Toggle adding or removing a product from user's wishlist
export async function POST(request) {
    try {
        const body = await request.json();
        const { productId } = body;
        let userId = getUserId(request, body.userId);

        if (!productId || !userId) {
            return NextResponse.json(
                { success: false, message: 'productId and userId (or Auth token) are required' },
                { status: 400 }
            );
        }

        // Check if product exists in database
        const productExists = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!productExists) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        // Check if already in wishlist
        const existingItem = await prisma.wishlist.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId
                }
            }
        });

        if (existingItem) {
            // Remove from wishlist
            await prisma.wishlist.delete({
                where: { id: existingItem.id }
            });

            return NextResponse.json({
                success: true,
                added: false,
                message: 'Removed from wishlist',
                productId
            }, { status: 200 });

        } else {
            // Add to wishlist
            const newItem = await prisma.wishlist.create({
                data: {
                    userId,
                    productId
                },
                include: {
                    product: true
                }
            });

            return NextResponse.json({
                success: true,
                added: true,
                message: 'Added to wishlist',
                product: newItem.product
            }, { status: 201 });
        }

    } catch (error) {
        console.error('Wishlist POST Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update wishlist', error: error.message },
            { status: 500 }
        );
    }
}
