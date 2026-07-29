'use client'

import { PlusIcon, SquarePenIcon, XIcon, CreditCard, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import AddressModal from './AddressModal';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '@/lib/features/cart/cartSlice';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const OrderSummary = ({ totalPrice, items }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';
    const router = useRouter();
    const dispatch = useDispatch();

    const addressList = useSelector(state => state.address?.list || []);

    const [paymentMethod, setPaymentMethod] = useState('STRIPE');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCouponCode = async (event) => {
        event.preventDefault();
        if (couponCodeInput.toUpperCase() === 'LETSCART10') {
            setCoupon({ code: 'LETSCART10', discount: 10, description: '10% OFF' });
            toast.success("10% Discount Applied!");
        } else {
            toast.error("Invalid Coupon Code");
        }
    }

    const handlePlaceOrder = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);

        try {
            let savedUser = null;
            let token = null;
            if (typeof window !== 'undefined') {
                const uStr = localStorage.getItem('letscart_user');
                token = localStorage.getItem('letscart_token');
                if (uStr) savedUser = JSON.parse(uStr);
            }

            // Convert Redux cartItems / props items format to [{ productId, quantity }]
            const formattedItems = Array.isArray(items) 
                ? items.map(item => ({ productId: item.id || item.productId, quantity: item.quantity || 1 }))
                : Object.entries(items || {}).map(([productId, quantity]) => ({ productId, quantity }));

            if (formattedItems.length === 0) {
                toast.error("Your cart is empty!");
                setLoading(false);
                return;
            }

            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    items: formattedItems,
                    buyerId: savedUser?.id,
                    origin: window.location.origin
                })
            });

            const data = await res.json();

            if (data.success && data.url) {
                dispatch(clearCart());
                toast.success("Redirecting to checkout...");
                window.location.href = data.url;
            } else {
                throw new Error(data.message || 'Checkout failed');
            }

        } catch (error) {
            console.error("Checkout submission error:", error);
            toast.error(error.message || "Failed to process checkout");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[360px] bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-sm rounded-2xl p-6 shadow-sm'>
            <h2 className='text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2'>
                Payment Summary
            </h2>

            <p className='text-slate-400 dark:text-slate-500 text-xs mt-4 mb-2 font-semibold uppercase tracking-wider'>
                Payment Option
            </p>
            <div className='space-y-2'>
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${paymentMethod === 'STRIPE' ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20 text-slate-800 dark:text-slate-200' : 'border-slate-200 dark:border-slate-800'}`}>
                    <input type="radio" id="STRIPE" name='payment' onChange={() => setPaymentMethod('STRIPE')} checked={paymentMethod === 'STRIPE'} className='accent-green-600' />
                    <div className="flex items-center gap-2 font-medium">
                        <CreditCard size={18} className="text-green-600 dark:text-green-400" />
                        Stripe Secured Checkout
                    </div>
                </label>
                
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${paymentMethod === 'COD' ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20 text-slate-800 dark:text-slate-200' : 'border-slate-200 dark:border-slate-800'}`}>
                    <input type="radio" id="COD" name='payment' onChange={() => setPaymentMethod('COD')} checked={paymentMethod === 'COD'} className='accent-green-600' />
                    <span className="font-medium">Cash on Delivery (COD)</span>
                </label>
            </div>

            <div className='my-4 py-4 border-y border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'>
                <p className="font-semibold text-xs text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">Shipping Address</p>
                {
                    selectedAddress ? (
                        <div className='flex gap-2 items-center justify-between bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800'>
                            <p className="text-xs truncate">{selectedAddress.name}, {selectedAddress.city}, {selectedAddress.state}</p>
                            <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer text-slate-400 hover:text-slate-600' size={16} />
                        </div>
                    ) : (
                        <div>
                            {
                                addressList.length > 0 && (
                                    <select className='border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-2 w-full my-2 outline-none rounded-xl text-xs' onChange={(e) => setSelectedAddress(addressList[e.target.value])} >
                                        <option value="">Select Delivery Address</option>
                                        {
                                            addressList.map((address, index) => (
                                                <option key={index} value={index}>{address.name}, {address.city}, {address.state}</option>
                                            ))
                                        }
                                    </select>
                                )
                            }
                            <button className='flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-semibold mt-1 cursor-pointer' onClick={() => setShowAddressModal(true)} >
                                <PlusIcon size={16} /> Add New Address
                            </button>
                        </div>
                    )
                }
            </div>

            {/* Calculations Breakdown */}
            <div className='pb-4 border-b border-slate-200 dark:border-slate-800 space-y-2'>
                <div className='flex justify-between text-slate-500 dark:text-slate-400'>
                    <p>Subtotal:</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{currency}{totalPrice.toLocaleString()}</p>
                </div>
                <div className='flex justify-between text-slate-500 dark:text-slate-400'>
                    <p>Shipping Fee:</p>
                    <p className="text-green-600 dark:text-green-400 font-semibold">Free</p>
                </div>
                {coupon && (
                    <div className='flex justify-between text-emerald-600 dark:text-emerald-400 font-medium'>
                        <p>Coupon Discount:</p>
                        <p>{`-${currency}${(coupon.discount / 100 * totalPrice).toFixed(2)}`}</p>
                    </div>
                )}

                {/* Coupon Form */}
                {
                    !coupon ? (
                        <form onSubmit={handleCouponCode} className='flex justify-center gap-2 mt-3'>
                            <input onChange={(e) => setCouponCodeInput(e.target.value)} value={couponCodeInput} type="text" placeholder='Coupon Code (LETSCART10)' className='border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 rounded-xl w-full outline-none text-xs text-slate-800 dark:text-slate-200' />
                            <button type="submit" className='bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white px-4 text-xs font-semibold rounded-xl transition cursor-pointer'>Apply</button>
                        </form>
                    ) : (
                        <div className='w-full flex items-center justify-between bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 p-2 rounded-xl text-xs mt-2'>
                            <p>Code: <span className='font-bold ml-1'>{coupon.code}</span> ({coupon.description})</p>
                            <XIcon size={16} onClick={() => setCoupon('')} className='hover:text-red-600 transition cursor-pointer' />
                        </div>
                    )
                }
            </div>

            <div className='flex justify-between py-4 text-base font-bold text-slate-800 dark:text-slate-100'>
                <p>Total Order Amount:</p>
                <p className="text-green-600 dark:text-green-400">{currency}{coupon ? (totalPrice - (coupon.discount / 100 * totalPrice)).toFixed(2) : totalPrice.toLocaleString()}</p>
            </div>

            <button 
                onClick={handlePlaceOrder} 
                disabled={loading || totalPrice === 0}
                className='w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-600/30 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50'
            >
                <ShieldCheck size={18} />
                {loading ? 'Processing Checkout...' : 'Proceed to Checkout'}
            </button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}
        </div>
    )
}

export default OrderSummary