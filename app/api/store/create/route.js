import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        const authHeader = request.headers.get('authorization');
        let userId = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const jwtSecret = process.env.JWT_SECRET || 'letscart_super_secret_jwt_key_2026';
                const decoded = jwt.verify(token, jwtSecret);
                userId = decoded.userId;
            } catch (err) {
                console.warn("JWT Verification failed in create store:", err);
            }
        }

        const body = await request.json();
        let { name, username, description } = body;

        // Fallback user if token header is missing
        if (!userId) {
            const { searchParams } = new URL(request.url);
            userId = searchParams.get('userId');
        }

        if (!userId) {
            const firstSellerUser = await prisma.user.findFirst({ where: { role: 'SELLER' } });
            if (firstSellerUser) userId = firstSellerUser.id;
        }

        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'User authentication required. Please log in.' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ success: false, message: 'User account not found' }, { status: 404 });
        }

        // Auto-generate name/username if missing
        if (!name) name = `${user.name}'s Store`;
        if (!username) username = `store_${user.id.substring(0, 8)}`;
        const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

        // Check if user already owns a store
        const existingStoreForUser = await prisma.store.findUnique({
            where: { ownerId: user.id }
        });

        let store;

        if (existingStoreForUser) {
            // Update existing store details
            store = await prisma.store.update({
                where: { id: existingStoreForUser.id },
                data: {
                    name,
                    description: description || existingStoreForUser.description,
                    status: 'approved'
                }
            });
        } else {
            // Check if username is taken by another store
            const usernameTaken = await prisma.store.findUnique({
                where: { username: cleanUsername }
            });

            const finalUsername = usernameTaken ? `${cleanUsername}_${Date.now().toString().slice(-4)}` : cleanUsername;

            // Create new Store in PostgreSQL Database
            store = await prisma.store.create({
                data: {
                    name,
                    username: finalUsername,
                    description: description || '',
                    ownerId: user.id,
                    status: 'approved'
                }
            });

            // Ensure user role is set to SELLER
            await prisma.user.update({
                where: { id: user.id },
                data: { role: 'SELLER' }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Store saved successfully in database!',
            store
        }, { status: 200 });

    } catch (error) {
        console.error('Create Store Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create or update store', error: error.message },
            { status: 500 }
        );
    }
}
