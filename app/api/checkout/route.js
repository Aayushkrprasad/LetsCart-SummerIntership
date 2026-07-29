import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { lockStock, getReservedStock } from '@/lib/redis';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        const body = await request.json();
        const { items = [], origin = 'http://localhost:3000' } = body;

        let buyerId = body.buyerId;

        // Check JWT token if available
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const jwtSecret = process.env.JWT_SECRET || 'letscart_super_secret_jwt_key_2026';
                const decoded = jwt.verify(token, jwtSecret);
                if (decoded.userId) buyerId = decoded.userId;
            } catch (err) {}
        }

        if (!items || items.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Cart items are required for checkout' },
                { status: 400 }
            );
        }

        const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';

        // Calculate total amount & verify stock concurrency via Redis engine
        let totalAmount = 0;
        const lineItems = [];

        for (const cartItem of items) {
            const product = await prisma.product.findUnique({
                where: { id: cartItem.productId }
            });

            if (product) {
                const qty = cartItem.quantity || 1;
                const reserved = await getReservedStock(product.id);
                const availableStock = Math.max(0, product.stock - reserved);

                // Prevent overselling if stock is reserved or exhausted
                if (availableStock < qty) {
                    return NextResponse.json({
                        success: false,
                        message: `Stock conflict: "${product.name}" has only ${availableStock} item(s) left in stock.`
                    }, { status: 409 });
                }

                // Reserve inventory atomically
                await lockStock(product.id, qty);

                const price = product.price;
                totalAmount += price * qty;

                lineItems.push({
                    name: product.name,
                    price: price,
                    image: product.images[0] || '',
                    quantity: qty,
                    productId: product.id,
                    storeId: product.storeId
                });
            }
        }

        if (lineItems.length === 0) {
            return NextResponse.json(
                { success: false, message: 'No valid products found for checkout' },
                { status: 404 }
            );
        }

        // Create PENDING order in PostgreSQL via Prisma
        const order = await prisma.order.create({
            data: {
                totalAmount,
                status: 'PENDING',
                buyerId: buyerId || 'guest-user',
                items: {
                    create: lineItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }
        });

        // Call Stripe REST API to create Checkout Session
        const params = new URLSearchParams();
        params.append('payment_method_types[0]', 'card');
        params.append('mode', 'payment');
        params.append('success_url', `${origin}/orders?success=true&order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`);
        params.append('cancel_url', `${origin}/cart?canceled=true`);
        params.append('client_reference_id', order.id);

        lineItems.forEach((item, index) => {
            params.append(`line_items[${index}][price_data][currency]`, 'inr');
            params.append(`line_items[${index}][price_data][product_data][name]`, item.name);
            if (item.image) {
                params.append(`line_items[${index}][price_data][product_data][images][0]`, item.image);
            }
            params.append(`line_items[${index}][price_data][unit_amount]`, Math.round(item.price * 100)); // amount in paise
            params.append(`line_items[${index}][quantity]`, item.quantity);
        });

        params.append('metadata[orderId]', order.id);
        if (buyerId) params.append('metadata[buyerId]', buyerId);

        let stripeSession = null;

        if (stripeSecretKey && stripeSecretKey !== 'sk_test_...') {
            try {
                const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${stripeSecretKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params.toString()
                });

                if (stripeRes.ok) {
                    stripeSession = await stripeRes.json();
                }
            } catch (e) {
                console.warn("Stripe API connection failed, using direct order link", e);
            }
        }

        if (stripeSession && stripeSession.url) {
            await prisma.order.update({
                where: { id: order.id },
                data: { stripeSessionId: stripeSession.id }
            });

            return NextResponse.json({
                success: true,
                url: stripeSession.url,
                orderId: order.id,
                sessionId: stripeSession.id
            }, { status: 200 });
        } else {
            // Test Mode Fallback
            await prisma.order.update({
                where: { id: order.id },
                data: { 
                    status: 'PAID',
                    invoiceUrl: `${origin}/api/orders/invoice?orderId=${order.id}` 
                }
            });

            return NextResponse.json({
                success: true,
                url: `${origin}/orders?success=true&order_id=${order.id}`,
                orderId: order.id,
                testMode: true,
                message: 'Order created and confirmed in test mode'
            }, { status: 200 });
        }

    } catch (error) {
        console.error('Checkout API Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to initiate checkout', error: error.message },
            { status: 500 }
        );
    }
}
