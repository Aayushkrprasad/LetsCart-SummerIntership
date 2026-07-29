import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request) {
    try {
        let deliveryPartnerId = null;

        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const jwtSecret = process.env.JWT_SECRET || 'letscart_super_secret_jwt_key_2026';
                const decoded = jwt.verify(token, jwtSecret);
                if (decoded.userId) deliveryPartnerId = decoded.userId;
            } catch (err) {}
        }

        const { searchParams } = new URL(request.url);
        if (!deliveryPartnerId) {
            deliveryPartnerId = searchParams.get('partnerId');
        }

        let partnerRegion = null;
        if (deliveryPartnerId) {
            const partner = await prisma.user.findUnique({
                where: { id: deliveryPartnerId },
                select: { deliveryRegion: true }
            });
            if (partner) partnerRegion = partner.deliveryRegion;
        }

        const queryRegion = searchParams.get('region') || partnerRegion;

        // Fetch all orders available for dispatch & delivery
        let orders = await prisma.order.findMany({
            include: {
                buyer: { select: { id: true, name: true, email: true } },
                items: {
                    include: { product: { select: { name: true, images: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Filter orders by region if queryRegion is set
        if (queryRegion && queryRegion.trim().length > 0 && queryRegion !== 'ALL') {
            const cleanRegion = queryRegion.toLowerCase().trim();
            orders = orders.filter(o => {
                const orderRegion = (o.deliveryRegion || '').toLowerCase();
                const buyerEmail = (o.buyer?.email || '').toLowerCase();
                const buyerName = (o.buyer?.name || '').toLowerCase();
                return orderRegion.includes(cleanRegion) || buyerEmail.includes(cleanRegion) || buyerName.includes(cleanRegion) || cleanRegion === 'all';
            });
        }

        return NextResponse.json({
            success: true,
            partnerRegion: partnerRegion || 'Assam / Guwahati',
            activeRegion: queryRegion || partnerRegion || 'ALL',
            count: orders.length,
            orders
        }, { status: 200 });

    } catch (error) {
        console.error('Delivery Orders GET Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch delivery orders', error: error.message },
            { status: 500 }
        );
    }
}

// POST: Set/update delivery partner's preferred delivery region/location
export async function POST(request) {
    try {
        const body = await request.json();
        const { partnerId, region } = body;

        if (!partnerId || !region) {
            return NextResponse.json({ success: false, message: 'partnerId and region are required' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: partnerId },
            data: { deliveryRegion: region.trim() },
            select: { id: true, name: true, email: true, role: true, deliveryRegion: true }
        });

        return NextResponse.json({
            success: true,
            message: `Preferred delivery region set to "${region}"!`,
            user: updatedUser
        }, { status: 200 });

    } catch (error) {
        console.error('Set Delivery Region Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update preferred delivery region', error: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { orderId, status, partnerId } = body; // status: 'SHIPPED' | 'DELIVERED'

        if (!orderId || !status) {
            return NextResponse.json({ success: false, message: 'orderId and status are required' }, { status: 400 });
        }

        const updateData = { status };
        if (partnerId) updateData.deliveryPartnerId = partnerId;

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            message: `Order status updated to ${status}!`,
            order: updatedOrder
        }, { status: 200 });

    } catch (error) {
        console.error('Delivery Order Update Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update delivery status', error: error.message },
            { status: 500 }
        );
    }
}
