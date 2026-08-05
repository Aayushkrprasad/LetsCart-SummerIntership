import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
    try {
        const bodyText = await request.text();
        let event;

        try {
            event = JSON.parse(bodyText);
        } catch (err) {
            return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
        }

        // Handle checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const orderId = session.metadata?.orderId || session.client_reference_id;
            const stripeSessionId = session.id;

            if (orderId) {
                // Fetch order with items
                const order = await prisma.order.findUnique({
                    where: { id: orderId },
                    include: { items: true }
                });

                if (order) {
                    // Update Order status to PAID
                    await prisma.order.update({
                        where: { id: orderId },
                        data: {
                            status: 'PAID',
                            stripeSessionId: stripeSessionId,
                            invoiceUrl: `/api/orders/invoice?orderId=${orderId}`
                        }
                    });

                    // Decrement live stock inventory and transfer split payout to seller
                    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';

                    for (const item of order.items) {
                        try {
                            const product = await prisma.product.findUnique({
                                where: { id: item.productId },
                                include: { store: true }
                            });

                            if (product) {
                                // 1. Decrement stock in database
                                await prisma.product.update({
                                    where: { id: product.id },
                                    data: {
                                        stock: {
                                            decrement: item.quantity
                                        }
                                    }
                                });

                                // 2. Trigger Stripe Connect Split Transfer if seller is onboarded
                                if (product.store && product.store.stripeAccountId && stripeSecretKey && stripeSecretKey !== 'sk_test_...') {
                                    try {
                                        const itemTotal = item.price * item.quantity;
                                        const commissionRate = 0.10; // 10% Platform commission fee
                                        const sellerAmount = itemTotal * (1 - commissionRate);

                                        const transferParams = new URLSearchParams();
                                        transferParams.append('amount', Math.round(sellerAmount * 100)); // amount in paise / cents
                                        transferParams.append('currency', 'inr');
                                        transferParams.append('destination', product.store.stripeAccountId);
                                        transferParams.append('transfer_group', `order_${order.id}`);
                                        transferParams.append('description', `Split payout for "${product.name}" (Qty: ${item.quantity}) in order ${order.orderNumber}`);

                                        const transferRes = await fetch('https://api.stripe.com/v1/transfers', {
                                            method: 'POST',
                                            headers: {
                                                'Authorization': `Bearer ${stripeSecretKey}`,
                                                'Content-Type': 'application/x-www-form-urlencoded',
                                            },
                                            body: transferParams.toString()
                                        });

                                        if (transferRes.ok) {
                                            const transferData = await transferRes.json();
                                            console.log(`[Stripe Connect] Transferred ₹${sellerAmount} to ${product.store.name} (ID: ${transferData.id})`);
                                        } else {
                                            const errData = await transferRes.json();
                                            console.error(`[Stripe Connect] Transfer failed:`, errData);
                                        }
                                    } catch (transferErr) {
                                        console.error(`[Stripe Connect] Transfer exception:`, transferErr);
                                    }
                                }
                            }
                        } catch (stockErr) {
                            console.error(`Failed to process stock/transfer for product ${item.productId}:`, stockErr);
                        }
                    }
                }
            }
        }

        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error) {
        console.error('Stripe Webhook Error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed', details: error.message },
            { status: 500 }
        );
    }
}
