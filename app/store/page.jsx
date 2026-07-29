'use client'
import Loading from "@/components/Loading"
import { CircleDollarSignIcon, ShoppingBasketIcon, StarIcon, TagsIcon, Store } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Dashboard() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [storeInfo, setStoreInfo] = useState(null)
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        totalEarnings: 0,
        totalOrders: 0,
        ratings: [],
    })

    const dashboardCardsData = [
        { title: 'Total Active Products', value: dashboardData.totalProducts, icon: ShoppingBasketIcon },
        { title: 'Total Revenue', value: currency + dashboardData.totalEarnings.toLocaleString(), icon: CircleDollarSignIcon },
        { title: 'Total Orders', value: dashboardData.totalOrders, icon: TagsIcon },
        { title: 'Store Rating', value: '5.0 ★', icon: StarIcon },
    ]

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('letscart_token')
            const savedUser = localStorage.getItem('letscart_user')
            let userId = null
            if (savedUser) {
                try { userId = JSON.parse(savedUser).id } catch (err) {}
            }

            const headers = token ? { 'Authorization': `Bearer ${token}` } : {}

            // Fetch Products
            const prodRes = await fetch(userId ? `/api/store/products?userId=${userId}` : '/api/store/products', { headers })
            const prodData = await prodRes.json()

            // Fetch Orders
            const orderRes = await fetch(userId ? `/api/store/orders?userId=${userId}` : '/api/store/orders', { headers })
            const orderData = await orderRes.json()

            const productsList = prodData.products || []
            const ordersList = orderData.orders || []
            const totalRevenue = ordersList.reduce((acc, curr) => acc + (curr.totalAmount || curr.total || 0), 0)

            setStoreInfo(prodData.store || null)
            setDashboardData({
                totalProducts: productsList.length,
                totalEarnings: totalRevenue,
                totalOrders: ordersList.length,
                ratings: [],
            })
        } catch (err) {
            console.error("Fetch seller dashboard error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-600 dark:text-slate-300 mb-28 max-w-5xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {storeInfo?.name || 'Seller'} <span className="text-green-600">Dashboard</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Live sales analytics and inventory performance</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 rounded-full text-xs font-bold">
                    <Store size={14} /> Approved Merchant
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-6">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center justify-between border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 rounded-2xl shadow-xs">
                            <div className="flex flex-col gap-1 text-xs">
                                <p className="text-slate-400 dark:text-slate-500 font-medium">{card.title}</p>
                                <b className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{card.value}</b>
                            </div>
                            <card.icon size={44} className="p-2.5 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 rounded-xl" />
                        </div>
                    ))
                }
            </div>

            {/* Quick Actions Bar */}
            <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex max-sm:flex-col items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Ready to grow your catalog?</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Add new products to showcase your items to thousands of buyers on LetsCart!</p>
                </div>
                <button 
                    onClick={() => router.push('/store/add-product')}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer text-sm shrink-0"
                >
                    + Add New Product
                </button>
            </div>
        </div>
    )
}