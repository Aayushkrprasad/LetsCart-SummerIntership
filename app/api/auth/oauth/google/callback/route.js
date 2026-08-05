import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state') || 'BUYER';

        if (!code) {
            return NextResponse.json({ success: false, message: 'Authorization code is missing.' }, { status: 400 });
        }

        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const origin = `${protocol}://${host}`;
        const redirectUri = `${origin}/api/auth/oauth/google/callback`;

        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const jwtSecret = process.env.JWT_SECRET || 'letscart_super_secret_jwt_key_2026';

        if (!clientId || !clientSecret) {
            return NextResponse.json({
                success: false,
                message: 'Google Client Credentials are not configured in Vercel/environment settings.'
            }, { status: 500 });
        }

        // 1. Exchange auth code for access token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            })
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            throw new Error(`Google token exchange failed: ${errorText}`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // 2. Fetch user details from Google userinfo API
        const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!userinfoResponse.ok) {
            throw new Error('Failed to retrieve user info from Google.');
        }

        const googleUser = await userinfoResponse.json();
        const email = googleUser.email?.toLowerCase().trim();
        const name = googleUser.name || 'Google User';
        const avatar = googleUser.picture || null;

        if (!email) {
            throw new Error('Google account did not return a valid email address.');
        }

        // 3. Find user or register a new user with target role
        const targetRole = ['BUYER', 'SELLER', 'DELIVERY', 'ADMIN'].includes(state) ? state : 'BUYER';
        let user = await prisma.user.findUnique({
            where: {
                email_role: {
                    email,
                    role: targetRole
                }
            }
        });

        if (!user) {
            // Generate a random secure password for database requirement
            const randomPassword = crypto.randomUUID();
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: targetRole,
                    avatar
                }
            });
        }

        // 4. Generate LetsCart JWT Token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            jwtSecret,
            { expiresIn: '30d' }
        );

        // 5. Gather matching profiles for multi-role selector sync
        const matchingAccounts = await prisma.user.findMany({
            where: { email: user.email }
        });

        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            hasMultipleRoles: matchingAccounts.length > 1,
            availableRoles: matchingAccounts.map(a => a.role)
        };

        // Redirect back to frontend auth callback page with token and user details
        const callbackUrl = `${origin}/auth-callback?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(safeUser))}`;
        return NextResponse.redirect(callbackUrl);

    } catch (error) {
        console.error('Google Callback Auth Error:', error);
        // Redirect to login page with an error parameter
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const origin = `${protocol}://${host}`;
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message || 'Google Auth Failed')}`);
    }
}
