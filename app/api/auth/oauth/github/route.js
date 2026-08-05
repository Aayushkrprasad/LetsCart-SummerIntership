import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const origin = `${protocol}://${host}`;
        const redirectUri = `${origin}/api/auth/oauth/github/callback`;

        const clientId = process.env.GITHUB_CLIENT_ID || '';
        if (!clientId) {
            return NextResponse.json({
                success: false,
                message: 'GITHUB_CLIENT_ID environment variable is missing. Please configure it in your environment settings.'
            }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role') || 'BUYER';

        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent('user:email')}&state=${encodeURIComponent(role)}`;

        return NextResponse.redirect(githubAuthUrl);
    } catch (error) {
        console.error('GitHub OAuth Redirection Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to initiate GitHub Authentication.'
        }, { status: 500 });
    }
}
