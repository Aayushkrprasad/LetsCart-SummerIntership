'use client'
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
    const wishlistIds = useSelector(state => state.wishlist?.items || []);
    const products = useSelector(state => state.product?.list || []);
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Filter active product catalog to match wishlist IDs
        const matched = products.filter(p => wishlistIds.includes(p.id));
        setWishlistProducts(matched);
        setLoading(false);
    }, [wishlistIds, products]);

    return (
        <div className="min-h-screen px-6 py-12 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-8 border-b border-slate-200 dark:border-slate-800">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                        My Wishlist <Heart size={28} className="text-red-500 fill-red-500 animate-pulse" />
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved for later
                    </p>
                </div>

                <Link
                    href="/shop"
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-semibold transition flex items-center gap-2"
                >
                    Continue Shopping <ArrowRight size={16} />
                </Link>
            </div>

            {/* Empty State */}
            {!loading && wishlistProducts.length === 0 && (
                <div className="my-20 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center mb-6">
                        <Heart size={36} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                        Your wishlist is empty
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 text-sm">
                        Explore our catalog, save your favorite tech and fashion items, and easily find them here anytime!
                    </p>
                    <Link
                        href="/shop"
                        className="px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full shadow-lg shadow-green-600/30 transition hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <ShoppingBag size={18} />
                        Explore Products
                    </Link>
                </div>
            )}

            {/* Wishlist Grid */}
            {!loading && wishlistProducts.length > 0 && (
                <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {wishlistProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
