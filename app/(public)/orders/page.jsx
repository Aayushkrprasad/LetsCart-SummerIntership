'use client'
import PageTitle from "@/components/PageTitle"
import { useEffect, useState } from "react";
import OrderItem from "@/components/OrderItem";
import { orderDummyData } from "@/assets/assets";
import Loading from "@/components/Loading";
import Link from "next/link";
import { Sparkles, ShoppingBag, ArrowRight } from "lucide-react";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState([]);

    const fetchPastOrdersAndRecommendations = async () => {
        try {
            const token = localStorage.getItem('letscart_token');
            const savedUser = localStorage.getItem('letscart_user');
            let userId = null;

            if (savedUser) {
                try {
                    userId = JSON.parse(savedUser).id;
                } catch (e) {}
            }

            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            // Fetch Orders from API
            const url = userId ? `/api/orders?userId=${userId}` : '/api/orders';
            const res = await fetch(url, { headers });
            const data = await res.json();

            if (data.success && data.orders && data.orders.length > 0) {
                setOrders(data.orders);
            } else {
                setOrders(orderDummyData);
            }

            // Fetch Recommendations from AI engine
            const recUrl = userId ? `/api/recommendations?userId=${userId}` : '/api/recommendations';
            const recRes = await fetch(recUrl, { headers });
            const recData = await recRes.json();
            if (recData.success && recData.recommendations) {
                setRecommendations(recData.recommendations);
            }

        } catch (err) {
            console.error('Error loading orders & recommendations:', err);
            setOrders(orderDummyData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPastOrdersAndRecommendations();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="min-h-[70vh] mx-6 py-10">
            {orders.length > 0 ? (
                <div className="max-w-7xl mx-auto space-y-16">
                    <div>
                        <PageTitle heading="My Orders" text={`Showing total ${orders.length} past orders`} linkText={'go to home'} />

                        <table className="w-full max-w-5xl text-slate-500 table-auto border-separate border-spacing-y-12 border-spacing-x-4 mt-6">
                            <thead>
                                <tr className="max-sm:text-sm text-slate-600 max-md:hidden">
                                    <th className="text-left">Product</th>
                                    <th className="text-center">Total Price</th>
                                    <th className="text-left">Address</th>
                                    <th className="text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <OrderItem order={order} key={order.id} />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* AI Recommendations Section */}
                    {recommendations.length > 0 && (
                        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8 space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="text-yellow-500 fill-yellow-400" size={22} />
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">Recommended Based On Your Past Orders</h3>
                                        <p className="text-xs text-slate-500">Selected based on your purchase history and interests</p>
                                    </div>
                                </div>
                                <Link href="/shop" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                                    Explore All <ArrowRight size={14} />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                                {recommendations.slice(0, 4).map((item) => (
                                    <div key={item.id} className="bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-4 transition duration-300 hover:shadow-md flex flex-col justify-between">
                                        <div className="space-y-3">
                                            <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden relative flex items-center justify-center">
                                                {item.images && item.images[0] ? (
                                                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ShoppingBag size={36} className="text-slate-300" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-mono uppercase">{item.category}</p>
                                                <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{item.name}</h4>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                                            <span className="font-bold text-sm text-slate-900">₹{item.price}</span>
                                            <Link href={`/product/${item.id}`} className="px-3 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-xs font-semibold rounded-lg transition">
                                                View
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
                    <h1 className="text-2xl sm:text-4xl font-semibold">You have no orders yet</h1>
                </div>
            )}
        </div>
    );
}