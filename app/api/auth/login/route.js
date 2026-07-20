import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find user in PostgreSQL
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Compare Hashed Password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return NextResponse.json(
                { success: false, message: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Generate JWT Token
        const jwtSecret = process.env.JWT_SECRET || 'letscart_secret';
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            jwtSecret,
            { expiresIn: '30d' }
        );

        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
        };

        return NextResponse.json({
            success: true,
            message: 'Logged in successfully!',
            user: safeUser,
            token
        }, { status: 200 });

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error during login', error: error.message },
            { status: 500 }
        );
    }
}
