'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { toggleWishlist } from "@/lib/features/wishlist/wishlistSlice";
import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

const ProductDetails = ({ product }) => {

    const productId = product.id;
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';

    const cart = useSelector(state => state.cart.cartItems);
    const wishlistItems = useSelector(state => state.wishlist?.items || []);
    const dispatch = useDispatch();
    const router = useRouter();

    const [mainImage, setMainImage] = useState(product.images[0]);
    const isWishlisted = wishlistItems.includes(productId);

    const addToCartHandler = () => {
        dispatch(addToCart({ productId }));
        toast.success("Added to cart!");
    }

    const handleWishlistToggle = () => {
        dispatch(toggleWishlist(productId));
        if (isWishlisted) {
            toast.success("Removed from wishlist");
        } else {
            toast.success("Added to wishlist ❤️");
        }

        if (typeof window !== 'undefined') {
            const savedUser = localStorage.getItem('letscart_user');
            const token = localStorage.getItem('letscart_token');
            if (savedUser && token) {
                try {
                    const user = JSON.parse(savedUser);
                    fetch('/api/wishlist', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ productId, userId: user.id })
                    }).catch(console.error);
                } catch (err) {}
            }
        }
    };

    const averageRating = product.rating && product.rating.length > 0 
        ? product.rating.reduce((acc, item) => acc + item.rating, 0) / product.rating.length 
        : 5;
    
    return (
        <div className="flex max-lg:flex-col gap-12">
            <div className="flex max-sm:flex-col-reverse gap-3">
                <div className="flex sm:flex-col gap-3">
                    {product.images.map((image, index) => (
                        <div key={index} onClick={() => setMainImage(product.images[index])} className="bg-slate-100 dark:bg-slate-900 flex items-center justify-center size-26 rounded-lg group cursor-pointer border border-transparent dark:border-slate-800">
                            <Image src={image} className="group-hover:scale-103 group-active:scale-95 transition" alt="" width={45} height={45} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center items-center h-100 sm:size-113 bg-slate-100 dark:bg-slate-900 rounded-lg border border-transparent dark:border-slate-800">
                    <Image src={mainImage} alt="" width={250} height={250} />
                </div>
            </div>
            <div className="flex-1">
                <h1 className="text-3xl font-semibold text-slate-800 dark:text-slate-200">{product.name}</h1>
                <div className='flex items-center mt-2'>
                    {Array(5).fill('').map((_, index) => (
                        <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                    ))}
                    <p className="text-sm ml-3 text-slate-500 dark:text-slate-400">{product.rating ? product.rating.length : 0} Reviews</p>
                </div>
                <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800 dark:text-slate-200">
                    <p> {currency}{product.price} </p>
                    <p className="text-xl text-slate-500 dark:text-slate-400 line-through">{currency}{product.mrp}</p>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <TagIcon size={14} />
                    <p>Save {((product.mrp - product.price) / product.mrp * 100).toFixed(0)}% right now</p>
                </div>
                <div className="flex items-end gap-4 mt-10">
                    {
                        cart[productId] && (
                            <div className="flex flex-col gap-3">
                                <p className="text-lg text-slate-800 dark:text-slate-200 font-semibold">Quantity</p>
                                <Counter productId={productId} />
                            </div>
                        )
                    }
                    <button onClick={() => !cart[productId] ? addToCartHandler() : router.push('/cart')} className="bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-10 py-3.5 text-sm font-medium rounded-xl hover:bg-slate-900 active:scale-95 transition cursor-pointer">
                        {!cart[productId] ? 'Add to Cart' : 'View Cart'}
                    </button>
                    
                    {/* Wishlist Heart Toggle Button */}
                    <button
                        onClick={handleWishlistToggle}
                        className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-red-500 dark:hover:border-red-500 text-slate-600 dark:text-slate-300 hover:text-red-500 transition cursor-pointer flex items-center gap-2 bg-white dark:bg-slate-950"
                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                        <Heart size={20} className={isWishlisted ? "text-red-500 fill-red-500 transition-colors" : "transition-colors"} />
                        <span className="text-sm font-semibold max-sm:hidden">{isWishlisted ? "Saved" : "Wishlist"}</span>
                    </button>
                </div>
                <hr className="border-gray-300 dark:border-slate-800 my-5" />
                <div className="flex flex-col gap-4 text-slate-500 dark:text-slate-400">
                    <p className="flex gap-3"> <EarthIcon className="text-slate-400 dark:text-slate-500" /> Free shipping worldwide </p>
                    <p className="flex gap-3"> <CreditCardIcon className="text-slate-400 dark:text-slate-500" /> 100% Secured Payment </p>
                    <p className="flex gap-3"> <UserIcon className="text-slate-400 dark:text-slate-500" /> Trusted by top brands </p>
                </div>

            </div>
        </div>
    )
}

export default ProductDetails