import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, password, role } = body;

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();
        
        let userRole = 'BUYER';
        if (role === 'SELLER') userRole = 'SELLER';
        else if (role === 'DELIVERY') userRole = 'DELIVERY';
        else if (role === 'ADMIN') userRole = 'ADMIN';

        // Check if an account with this exact EMAIL and ROLE already exists
        const existingUser = await prisma.user.findFirst({
            where: { 
                email: normalizedEmail,
                role: userRole
            }
        });

        if (existingUser) {
            let roleTitle = 'Customer';
            if (userRole === 'SELLER') roleTitle = 'Store Owner';
            if (userRole === 'DELIVERY') roleTitle = 'Delivery Partner';
            if (userRole === 'ADMIN') roleTitle = 'Admin';

            return NextResponse.json(
                { 
                    success: false, 
                    message: `A ${roleTitle} account with this email already exists. Please sign in with your ${roleTitle} credentials.` 
                },
                { status: 409 }
            );
        }

        // Hash Password for new separate account
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create separate User in PostgreSQL Database for this role
        const newUser = await prisma.user.create({
            data: {
                name: name || normalizedEmail.split('@')[0],
                email: normalizedEmail,
                password: hashedPassword,
                role: userRole
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                createdAt: true
            }
        });

        // If creating a SELLER account, provision a dedicated Store Hub for them
        if (userRole === 'SELLER') {
            await prisma.store.create({
                data: {
                    name: `${newUser.name}'s Store`,
                    username: `store_${newUser.id.substring(0, 8)}`,
                    description: 'Official LetsCart Partner Store',
                    ownerId: newUser.id,
                    status: 'approved'
                }
            });
        }

        // Check all accounts under this email to set multi-role flag
        const allAccounts = await prisma.user.findMany({
            where: { email: normalizedEmail },
            select: { role: true }
        });

        const safeUser = {
            ...newUser,
            hasMultipleRoles: allAccounts.length > 1,
            availableRoles: allAccounts.map(a => a.role)
        };

        // Generate JWT Token for this role
        const jwtSecret = process.env.JWT_SECRET || 'letscart_super_secret_jwt_key_2026';
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email, role: newUser.role },
            jwtSecret,
            { expiresIn: '30d' }
        );

        let welcomeMsg = 'Customer account created successfully!';
        if (userRole === 'SELLER') welcomeMsg = 'Store Owner account created! Welcome to Seller Hub.';
        if (userRole === 'DELIVERY') welcomeMsg = 'Delivery Partner account created! Welcome to LetsCart Logistics.';
        if (userRole === 'ADMIN') welcomeMsg = 'Master Admin account created!';

        return NextResponse.json({
            success: true,
            message: welcomeMsg,
            user: safeUser,
            token
        }, { status: 201 });

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error during registration', error: error.message },
            { status: 500 }
        );
    }
}
