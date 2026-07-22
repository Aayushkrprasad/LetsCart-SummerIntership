'use client'
import { Suspense, useState, useMemo } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon, Filter, SlidersHorizontal, RotateCcw, Star, Check, Sparkles } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"

function ShopContent() {
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()

    const products = useSelector(state => state.product.list || [])

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [maxPrice, setMaxPrice] = useState(5000)
    const [minRating, setMinRating] = useState(0)
    const [sortBy, setSortBy] = useState('featured')
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

    // Dynamic unique categories
    const categories = useMemo(() => {
        const set = new Set(products.map(p => p.category).filter(Boolean))
        return ['all', ...Array.from(set)]
    }, [products])

    // Find highest price
    const highestPrice = useMemo(() => {
        if (products.length === 0) return 5000;
        return Math.max(...products.map(p => p.price || 0), 1000);
    }, [products]);

    // Apply all filters and sorting
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            if (search && !product.name.toLowerCase().includes(search.toLowerCase())) return false;
            if (selectedCategory !== 'all' && product.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
            if (product.price > maxPrice) return false;
            if (minRating > 0) {
                const ratingAvg = product.rating && product.rating.length > 0 
                    ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length) 
                    : 5;
                if (ratingAvg < minRating) return false;
            }
            return true;
        }).sort((a, b) => {
            if (sortBy === 'low-high') return a.price - b.price;
            if (sortBy === 'high-low') return b.price - a.price;
            if (sortBy === 'rating') {
                const rA = a.rating?.length ? a.rating.reduce((s, r) => s + r.rating, 0) / a.rating.length : 5;
                const rB = b.rating?.length ? b.rating.reduce((s, r) => s + r.rating, 0) / b.rating.length : 5;
                return rB - rA;
            }
            return 0;
        });
    }, [products, search, selectedCategory, maxPrice, minRating, sortBy]);

    const handleResetFilters = () => {
        setSelectedCategory('all');
        setMaxPrice(highestPrice);
        setMinRating(0);
        setSortBy('featured');
        if (search) router.push('/shop');
    };

    return (
        <div className="min-h-[85vh] px-4 sm:px-6 lg:px-8 py-8 bg-slate-50/40">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Title & Sort Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                    <div>
                        <h1 onClick={() => router.push('/shop')} className="text-2xl font-extrabold text-slate-800 flex items-center gap-2 cursor-pointer hover:text-green-600 transition">
                            {search && <MoveLeftIcon size={22} />}
                            {search ? `Search Results for "${search}"` : 'All Products'}
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Showing <span className="font-bold text-slate-800">{filteredProducts.length}</span> of {products.length} products
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Mobile Filter Toggle Button */}
                        <button
                            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-xs"
                        >
                            <SlidersHorizontal size={16} /> Filter Products
                        </button>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500 font-medium hidden sm:inline">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none focus:border-green-500 shadow-xs cursor-pointer"
                            >
                                <option value="featured">Featured Picks</option>
                                <option value="low-high">Price: Low to High</option>
                                <option value="high-low">Price: High to Low</option>
                                <option value="rating">Highest Rated</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Modern Layout: Left Sidebar (250px) + Right 3-4 Column Grid */}
                <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
                    
                    {/* LEFT SIDEBAR PANEL (Fixed ~250px) */}
                    <aside className={`w-full lg:w-64 flex-shrink-0 space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-6 shadow-sm sticky top-24">
                            
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                    <Filter size={16} className="text-green-600" /> Filters
                                </h3>
                                <button
                                    onClick={handleResetFilters}
                                    className="text-[11px] font-semibold text-slate-400 hover:text-green-600 flex items-center gap-1 cursor-pointer transition"
                                >
                                    <RotateCcw size={12} /> Clear All
                                </button>
                            </div>

                            {/* 1. Category Filter */}
                            <div className="space-y-2.5">
                                <h4 className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                                    Categories
                                </h4>
                                <div className="space-y-1 max-h-52 overflow-y-auto pr-1 text-xs">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium capitalize transition text-left cursor-pointer ${
                                                selectedCategory === cat
                                                    ? 'bg-green-600 text-white font-bold shadow-md shadow-green-600/20'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                        >
                                            <span>{cat === 'all' ? 'All Categories' : cat}</span>
                                            {selectedCategory === cat && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 2. Price Range Slider */}
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                <div className="flex items-center justify-between text-xs">
                                    <h4 className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                                        Price Range
                                    </h4>
                                    <span className="font-bold text-green-600">Up to ₹{maxPrice}</span>
                                </div>
                                <input
                                    type="range"
                                    min="10"
                                    max={highestPrice > 5000 ? highestPrice : 5000}
                                    step="50"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                                    className="w-full accent-green-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                                    <span>₹10</span>
                                    <span>₹{highestPrice > 5000 ? highestPrice : 5000}</span>
                                </div>
                            </div>

                            {/* 3. Ratings Filter */}
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                <h4 className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-2">
                                    Customer Rating
                                </h4>
                                <div className="space-y-1">
                                    {[0, 4, 3, 2].map((ratingVal) => (
                                        <button
                                            key={ratingVal}
                                            onClick={() => setMinRating(ratingVal)}
                                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                                                minRating === ratingVal
                                                    ? 'bg-green-50 text-green-700 font-bold border border-green-200'
                                                    : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            <span className="flex items-center gap-1">
                                                {ratingVal === 0 ? (
                                                    'All Ratings'
                                                ) : (
                                                    <>
                                                        {ratingVal} <Star size={12} className="fill-yellow-400 text-yellow-400" /> & above
                                                    </>
                                                )}
                                            </span>
                                            {minRating === ratingVal && <Check size={14} className="text-green-600" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </aside>

                    {/* RIGHT COLUMN: 3 or 4 Column Product Grid */}
                    <main className="flex-1 w-full">
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 mb-24 w-full">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-white border border-slate-200/90 rounded-3xl space-y-3 shadow-xs">
                                <Sparkles size={36} className="mx-auto text-slate-300" />
                                <h3 className="font-bold text-slate-800 text-base">No products found matching filters</h3>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                    Try clearing your price slider or selected category.
                                </p>
                                <button
                                    onClick={handleResetFilters}
                                    className="px-5 py-2.5 bg-green-600 text-white font-semibold text-xs rounded-xl shadow hover:bg-green-700 transition cursor-pointer"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </main>

                </div>

            </div>
        </div>
    )
}

export default function Shop() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading catalog...</div>}>
            <ShopContent />
        </Suspense>
    );
}