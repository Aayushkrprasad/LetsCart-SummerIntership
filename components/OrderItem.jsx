'use client'
import Image from "next/image";
import { DotIcon, FileText } from "lucide-react";
import { useSelector } from "react-redux";
import Rating from "./Rating";
import { useState } from "react";
import RatingModal from "./RatingModal";

const OrderItem = ({ order }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';
    const [ratingModal, setRatingModal] = useState(null);

    const { ratings } = useSelector(state => state.rating || { ratings: [] });

    // Handle both Prisma order structure and dummy data structure safely
    const itemsList = order.items || order.orderItems || [];
    const totalAmount = order.totalAmount || order.total || 0;
    const address = order.address || { name: 'Customer', street: 'Standard Delivery', city: 'Main City', state: 'State', zip: '000000', country: 'IN', phone: '+91 9876543210' };
    const status = order.status || 'PAID';

    return (
        <>
            <tr className="text-sm text-slate-800 dark:text-slate-200">
                <td className="text-left py-4">
                    <div className="flex flex-col gap-6">
                        {itemsList.map((item, index) => {
                            const prod = item.product || { name: 'LetsCart Product', images: ['/placeholder.png'], price: item.price };
                            return (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="w-20 aspect-square bg-slate-100 dark:bg-slate-900 flex items-center justify-center rounded-xl overflow-hidden border border-transparent dark:border-slate-800">
                                        {prod.images && prod.images[0] ? (
                                            <Image
                                                className="h-14 w-auto object-cover"
                                                src={prod.images[0]}
                                                alt={prod.name}
                                                width={60}
                                                height={60}
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded" />
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center text-sm">
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-base">{prod.name}</p>
                                        <p className="text-slate-500 dark:text-slate-400">{currency}{item.price} • Qty: {item.quantity} </p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">{new Date(order.createdAt || Date.now()).toDateString()}</p>
                                        <div>
                                            {ratings && ratings.find(rating => order.id === rating.orderId && prod.id === rating.productId)
                                                ? <Rating value={ratings.find(rating => order.id === rating.orderId && prod.id === rating.productId).rating} />
                                                : <button onClick={() => setRatingModal({ orderId: order.id, productId: prod.id })} className={`text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 px-2 py-1 rounded transition text-xs font-semibold ${status !== "DELIVERED" && 'hidden'}`}>Rate Product</button>
                                            }
                                        </div>
                                        {ratingModal && <RatingModal ratingModal={ratingModal} setRatingModal={setRatingModal} />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </td>

                <td className="text-center font-bold text-base max-md:hidden text-slate-800 dark:text-slate-200">
                    {currency}{totalAmount}
                </td>

                <td className="text-left max-md:hidden text-xs text-slate-500 dark:text-slate-400">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{address.name}</p>
                    <p>{address.street}, {address.city}</p>
                    <p>{address.state}, {address.zip}, {address.country}</p>
                    <p className="mt-0.5 text-slate-400">{address.phone}</p>
                </td>

                <td className="text-left space-y-3 text-sm max-md:hidden">
                    <div
                        className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                            status === 'PAID' || status === 'DELIVERED' || status === 'delivered'
                                ? 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-950/50 border border-green-200 dark:border-green-800'
                                : status === 'PENDING' || status === 'confirmed'
                                    ? 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800'
                                    : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                        }`}
                    >
                        <DotIcon size={16} className="-mr-1" />
                        {status.split('_').join(' ').toLowerCase()}
                    </div>

                    <div>
                        <a
                            href={`/api/orders/invoice?orderId=${order.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 rounded-lg transition cursor-pointer"
                        >
                            <FileText size={14} /> Download Invoice
                        </a>
                    </div>
                </td>
            </tr>
            {/* Mobile View */}
            <tr className="md:hidden">
                <td colSpan={4} className="py-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-between gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            status === 'PAID' || status === 'DELIVERED'
                                ? 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300'
                                : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                        }`}>
                            {status.replace(/_/g, ' ').toLowerCase()}
                        </span>
                        <a
                            href={`/api/orders/invoice?orderId=${order.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 underline"
                        >
                            <FileText size={12} /> Invoice PDF
                        </a>
                    </div>
                </td>
            </tr>
            <tr>
                <td colSpan={4}>
                    <div className="border-b border-slate-200 dark:border-slate-800 w-full my-3" />
                </td>
            </tr>
        </>
    )
}

export default OrderItem