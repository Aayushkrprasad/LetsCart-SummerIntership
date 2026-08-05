import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const origin = `${protocol}://${host}`;
        const redirectUri = `${origin}/api/auth/oauth/google/callback`;

        const clientId = process.env.GOOGLE_CLIENT_ID || '';
        if (!clientId) {
            return NextResponse.json({
                success: false,
                message: 'GOOGLE_CLIENT_ID environment variable is missing. Please configure it in your environment settings.'
            }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role') || 'BUYER';

        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('openid profile email')}&prompt=select_account&state=${encodeURIComponent(role)}`;

        return NextResponse.redirect(googleAuthUrl);
    } catch (error) {
        console.error('Google OAuth Redirection Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to initiate Google Authentication.'
        }, { status: 500 });
    }
}
