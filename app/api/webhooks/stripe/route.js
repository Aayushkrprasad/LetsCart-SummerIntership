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

                    // Decrement live stock inventory for each purchased item
                    for (const item of order.items) {
                        try {
                            await prisma.product.update({
                                where: { id: item.productId },
                                data: {
                                    stock: {
                                        decrement: item.quantity
                                    }
                                }
                            });
                        } catch (stockErr) {
                            console.error(`Failed to decrement stock for product ${item.productId}:`, stockErr);
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
