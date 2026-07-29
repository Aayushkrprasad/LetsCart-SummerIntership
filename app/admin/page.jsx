'use client'
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import { CircleDollarSignIcon, ShoppingBasketIcon, StoreIcon, TagsIcon, Truck, CheckCircle, XCircle, ShieldCheck } from "lucide-react"

export default function AdminDashboard() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'

    const [loading, setLoading] = useState(true)
    const [metrics, setMetrics] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalStores: 0,
        pendingStores: 0,
        totalProducts: 0,
        deliveryPartners: 0,
        buyers: 0,
        sellers: 0
    })
    const [stores, setStores] = useState([])

    const fetchAdminOverview = async () => {
        try {
            const token = localStorage.getItem('letscart_token')
            const res = await fetch('/api/admin/overview', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            const data = await res.json()

            if (data.success) {
                setMetrics(data.metrics)
                setStores(data.stores)
            }
        } catch (err) {
            console.error("Fetch admin overview error:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStoreStatus = async (storeId, newStatus) => {
        try {
            const res = await fetch('/api/admin/overview', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId, status: newStatus })
            })
            const data = await res.json()
            if (data.success) {
                toast.success(`Store application ${newStatus}!`)
                setStores(prev => prev.map(s => s.id === storeId ? { ...s, status: newStatus } : s))
            }
        } catch (err) {
            toast.error("Failed to update store status")
        }
    }

    useEffect(() => {
        fetchAdminOverview()
    }, [])

    if (loading) return <Loading />

    const dashboardCardsData = [
        { title: 'Total Revenue', value: `${currency}${metrics.totalRevenue.toLocaleString()}`, icon: CircleDollarSignIcon, color: 'text-green-600' },
        { title: 'Total Orders', value: metrics.totalOrders, icon: TagsIcon, color: 'text-blue-600' },
        { title: 'Active Stores', value: metrics.totalStores, icon: StoreIcon, color: 'text-purple-600' },
        { title: 'Total Products', value: metrics.totalProducts, icon: ShoppingBasketIcon, color: 'text-amber-600' },
        { title: 'Delivery Partners', value: metrics.deliveryPartners, icon: Truck, color: 'text-teal-600' }
    ]

    return (
        <div className="text-slate-600 dark:text-slate-300 max-w-7xl mb-28">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <ShieldCheck className="text-green-600" size={32} /> Master Platform <span className="text-green-600">Admin</span>
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform overview, store moderation, and ecosystem management.</p>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 my-8">
                {dashboardCardsData.map((card, index) => (
                    <div key={index} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{card.value}</h3>
                        </div>
                        <card.icon size={36} className={`p-2 bg-slate-100 dark:bg-slate-900 rounded-xl ${card.color}`} />
                    </div>
                ))}
            </div>

            {/* Store Moderation & Applications Table */}
            <div className="my-10">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Store Applications & Moderation</h2>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 uppercase font-bold text-xs border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-5 py-4">Store Name</th>
                                <th className="px-5 py-4">Owner Email</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4">Created Date</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                            {stores.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition">
                                    <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200">
                                        {s.name}
                                        <span className="block text-xs font-normal text-slate-400 font-mono">@{s.username}</span>
                                    </td>
                                    <td className="px-5 py-4 text-xs font-mono">{s.owner?.email || 'N/A'}</td>
                                    <td className="px-5 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            s.status === 'approved' 
                                                ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300' 
                                                : s.status === 'rejected'
                                                ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                        }`}>
                                            {s.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                                    <td className="px-5 py-4 text-right space-x-2">
                                        {s.status !== 'approved' && (
                                            <button 
                                                onClick={() => handleUpdateStoreStatus(s.id, 'approved')}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                                            >
                                                <CheckCircle size={14} /> Approve
                                            </button>
                                        )}
                                        {s.status !== 'rejected' && (
                                            <button 
                                                onClick={() => handleUpdateStoreStatus(s.id, 'rejected')}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                                            >
                                                <XCircle size={14} /> Reject
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}