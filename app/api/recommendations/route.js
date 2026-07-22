import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// GET: Fetch personalized recommendations based on user's past purchase history
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        let userId = searchParams.get('userId');

        // Check JWT token if available
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const jwtSecret = process.env.JWT_SECRET || 'letscart_secret';
                const decoded = jwt.verify(token, jwtSecret);
                if (decoded.userId) userId = decoded.userId;
            } catch (err) {
                // Token verification error
            }
        }

        let boughtCategories = [];
        let boughtProductIds = [];

        // If user is logged in, analyze past order history
        if (userId) {
            const pastOrders = await prisma.order.findMany({
                where: { buyerId: userId },
                include: {
                    items: {
                        include: { product: true }
                    }
                }
            });

            // Collect bought categories, tags, and product IDs
            pastOrders.forEach(order => {
                order.items.forEach(item => {
                    if (item.product) {
                        boughtProductIds.push(item.product.id);
                        if (item.product.category && !boughtCategories.includes(item.product.category)) {
                            boughtCategories.push(item.product.category);
                        }
                    }
                });
            });
        }

        let recommendations = [];

        // If user has past purchase categories, fetch top products from those categories
        if (boughtCategories.length > 0) {
            recommendations = await prisma.product.findMany({
                where: {
                    category: { in: boughtCategories },
                    id: { notIn: boughtProductIds }
                },
                include: {
                    store: {
                        select: { name: true, username: true }
                    }
                },
                take: 8,
                orderBy: { createdAt: 'desc' }
            });
        }

        // Fallback: If no past purchases or not enough recommendations, fetch top overall products
        if (recommendations.length < 4) {
            const fallbackProducts = await prisma.product.findMany({
                where: {
                    id: { notIn: boughtProductIds }
                },
                include: {
                    store: {
                        select: { name: true, username: true }
                    }
                },
                take: 8 - recommendations.length,
                orderBy: { createdAt: 'desc' }
            });

            recommendations = [...recommendations, ...fallbackProducts];
        }

        return NextResponse.json({
            success: true,
            personalized: boughtCategories.length > 0,
            categoriesAnalyzed: boughtCategories,
            count: recommendations.length,
            recommendations
        }, { status: 200 });

    } catch (error) {
        console.error('Recommendation Engine Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to generate recommendations', error: error.message },
            { status: 500 }
        );
    }
}
