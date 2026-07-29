'use client'
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Loading from "@/components/Loading"
import { Truck, PackageCheck, MapPin, CheckCircle2, Navigation, Edit3, Save, X } from "lucide-react"

export default function DeliveryPortal() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
    const popularRegions = ['Assam / Guwahati', 'Delhi NCR', 'Mumbai Metro', 'Kolkata Central', 'Bangalore Urban', 'All India']

    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState([])
    const [filter, setFilter] = useState('ALL')
    const [updatingId, setUpdatingId] = useState(null)
    const [preferredRegion, setPreferredRegion] = useState('Assam / Guwahati')
    const [editingRegion, setEditingRegion] = useState(false)
    const [tempRegion, setTempRegion] = useState('')

    const fetchDeliveryOrders = async () => {
        try {
            const token = localStorage.getItem('letscart_token')
            const savedUser = localStorage.getItem('letscart_user')
            let partnerId = null
            if (savedUser) {
                try { partnerId = JSON.parse(savedUser).id } catch (err) {}
            }

            const url = partnerId ? `/api/delivery/orders?partnerId=${partnerId}` : '/api/delivery/orders'
            const res = await fetch(url, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            const data = await res.json()

            if (data.success) {
                if (data.orders) setOrders(data.orders)
                if (data.partnerRegion) setPreferredRegion(data.partnerRegion)
            }
        } catch (err) {
            console.error("Fetch delivery orders error:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveRegion = async (newRegion) => {
        try {
            const savedUser = localStorage.getItem('letscart_user')
            let partnerId = null
            if (savedUser) {
                try { partnerId = JSON.parse(savedUser).id } catch (err) {}
            }

            if (!partnerId) {
                setPreferredRegion(newRegion)
                setEditingRegion(false)
                toast.success(`Active delivery zone changed to ${newRegion}`)
                return
            }

            const res = await fetch('/api/delivery/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ partnerId, region: newRegion })
            })

            const data = await res.json()
            if (data.success) {
                setPreferredRegion(newRegion)
                setEditingRegion(false)
                toast.success(`Preferred delivery region saved: "${newRegion}"!`)
                fetchDeliveryOrders()
            }
        } catch (err) {
            toast.error("Failed to update delivery region")
        }
    }

    const handleUpdateStatus = async (orderId, newStatus) => {
        setUpdatingId(orderId)
        try {
            const savedUser = localStorage.getItem('letscart_user')
            let partnerId = null
            if (savedUser) {
                try { partnerId = JSON.parse(savedUser).id } catch (err) {}
            }

            const res = await fetch('/api/delivery/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    status: newStatus,
                    partnerId
                })
            })

            const data = await res.json()
            setUpdatingId(null)

            if (data.success) {
                toast.success(`Package status updated to ${newStatus}! 🎉`)
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
            } else {
                throw new Error(data.message)
            }
        } catch (err) {
            setUpdatingId(null)
            toast.error("Failed to update package status")
        }
    }

    useEffect(() => {
        fetchDeliveryOrders()
    }, [])

    if (loading) return <Loading />

    const filteredOrders = orders.filter(order => {
        if (filter === 'PENDING') return order.status === 'PAID' || order.status === 'PROCESSING'
        if (filter === 'SHIPPED') return order.status === 'SHIPPED'
        if (filter === 'DELIVERED') return order.status === 'DELIVERED'
        return true
    })

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 mb-28 text-slate-700 dark:text-slate-200">
            {/* Preferred Location / Delivery Zone Banner */}
            <div className="mb-6 p-5 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shrink-0">
                        <Navigation size={26} className="animate-pulse" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-green-100 block">Assigned Delivery Region / Zone</span>
                        <h2 className="text-xl font-bold">{preferredRegion}</h2>
                    </div>
                </div>

                {/* Region Selector Modal or Quick Buttons */}
                {!editingRegion ? (
                    <button
                        onClick={() => { setEditingRegion(true); setTempRegion(preferredRegion); }}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
                    >
                        <Edit3 size={14} /> Change Delivery Zone
                    </button>
                ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-2 bg-white text-slate-800 p-2 rounded-2xl shadow-xl">
                        <input
                            type="text"
                            value={tempRegion}
                            onChange={(e) => setTempRegion(e.target.value)}
                            placeholder="Enter region/city/pincode..."
                            className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl outline-none"
                        />
                        <button
                            onClick={() => handleSaveRegion(tempRegion || 'All India')}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => setEditingRegion(false)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Header & Filter Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                        <div className="p-2.5 bg-green-600 text-white rounded-2xl shadow-lg shadow-green-600/30">
                            <Truck size={28} />
                        </div>
                        <span>LetsCart <span className="text-green-600">Dispatch Portal</span></span>
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Regional shipment dispatch & package tracking for {preferredRegion}.</p>
                </div>

                {/* Filter Switcher Tabs */}
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl text-xs font-semibold self-start md:self-auto border border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-2 rounded-xl transition cursor-pointer ${filter === 'ALL' ? 'bg-white dark:bg-slate-950 text-green-600 shadow-xs' : 'text-slate-500'}`}
                    >
                        All ({orders.length})
                    </button>
                    <button
                        onClick={() => setFilter('PENDING')}
                        className={`px-4 py-2 rounded-xl transition cursor-pointer ${filter === 'PENDING' ? 'bg-white dark:bg-slate-950 text-amber-600 shadow-xs' : 'text-slate-500'}`}
                    >
                        Ready for Pickup
                    </button>
                    <button
                        onClick={() => setFilter('SHIPPED')}
                        className={`px-4 py-2 rounded-xl transition cursor-pointer ${filter === 'SHIPPED' ? 'bg-white dark:bg-slate-950 text-blue-600 shadow-xs' : 'text-slate-500'}`}
                    >
                        In Transit
                    </button>
                    <button
                        onClick={() => setFilter('DELIVERED')}
                        className={`px-4 py-2 rounded-xl transition cursor-pointer ${filter === 'DELIVERED' ? 'bg-white dark:bg-slate-950 text-emerald-600 shadow-xs' : 'text-slate-500'}`}
                    >
                        Delivered
                    </button>
                </div>
            </div>

            {/* Orders Dispatch Cards Grid */}
            {filteredOrders.length === 0 ? (
                <div className="my-16 text-center py-16 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <PackageCheck size={48} className="mx-auto text-slate-400 mb-3" />
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No regional shipments found</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">There are currently no active deliveries in {preferredRegion}.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredOrders.map((order) => {
                        const isDelivered = order.status === 'DELIVERED'
                        const isShipped = order.status === 'SHIPPED'

                        return (
                            <div key={order.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition">
                                <div>
                                    {/* Order Top Badge Header */}
                                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-900 pb-3">
                                        <div>
                                            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Order #{order.orderNumber || order.id.slice(0, 8)}</span>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                <MapPin size={13} className="text-green-600" /> Zone: {order.deliveryRegion || preferredRegion}
                                            </div>
                                        </div>
                                        <span className={`px-3.5 py-1 rounded-full text-xs font-bold ${
                                            isDelivered 
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                                                : isShipped 
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    {/* Customer & Address Details */}
                                    <div className="my-3 space-y-2">
                                        <div className="flex items-start gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                                            <MapPin size={18} className="text-red-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p>Customer: {order.buyer?.name || 'Customer'}</p>
                                                <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">{order.buyer?.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div className="my-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white dark:bg-slate-950 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                                                    <img src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{item.product?.name || 'Item'}</p>
                                                    <p className="text-[11px] text-slate-500">Qty: {item.quantity} • {currency}{item.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Delivery Action Buttons */}
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between">
                                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{currency}{order.totalAmount}</span>

                                    <div className="flex gap-2">
                                        {!isShipped && !isDelivered && (
                                            <button
                                                onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                                                disabled={updatingId === order.id}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
                                            >
                                                <Truck size={14} /> Out for Delivery
                                            </button>
                                        )}

                                        {!isDelivered && (
                                            <button
                                                onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                                                disabled={updatingId === order.id}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
                                            >
                                                <CheckCircle2 size={14} /> Mark Delivered
                                            </button>
                                        )}

                                        {isDelivered && (
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                <CheckCircle2 size={16} /> Delivery Complete
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
