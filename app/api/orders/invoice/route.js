import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        if (!orderId) {
            return new Response('Order ID required', { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                buyer: { select: { name: true, email: true } },
                items: {
                    include: {
                        product: { select: { name: true, price: true } }
                    }
                }
            }
        });

        if (!order) {
            return new Response('Order not found', { status: 404 });
        }

        const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';
        const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const invoiceHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>LetsCart Invoice #${order.orderNumber}</title>
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; line-height: 1.6; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10B981; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 32px; font-weight: bold; color: #1f2937; }
        .logo span { color: #10B981; }
        .badge { background-color: #D1FAE5; color: #065F46; padding: 6px 14px; font-size: 14px; font-weight: bold; border-radius: 20px; display: inline-block; }
        .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .details-col h4 { margin: 0 0 8px 0; color: #6b7280; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background-color: #F9FAFB; border-bottom: 2px solid #E5E7EB; text-align: left; padding: 12px 16px; font-size: 13px; color: #4B5563; }
        td { border-bottom: 1px solid #E5E7EB; padding: 14px 16px; font-size: 14px; }
        .total-row { font-size: 18px; font-weight: bold; background-color: #F9FAFB; }
        .footer { text-align: center; margin-top: 50px; color: #9CA3AF; font-size: 13px; border-top: 1px solid #E5E7EB; padding-top: 20px; }
        @media print {
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div className="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="background-color: #10B981; color: white; border: none; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 8px; cursor: pointer;">Print / Save PDF</button>
    </div>

    <div class="header">
        <div class="logo">Lets<span>Cart</span>.</div>
        <div>
            <span class="badge">OFFICIAL INVOICE</span>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #6B7280; text-align: right;">Order #${order.orderNumber}</p>
        </div>
    </div>

    <div class="details">
        <div class="details-col">
            <h4>Billed To</h4>
            <strong>${order.buyer?.name || 'Customer'}</strong><br>
            ${order.buyer?.email || 'N/A'}
        </div>
        <div class="details-col" style="text-align: right;">
            <h4>Invoice Info</h4>
            <strong>Date:</strong> ${formattedDate}<br>
            <strong>Status:</strong> ${order.status}<br>
            <strong>Payment Method:</strong> Stripe Secured Checkout
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Amount</th>
            </tr>
        </thead>
        <tbody>
            ${order.items.map(item => `
                <tr>
                    <td><strong>${item.product?.name || 'Product Item'}</strong></td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">${currency}${item.price}</td>
                    <td style="text-align: right;">${currency}${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
            `).join('')}
            <tr class="total-row">
                <td colspan="3" style="text-align: right;">Total Amount Paid</td>
                <td style="text-align: right; color: #10B981;">${currency}${order.totalAmount.toFixed(2)}</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        Thank you for shopping with LetsCart! For support inquiries, contact support@letscart.com.
    </div>
</body>
</html>
        `;

        return new Response(invoiceHtml, {
            headers: {
                'Content-Type': 'text/html',
            }
        });

    } catch (error) {
        console.error('Invoice API Error:', error);
        return new Response('Failed to generate invoice', { status: 500 });
    }
}
