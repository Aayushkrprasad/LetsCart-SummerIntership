import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request) {
    try {
        // Authenticate admin user
        const authHeader = request.headers.get('authorization');
        let isAdmin = false;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const jwtSecret = process.env.JWT_SECRET || 'letscart_super_secret_jwt_key_2026';
                const decoded = jwt.verify(token, jwtSecret);
                if (decoded.role === 'ADMIN') isAdmin = true;
            } catch (err) {}
        }

        // Aggregate platform metrics
        const orders = await prisma.order.findMany();
        const stores = await prisma.store.findMany({
            include: { owner: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        const productsCount = await prisma.product.count();
        const deliveryPartnersCount = await prisma.user.count({ where: { role: 'DELIVERY' } });
        const buyersCount = await prisma.user.count({ where: { role: 'BUYER' } });
        const sellersCount = await prisma.user.count({ where: { role: 'SELLER' } });

        let totalRevenue = 0;
        orders.forEach(o => {
            if (o.status === 'PAID' || o.status === 'DELIVERED') {
                totalRevenue += o.totalAmount;
            }
        });

        return NextResponse.json({
            success: true,
            metrics: {
                totalRevenue,
                totalOrders: orders.length,
                totalStores: stores.length,
                pendingStores: stores.filter(s => s.status === 'pending').length,
                totalProducts: productsCount,
                deliveryPartners: deliveryPartnersCount,
                buyers: buyersCount,
                sellers: sellersCount
            },
            stores
        }, { status: 200 });

    } catch (error) {
        console.error('Admin Overview Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to load admin overview', error: error.message },
            { status: 500 }
        );
    }
}

// POST/PUT: Approve or reject store application
export async function PUT(request) {
    try {
        const body = await request.json();
        const { storeId, status } = body; // status: 'approved' | 'rejected'

        if (!storeId || !status) {
            return NextResponse.json({ success: false, message: 'storeId and status are required' }, { status: 400 });
        }

        const updatedStore = await prisma.store.update({
            where: { id: storeId },
            data: { status }
        });

        return NextResponse.json({
            success: true,
            message: `Store status updated to ${status}!`,
            store: updatedStore
        }, { status: 200 });

    } catch (error) {
        console.error('Admin Store Status Update Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update store status', error: error.message },
            { status: 500 }
        );
    }
}
