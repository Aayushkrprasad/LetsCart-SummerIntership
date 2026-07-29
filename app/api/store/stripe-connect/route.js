import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        const body = await request.json();
        const { origin = 'http://localhost:3000' } = body;

        let userId = body.userId;
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const jwtSecret = process.env.JWT_SECRET || 'letscart_super_secret_jwt_key_2026';
                const decoded = jwt.verify(token, jwtSecret);
                userId = decoded.userId;
            } catch (err) {}
        }

        if (!userId) {
            return NextResponse.json({ success: false, message: 'User authorization required' }, { status: 401 });
        }

        const store = await prisma.store.findUnique({
            where: { ownerId: userId }
        });

        if (!store) {
            return NextResponse.json({ success: false, message: 'Store profile not found' }, { status: 404 });
        }

        const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
        let stripeAccountId = store.stripeAccountId;

        // If seller doesn't have a Stripe Connect account ID yet, create one via REST API
        if (!stripeAccountId && stripeSecretKey && stripeSecretKey !== 'sk_test_...') {
            try {
                const params = new URLSearchParams();
                params.append('type', 'express');
                params.append('country', 'IN');
                params.append('email', store.name.toLowerCase().replace(/\s+/g, '') + '@seller.letscart.com');
                params.append('capabilities[card_payments][requested]', 'true');
                params.append('capabilities[transfers][requested]', 'true');

                const accountRes = await fetch('https://api.stripe.com/v1/accounts', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${stripeSecretKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params.toString()
                });

                if (accountRes.ok) {
                    const acc = await accountRes.json();
                    stripeAccountId = acc.id;

                    await prisma.store.update({
                        where: { id: store.id },
                        data: { stripeAccountId: acc.id }
                    });
                }
            } catch (err) {
                console.warn("Stripe Connect account creation failed:", err);
            }
        }

        // Generate Stripe Account Link for Express Onboarding
        if (stripeAccountId && stripeSecretKey && stripeSecretKey !== 'sk_test_...') {
            try {
                const linkParams = new URLSearchParams();
                linkParams.append('account', stripeAccountId);
                linkParams.append('refresh_url', `${origin}/store/profile?connect=refresh`);
                linkParams.append('return_url', `${origin}/store/profile?connect=success`);
                linkParams.append('type', 'account_onboarding');

                const linkRes = await fetch('https://api.stripe.com/v1/account_links', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${stripeSecretKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: linkParams.toString()
                });

                if (linkRes.ok) {
                    const link = await linkRes.json();
                    return NextResponse.json({
                        success: true,
                        url: link.url,
                        stripeAccountId
                    }, { status: 200 });
                }
            } catch (err) {
                console.warn("Stripe Account Link error:", err);
            }
        }

        // Test Mode Fallback
        const mockAccountId = stripeAccountId || `acct_test_${Date.now()}`;
        await prisma.store.update({
            where: { id: store.id },
            data: { stripeAccountId: mockAccountId }
        });

        return NextResponse.json({
            success: true,
            message: 'Stripe Connect Payout Account linked in test mode',
            stripeAccountId: mockAccountId,
            testMode: true,
            url: `${origin}/store/profile?connect=success`
        }, { status: 200 });

    } catch (error) {
        console.error('Stripe Connect API Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to generate Stripe Connect onboarding link', error: error.message },
            { status: 500 }
        );
    }
}
