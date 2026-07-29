'use client'
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { toast } from "react-hot-toast"
import { PackageCheck, ChevronRight, X } from "lucide-react"

export default function StoreOrders() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('letscart_token')
            const savedUser = localStorage.getItem('letscart_user')
            let userId = null
            if (savedUser) {
                try { userId = JSON.parse(savedUser).id } catch (e) {}
            }

            const url = userId ? `/api/store/orders?userId=${userId}` : '/api/store/orders'
            const res = await fetch(url, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            const data = await res.json()

            if (data.success && data.orders) {
                setOrders(data.orders)
            }
        } catch (err) {
            console.error("Seller orders fetch error:", err)
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId, status) => {
        try {
            const res = await fetch('/api/store/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status })
            })
            const data = await res.json()
            if (data.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
                toast.success(`Order status updated to ${status}`)
            } else {
                throw new Error(data.message)
            }
        } catch (err) {
            toast.error("Failed to update status")
        }
    }

    const openModal = (order) => {
        setSelectedOrder(order)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setSelectedOrder(null)
        setIsModalOpen(false)
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="max-w-5xl mb-20">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Store <span className="text-green-600">Customer Orders</span></h1>
            
            {orders.length === 0 ? (
                <div className="my-16 text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <PackageCheck size={40} className="mx-auto text-slate-400 mb-3" />
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No store orders received yet</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Incoming buyer orders will automatically appear here!</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
                    <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-5 py-4">Order #</th>
                                <th className="px-5 py-4">Customer</th>
                                <th className="px-5 py-4">Total</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4">Date</th>
                                <th className="px-5 py-4 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                            {orders.map((order, index) => {
                                const buyerName = order.buyer?.name || order.user?.name || 'Customer'
                                const total = order.totalAmount || order.total || 0
                                return (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition cursor-pointer"
                                        onClick={() => openModal(order)}
                                    >
                                        <td className="px-5 py-4 font-mono font-semibold text-green-600 dark:text-green-400">
                                            #{order.orderNumber || order.id.substring(0, 8)}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">{buyerName}</td>
                                        <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200">{currency}{total}</td>
                                        <td className="px-5 py-4" onClick={(e) => { e.stopPropagation() }}>
                                            <select
                                                value={order.status}
                                                onChange={e => updateOrderStatus(order.id, e.target.value)}
                                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold p-1.5 outline-none focus:border-green-500 cursor-pointer text-slate-800 dark:text-slate-200"
                                            >
                                                <option value="PENDING">PENDING</option>
                                                <option value="PAID">PAID</option>
                                                <option value="PROCESSING">PROCESSING</option>
                                                <option value="SHIPPED">SHIPPED</option>
                                                <option value="DELIVERED">DELIVERED</option>
                                            </select>
                                        </td>
                                        <td className="px-5 py-4 text-slate-400 text-xs">
                                            {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button className="p-1.5 text-slate-400 hover:text-green-600 transition">
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order Details Modal */}
            {isModalOpen && selectedOrder && (
                <div onClick={closeModal} className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs z-50 p-4">
                    <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 relative text-slate-800 dark:text-slate-200 max-h-[90vh] overflow-y-auto">
                        <button onClick={closeModal} className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition">
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold mb-4 border-b border-slate-100 dark:border-slate-900 pb-3">
                            Order Details #{selectedOrder.orderNumber || selectedOrder.id.substring(0, 8)}
                        </h2>

                        {/* Customer Info */}
                        <div className="mb-6 space-y-1 text-sm bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-green-600 dark:text-green-400 mb-2">Customer & Shipping Details</h3>
                            <p><strong className="text-slate-500">Name:</strong> {selectedOrder.buyer?.name || selectedOrder.user?.name || 'Customer'}</p>
                            <p><strong className="text-slate-500">Email:</strong> {selectedOrder.buyer?.email || selectedOrder.user?.email || 'N/A'}</p>
                            <p><strong className="text-slate-500">Total Paid:</strong> <span className="font-bold text-green-600 dark:text-green-400">{currency}{selectedOrder.totalAmount || selectedOrder.total}</span></p>
                        </div>

                        {/* Ordered Products */}
                        <div className="mb-6">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Line Items</h3>
                            <div className="space-y-3">
                                {(selectedOrder.items || selectedOrder.orderItems || []).map((item, i) => {
                                    const prod = item.product || { name: 'Product Item', images: ['/placeholder.png'], price: item.price }
                                    return (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                            <div className="w-12 h-12 bg-white dark:bg-slate-950 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                                                {prod.images && prod.images[0] ? (
                                                    <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <PackageCheck size={20} className="text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate">{prod.name}</p>
                                                <p className="text-xs text-slate-400">Qty: {item.quantity} • Unit Price: {currency}{item.price}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-900">
                            <button onClick={closeModal} className="px-5 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition cursor-pointer">
                                Close Window
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
