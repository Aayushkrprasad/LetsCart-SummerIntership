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

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User in PostgreSQL Database
        const newUser = await prisma.user.create({
            data: {
                name: name || email.split('@')[0],
                email: email.toLowerCase(),
                password: hashedPassword,
                role: role === 'SELLER' ? 'SELLER' : 'BUYER'
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        // Generate JWT Token
        const jwtSecret = process.env.JWT_SECRET || 'letscart_secret';
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email, role: newUser.role },
            jwtSecret,
            { expiresIn: '30d' }
        );

        return NextResponse.json({
            success: true,
            message: 'Account created successfully in database!',
            user: newUser,
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
