import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Helper to extract userId & find Seller's Store ID
async function getSellerStore(request) {
    let userId = null;
    try {
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

        if (!userId) {
            const firstSellerUser = await prisma.user.findFirst({ where: { role: 'SELLER' } });
            if (firstSellerUser) userId = firstSellerUser.id;
        }

        if (!userId) return null;

        let store = await prisma.store.findUnique({
            where: { ownerId: userId }
        });

        if (!store) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user) {
                store = await prisma.store.create({
                    data: {
                        name: `${user.name}'s Store`,
                        username: `store_${user.id.substring(0, 8)}`,
                        description: 'Official LetsCart Partner Store',
                        ownerId: user.id,
                        status: 'approved'
                    }
                });
            }
        }

        return store;
    } catch (e) {
        console.error("getSellerStore error:", e);
        return null;
    }
}

// GET: Fetch products for the seller's store
export async function GET(request) {
    try {
        const store = await getSellerStore(request);

        if (!store) {
            return NextResponse.json({ success: false, message: 'Seller store not found' }, { status: 404 });
        }

        const products = await prisma.product.findMany({
            where: { storeId: store.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            store,
            count: products.length,
            products
        }, { status: 200 });

    } catch (error) {
        console.error('Seller GET Products Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch store products', error: error.message },
            { status: 500 }
        );
    }
}

// POST: Add a new product to seller's store
export async function POST(request) {
    try {
        const store = await getSellerStore(request);

        if (!store) {
            return NextResponse.json({ success: false, message: 'Seller store not found or unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, price, category, images = [], stock = 50, tags = [] } = body;

        if (!name || !description || price === undefined || !category) {
            return NextResponse.json(
                { success: false, message: 'Name, description, price, and category are required' },
                { status: 400 }
            );
        }

        const finalImages = Array.isArray(images) && images.length > 0
            ? images.filter(Boolean)
            : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'];

        const newProduct = await prisma.product.create({
            data: {
                name: name.trim(),
                description: description.trim(),
                price: parseFloat(price) || 0,
                stock: parseInt(stock) || 50,
                category: category.trim(),
                images: finalImages,
                tags,
                storeId: store.id
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Product created successfully!',
            product: newProduct
        }, { status: 201 });

    } catch (error) {
        console.error('Seller POST Product Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create product', error: error.message },
            { status: 500 }
        );
    }
}

// PUT: Update product details or stock count
export async function PUT(request) {
    try {
        let body;
        try {
            body = await request.json();
        } catch (err) {
            return NextResponse.json({ success: false, message: 'Invalid JSON payload' }, { status: 400 });
        }

        const { productId, stock, price, name, description, category, images } = body;

        if (!productId) {
            return NextResponse.json({ success: false, message: 'productId is required' }, { status: 400 });
        }

        const existing = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!existing) {
            return NextResponse.json({ success: false, message: 'Product listing not found' }, { status: 404 });
        }

        const updateData = {};
        if (stock !== undefined && stock !== null && !isNaN(stock)) updateData.stock = parseInt(stock);
        if (price !== undefined && price !== null && !isNaN(price)) updateData.price = parseFloat(price);
        if (name && typeof name === 'string') updateData.name = name.trim();
        if (description && typeof description === 'string') updateData.description = description.trim();
        if (category && typeof category === 'string') updateData.category = category.trim();
        if (Array.isArray(images) && images.length > 0) {
            const validImages = images.filter(img => typeof img === 'string' && img.trim().length > 0);
            if (validImages.length > 0) updateData.images = validImages;
        }

        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            message: 'Product updated successfully',
            product: updatedProduct
        }, { status: 200 });

    } catch (error) {
        console.error('Seller PUT Product Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update product details', error: error.message },
            { status: 500 }
        );
    }
}

// DELETE: Delete a product from seller's store
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ success: false, message: 'productId query param required' }, { status: 400 });
        }

        await prisma.product.delete({
            where: { id: productId }
        });

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully',
            productId
        }, { status: 200 });

    } catch (error) {
        console.error('Seller DELETE Product Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete product', error: error.message },
            { status: 500 }
        );
    }
}
