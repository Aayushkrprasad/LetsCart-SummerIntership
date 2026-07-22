'use client'
import { StarIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ProductCard = ({ product }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';
    const rating = product.rating && product.rating.length > 0 
        ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length) 
        : 5;

    return (
        <Link href={`/product/${product.id}`} className='group w-full block max-w-xs mx-auto sm:max-w-none'>
            <div className='bg-[#F5F5F5] h-48 sm:h-60 rounded-2xl flex items-center justify-center p-4 transition-all duration-300 group-hover:bg-slate-100 group-hover:shadow-md'>
                <Image width={500} height={500} className='max-h-36 sm:max-h-44 w-auto object-contain group-hover:scale-105 transition duration-300' src={product.images[0]} alt="" />
            </div>
            <div className='flex justify-between items-start gap-2 text-sm text-slate-800 pt-3 px-1'>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 group-hover:text-green-600 transition truncate">{product.name}</p>
                    <div className='flex items-center gap-0.5 mt-1'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={14} className='text-transparent' fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                        ))}
                    </div>
                </div>
                <p className="font-bold text-slate-900 text-sm whitespace-nowrap">{currency}{product.price}</p>
            </div>
        </Link>
    )
}

export default ProductCard