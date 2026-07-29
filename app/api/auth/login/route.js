import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password, role } = body;

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Fetch all user accounts registered under this email address
        const matchingAccounts = await prisma.user.findMany({
            where: { email: normalizedEmail }
        });

        if (!matchingAccounts || matchingAccounts.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Verify password against each matching account
        const validAccounts = [];
        for (const acc of matchingAccounts) {
            const isMatch = await bcrypt.compare(password, acc.password);
            if (isMatch) {
                validAccounts.push(acc);
            }
        }

        if (validAccounts.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // If user has multiple accounts with the SAME password and didn't specify a role, ask them to pick!
        if (validAccounts.length > 1 && !role) {
            return NextResponse.json({
                success: true,
                requireRoleSelection: true,
                availableRoles: validAccounts.map(a => a.role),
                message: 'Multiple profiles found for this account. Please select a portal to enter.'
            }, { status: 200 });
        }

        // Select the requested role or default to the first valid account
        let targetUser = validAccounts.find(acc => acc.role === role) || validAccounts[0];

        // Generate JWT Token
        const jwtSecret = process.env.JWT_SECRET || 'letscart_super_secret_jwt_key_2026';
        const token = jwt.sign(
            { userId: targetUser.id, email: targetUser.email, role: targetUser.role },
            jwtSecret,
            { expiresIn: '30d' }
        );

        const safeUser = {
            id: targetUser.id,
            name: targetUser.name,
            email: targetUser.email,
            role: targetUser.role,
            avatar: targetUser.avatar,
            hasMultipleRoles: matchingAccounts.length > 1,
            availableRoles: matchingAccounts.map(a => a.role)
        };

        let roleMessage = 'Logged in successfully to Customer Account!';
        if (targetUser.role === 'SELLER') roleMessage = 'Logged in successfully to Seller Hub!';
        if (targetUser.role === 'DELIVERY') roleMessage = 'Logged in successfully to Delivery Dispatch Hub!';
        if (targetUser.role === 'ADMIN') roleMessage = 'Logged in successfully to Master Admin Portal!';

        return NextResponse.json({
            success: true,
            message: roleMessage,
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
