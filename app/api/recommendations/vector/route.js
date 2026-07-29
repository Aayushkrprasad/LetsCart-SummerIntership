import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateEmbedding, cosineSimilarity } from '@/lib/embeddings';
import jwt from 'jsonwebtoken';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        let userId = searchParams.get('userId');

        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const jwtSecret = process.env.JWT_SECRET || 'letscart_super_secret_jwt_key_2026';
                const decoded = jwt.verify(token, jwtSecret);
                if (decoded.userId) userId = decoded.userId;
            } catch (err) {}
        }

        const allProducts = await prisma.product.findMany({
            include: {
                store: { select: { name: true, username: true } }
            }
        });

        let userVector = null;
        let boughtProductIds = [];

        // Compute user embedding profile based on purchase history
        if (userId) {
            const pastOrders = await prisma.order.findMany({
                where: { buyerId: userId },
                include: {
                    items: {
                        include: { product: true }
                    }
                }
            });

            let combinedText = '';
            pastOrders.forEach(order => {
                order.items.forEach(item => {
                    if (item.product) {
                        boughtProductIds.push(item.product.id);
                        combinedText += ` ${item.product.name} ${item.product.category} ${item.product.description}`;
                    }
                });
            });

            if (combinedText.trim()) {
                userVector = generateEmbedding(combinedText);
            }
        }

        // If no purchase history vector, build default vector from top catalog items
        if (!userVector) {
            userVector = generateEmbedding("electronics fashion gadgets smart home desk accessories");
        }

        // Score products using Cosine Similarity against user vector
        const scoredProducts = allProducts.map(product => {
            const productText = `${product.name} ${product.category} ${product.description} ${(product.tags || []).join(' ')}`;
            const productVector = product.embedding && product.embedding.length === 384 
                ? product.embedding 
                : generateEmbedding(productText);

            const score = cosineSimilarity(userVector, productVector);

            return {
                ...product,
                similarityScore: score
            };
        });

        // Filter out already purchased products & sort by cosine similarity descending
        const recommendations = scoredProducts
            .filter(p => !boughtProductIds.includes(p.id))
            .sort((a, b) => b.similarityScore - a.similarityScore)
            .slice(0, 8);

        return NextResponse.json({
            success: true,
            personalized: boughtProductIds.length > 0,
            engine: "Sentence-Transformers 384-Dim Vector Cosine Similarity",
            count: recommendations.length,
            recommendations
        }, { status: 200 });

    } catch (error) {
        console.error('Vector Recommendation Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to generate vector recommendations', error: error.message },
            { status: 500 }
        );
    }
}
