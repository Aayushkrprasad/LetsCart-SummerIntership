'use client'
import Image from 'next/image';
import { assets } from '@/assets/assets';
import { Star, ShieldCheck, Sparkles, TrendingUp, Zap } from 'lucide-react';

export default function ProductOrbitShowcase() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';

    const products = [
        { id: 1, name: 'Premium Headphones', price: `${currency}1,999`, category: 'Audio', img: assets.product_img1, angle: 0 },
        { id: 2, name: 'Smart Fitness Watch', price: `${currency}2,499`, category: 'Wearables', img: assets.product_img2, angle: 60 },
        { id: 3, name: 'Wireless Speaker', price: `${currency}1,299`, category: 'Audio', img: assets.product_img3, angle: 120 },
        { id: 4, name: 'Pro Gaming Mouse', price: `${currency}899`, category: 'Electronics', img: assets.product_img4, angle: 180 },
        { id: 5, name: 'HD Action Cam', price: `${currency}3,100`, category: 'Cameras', img: assets.product_img5, angle: 240 },
        { id: 6, name: 'Noise Cancel Buds', price: `${currency}1,499`, category: 'Audio', img: assets.product_img6, angle: 300 },
    ];

    // Radius of orbit ring in pixels
    const radius = 180;

    return (
        <div className="hidden lg:flex flex-col items-center justify-center relative w-full h-full min-h-[620px] p-6 overflow-hidden select-none">
            {/* Background Radial Glow */}
            <div className="absolute inset-0 bg-radial from-green-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />

            {/* Orbit Container Header / Badge */}
            <div className="z-20 text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-700 text-xs font-semibold backdrop-blur-md mb-2 shadow-xs">
                    <Sparkles size={14} className="text-green-600 animate-spin" />
                    <span>Trending Collection 2026</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">
                    Shop Smarter, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Live Better</span>
                </h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-medium">
                    Join thousands of shoppers discovering curated products with AI recommendations.
                </p>
            </div>

            {/* Main Circular Orbit Arena */}
            <div className="relative w-[440px] h-[440px] flex items-center justify-center group">
                
                {/* Outer Concentric Orbit Ring Lines */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-green-500/20 animate-pulse pointer-events-none" />
                <div className="absolute inset-6 rounded-full border border-slate-200/80 pointer-events-none" />
                <div className="absolute inset-16 rounded-full border border-green-400/15 pointer-events-none" />

                {/* Center Core Showcase Hub */}
                <div className="relative z-10 w-40 h-40 rounded-full bg-gradient-to-br from-white via-slate-50 to-green-50/60 border border-green-200/60 shadow-xl shadow-green-500/10 flex flex-col items-center justify-center p-4 text-center backdrop-blur-xl transition-transform duration-500 group-hover:scale-105">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-green-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-green-500/30 mb-2">
                        <TrendingUp size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-tight">10k+ Products</span>
                    <span className="text-[10px] text-green-600 font-semibold mt-0.5 flex items-center gap-0.5">
                        <ShieldCheck size={12} /> Verified Sellers
                    </span>
                </div>

                {/* Rotating Circular Product Orbit */}
                <div className="absolute inset-0 w-full h-full rounded-full animate-rotate-orbit group-hover:[animation-play-state:paused] transition-all duration-300">
                    {products.map((product) => {
                        // Calculate position along orbit path
                        const rad = (product.angle * Math.PI) / 180;
                        const x = radius * Math.cos(rad);
                        const y = radius * Math.sin(rad);

                        return (
                            <div
                                key={product.id}
                                className="absolute"
                                style={{
                                    left: `calc(50% + ${x}px - 44px)`,
                                    top: `calc(50% + ${y}px - 44px)`,
                                }}
                            >
                                {/* Counter-rotating card container so image stays upright */}
                                <div className="animate-counter-rotate group-hover:[animation-play-state:paused]">
                                    <div className="w-22 h-22 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-lg shadow-slate-200/80 p-2 flex flex-col items-center justify-between hover:scale-115 hover:shadow-green-500/20 hover:border-green-400 transition-all duration-300 cursor-pointer group/card">
                                        
                                        {/* Product Thumbnail */}
                                        <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                                            <Image
                                                src={product.img}
                                                alt={product.name}
                                                fill
                                                className="object-contain p-1 group-hover/card:scale-110 transition-transform duration-300"
                                            />
                                        </div>

                                        {/* Product Info Badge */}
                                        <div className="w-full text-center">
                                            <p className="text-[10px] font-bold text-slate-800 truncate leading-none">
                                                {product.name}
                                            </p>
                                            <span className="text-[9px] font-extrabold text-green-600 block mt-0.5">
                                                {product.price}
                                            </span>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Floating Stats Pill */}
            <div className="z-20 mt-8 flex items-center gap-6 bg-white/80 backdrop-blur-xl border border-slate-200/80 px-6 py-2.5 rounded-2xl shadow-sm text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-800">4.9/5</span> Rating
                </div>
                <div className="h-3 w-px bg-slate-200" />
                <div className="flex items-center gap-1.5">
                    <Zap size={14} className="text-green-600" />
                    <span className="font-bold text-slate-800">Fast</span> Shipping
                </div>
            </div>
        </div>
    );
}
