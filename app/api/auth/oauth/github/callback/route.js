import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ success: false, message: 'Authorization code is missing.' }, { status: 400 });
        }

        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const origin = `${protocol}://${host}`;
        const redirectUri = `${origin}/api/auth/oauth/github/callback`;

        const clientId = process.env.GITHUB_CLIENT_ID;
        const clientSecret = process.env.GITHUB_CLIENT_SECRET;
        const jwtSecret = process.env.JWT_SECRET || 'letscart_super_secret_jwt_key_2026';

        if (!clientId || !clientSecret) {
            return NextResponse.json({
                success: false,
                message: 'GitHub Client Credentials are not configured in Vercel/environment settings.'
            }, { status: 500 });
        }

        // 1. Exchange auth code for GitHub access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: redirectUri
            })
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            throw new Error(`GitHub token exchange failed: ${errorText}`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        if (!accessToken) {
            throw new Error('Access token was not returned by GitHub.');
        }

        // 2. Fetch user profile from GitHub API
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'User-Agent': 'letscart-app'
            }
        });

        if (!userResponse.ok) {
            throw new Error('Failed to retrieve user details from GitHub.');
        }

        const githubUser = await userResponse.json();
        let email = githubUser.email?.toLowerCase().trim();
        const name = githubUser.name || githubUser.login || 'GitHub User';
        const avatar = githubUser.avatar_url || null;

        // 3. Fallback: If email is private/null, fetch emails explicitly
        if (!email) {
            const emailsResponse = await fetch('https://api.github.com/user/emails', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'User-Agent': 'letscart-app'
                }
            });

            if (emailsResponse.ok) {
                const emails = await emailsResponse.json();
                const primaryEmailObj = emails.find(e => e.primary) || emails.find(e => e.verified) || emails[0];
                email = primaryEmailObj?.email?.toLowerCase().trim();
            }
        }

        if (!email) {
            throw new Error('GitHub account did not return a valid email address.');
        }

        // 4. Find user or register new user with BUYER role by default
        let user = await prisma.user.findUnique({
            where: {
                email_role: {
                    email,
                    role: 'BUYER'
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
                    role: 'BUYER',
                    avatar
                }
            });
        }

        // 5. Generate LetsCart JWT Token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            jwtSecret,
            { expiresIn: '30d' }
        );

        // 6. Gather matching profiles for multi-role selector sync
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
        console.error('GitHub Callback Auth Error:', error);
        // Redirect to login page with error parameter
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const origin = `${protocol}://${host}`;
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message || 'GitHub Auth Failed')}`);
    }
}
