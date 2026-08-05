'use client'
import { StarIcon, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toggleWishlist } from '@/lib/features/wishlist/wishlistSlice'
import toast from 'react-hot-toast'

const ProductCard = ({ product }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
    const dispatch = useDispatch()
    const wishlistItems = useSelector(state => state.wishlist?.items || [])

    const isWishlisted = wishlistItems.includes(product.id)

    // calculate the average rating of the product
    const rating = product.rating && product.rating.length > 0 
        ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length) 
        : 5;

    const handleWishlistToggle = (e) => {
        e.preventDefault()
        e.stopPropagation()

        dispatch(toggleWishlist(product.id))

        if (isWishlisted) {
            toast.success("Removed from wishlist")
        } else {
            toast.success("Added to wishlist ❤️")
        }

        // Call backend API if user is logged in
        if (typeof window !== 'undefined') {
            const savedUser = localStorage.getItem('letscart_user')
            const token = localStorage.getItem('letscart_token')
            if (savedUser && token) {
                try {
                    const user = JSON.parse(savedUser)
                    fetch('/api/wishlist', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ productId: product.id, userId: user.id })
                    }).catch(console.error)
                } catch (err) {}
            }
        }
    }

    return (
        <Link href={`/product/${product.id}`} className='group max-xl:mx-auto relative block transition-all duration-300 hover:-translate-y-1.5'>
            <div className='bg-[#F5F5F5] dark:bg-slate-900/60 h-40 sm:w-60 sm:h-68 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-300 border border-slate-200/40 dark:border-slate-800/60 group-hover:border-green-500/30 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:group-hover:shadow-[0_8px_30px_rgba(0,201,80,0.06)]'>
                <Image width={500} height={500} className='max-h-30 sm:max-h-40 w-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out' src={product.images[0]} alt={product.name} />
                
                {/* Heart Wishlist Button */}
                <button
                    onClick={handleWishlistToggle}
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md text-slate-400 hover:text-red-500 shadow-md hover:scale-110 active:scale-95 transition cursor-pointer"
                    aria-label="Toggle Wishlist"
                >
                    <Heart
                        size={16}
                        className={isWishlisted ? "text-red-500 fill-red-500 transition-colors" : "transition-colors"}
                    />
                </button>
            </div>
            <div className='flex justify-between gap-3 text-sm text-slate-800 dark:text-slate-200 pt-2 max-w-60'>
                <div>
                    <p className='font-medium line-clamp-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200'>{product.name}</p>
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                        ))}
                    </div>
                </div>
                <p className='font-bold'>{currency}{product.price}</p>
            </div>
        </Link>
    )
}

export default ProductCard