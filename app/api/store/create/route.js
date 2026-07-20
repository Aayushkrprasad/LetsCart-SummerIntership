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
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'letscart_secret');
                userId = decoded.userId;
            } catch (err) {
                // Token invalid or expired
            }
        }

        const body = await request.json();
        const { name, username, description } = body;

        if (!name || !username) {
            return NextResponse.json(
                { success: false, message: 'Store name and username are required' },
                { status: 400 }
            );
        }

        // Check if username is taken
        const existingStore = await prisma.store.findUnique({
            where: { username: username.toLowerCase() }
        });

        if (existingStore) {
            return NextResponse.json(
                { success: false, message: 'Store username is already taken. Please choose another.' },
                { status: 409 }
            );
        }

        // Fallback user if token is missing
        if (!userId) {
            const firstUser = await prisma.user.findFirst();
            if (firstUser) userId = firstUser.id;
        }

        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'User account required to create a store. Please sign in.' },
                { status: 401 }
            );
        }

        // Create Store in PostgreSQL Database
        const store = await prisma.store.create({
            data: {
                name,
                username: username.toLowerCase(),
                description: description || '',
                ownerId: userId,
                status: 'approved' // Set to approved so sellers can immediately manage products
            }
        });

        // Update User role to SELLER
        await prisma.user.update({
            where: { id: userId },
            data: { role: 'SELLER' }
        });

        return NextResponse.json({
            success: true,
            message: 'Store created successfully in database!',
            store
        }, { status: 201 });

    } catch (error) {
        console.error('Create Store Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create store', error: error.message },
            { status: 500 }
        );
    }
}
