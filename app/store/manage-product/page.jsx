'use client'
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Loading from "@/components/Loading"
import { Trash2, Edit, PackageCheck, X, Upload, Link as LinkIcon, Save } from "lucide-react"

export default function StoreManageProducts() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
    const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health', 'Toys & Games', 'Sports & Outdoors', 'Books & Media', 'Food & Drink', 'Hobbies & Crafts', 'Others']

    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])
    const [editingProduct, setEditingProduct] = useState(null)
    const [editImageMode, setEditImageMode] = useState('upload')
    const [editForm, setEditForm] = useState({
        name: "",
        price: 0,
        stock: 50,
        category: "",
        description: "",
        imageUrl: ""
    })
    const [saving, setSaving] = useState(false)

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('letscart_token')
            const savedUser = localStorage.getItem('letscart_user')
            let userId = null
            if (savedUser) {
                try { userId = JSON.parse(savedUser).id } catch (err) {}
            }

            const url = userId ? `/api/store/products?userId=${userId}` : '/api/store/products'
            const res = await fetch(url, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            const data = await res.json()

            if (data.success && data.products) {
                setProducts(data.products)
            }
        } catch (err) {
            console.error("Fetch seller products error:", err)
        } finally {
            setLoading(false)
        }
    }

    const toggleStock = async (productId, currentStock) => {
        try {
            const newStock = currentStock > 0 ? 0 : 50
            const res = await fetch('/api/store/products', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, stock: newStock })
            })
            const data = await res.json()
            if (data.success) {
                setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p))
                toast.success(newStock > 0 ? "Stock Enabled (50 items)" : "Marked Out of Stock")
            }
        } catch (err) {
            toast.error("Failed to update stock status")
        }
    }

    const handleDeleteProduct = async (productId) => {
        if (!confirm("Are you sure you want to delete this product listing?")) return;
        try {
            const res = await fetch(`/api/store/products?productId=${productId}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            if (data.success) {
                setProducts(prev => prev.filter(p => p.id !== productId))
                toast.success("Listing deleted successfully")
            }
        } catch (err) {
            toast.error("Could not delete product")
        }
    }

    const openEditModal = (product) => {
        setEditingProduct(product)
        setEditForm({
            name: product.name,
            price: product.price,
            stock: product.stock,
            category: product.category,
            description: product.description,
            imageUrl: product.images && product.images[0] ? product.images[0] : ''
        })
    }

    const handleEditFileUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setEditForm(prev => ({ ...prev, imageUrl: reader.result }))
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSaveEdit = async (e) => {
        if (e && e.preventDefault) e.preventDefault()
        setSaving(true)

        try {
            const token = localStorage.getItem('letscart_token')
            const finalImage = editForm.imageUrl.trim() || (editingProduct.images && editingProduct.images[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'

            const res = await fetch('/api/store/products', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    productId: editingProduct.id,
                    name: editForm.name,
                    price: parseFloat(editForm.price) || 0,
                    stock: parseInt(editForm.stock) || 0,
                    category: editForm.category,
                    description: editForm.description,
                    images: [finalImage]
                })
            })

            const text = await res.text()
            let data = {}
            try {
                data = JSON.parse(text)
            } catch (e) {
                throw new Error("Server error: " + (text.slice(0, 100) || "Invalid response"))
            }

            setSaving(false)

            if (res.ok && data.success) {
                toast.success("Product listing updated!")
                setProducts(prev => prev.map(p => p.id === editingProduct.id ? { 
                    ...p, 
                    name: editForm.name,
                    price: parseFloat(editForm.price) || 0,
                    stock: parseInt(editForm.stock) || 0,
                    category: editForm.category,
                    description: editForm.description,
                    images: [finalImage]
                } : p))
                setEditingProduct(null)
            } else {
                throw new Error(data.message || 'Failed to update product')
            }
        } catch (err) {
            setSaving(false)
            console.error("Save product edit error:", err)
            toast.error(err.message || "Failed to update product details")
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="max-w-5xl mb-20">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Manage Store <span className="text-green-600">Listings</span></h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Showing {products.length} total active products</p>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="my-16 text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <PackageCheck size={40} className="mx-auto text-slate-400 mb-3" />
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No product listings found</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Click Add Product to publish your first item!</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 uppercase font-bold text-xs border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-5 py-4">Product</th>
                                <th className="px-5 py-4 hidden md:table-cell">Category</th>
                                <th className="px-5 py-4">Price</th>
                                <th className="px-5 py-4">Stock</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                            {products.map((product) => {
                                const inStock = (product.stock || 0) > 0
                                const imgSrc = product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'

                                return (
                                    <tr key={product.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition">
                                        <td className="px-5 py-4">
                                            <div className="flex gap-3 items-center">
                                                {/* Clean <img> tag to display both web URLs and data URIs cleanly */}
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-800">
                                                    <img 
                                                        src={imgSrc} 
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{product.name}</p>
                                                    <p className="text-xs text-slate-400 line-clamp-1">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 font-mono text-xs hidden md:table-cell">{product.category}</td>
                                        <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200">{currency}{product.price}</td>
                                        <td className="px-5 py-4">
                                            <button 
                                                onClick={() => toggleStock(product.id, product.stock)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${inStock ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'}`}
                                            >
                                                {inStock ? `In Stock (${product.stock})` : 'Out of Stock'}
                                            </button>
                                        </td>
                                        <td className="px-5 py-4 text-right space-x-1">
                                            {/* Edit Product Button */}
                                            <button 
                                                onClick={() => openEditModal(product)}
                                                className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40 rounded-lg transition cursor-pointer"
                                                title="Edit product details"
                                            >
                                                <Edit size={18} />
                                            </button>

                                            {/* Delete Product Button */}
                                            <button 
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                                                title="Delete product"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Product Modal */}
            {editingProduct && (
                <div onClick={() => setEditingProduct(null)} className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs z-50 p-4">
                    <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full p-6 relative text-slate-800 dark:text-slate-200 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setEditingProduct(null)} className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition">
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold mb-4 border-b border-slate-100 dark:border-slate-900 pb-3 flex items-center gap-2">
                            <Edit size={20} className="text-green-600" /> Edit Product Listing
                        </h2>

                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            {/* Dual Image Input Strategy for Editing */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                                <span className="font-bold text-xs uppercase text-slate-500 dark:text-slate-400 block mb-2">Update Product Image</span>
                                <div className="flex bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl mb-3 text-xs font-semibold max-w-xs">
                                    <button
                                        type="button"
                                        onClick={() => setEditImageMode('upload')}
                                        className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                                            editImageMode === 'upload' ? 'bg-white dark:bg-slate-950 text-green-600 shadow-xs' : 'text-slate-500'
                                        }`}
                                    >
                                        <Upload size={12} /> Upload File
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditImageMode('link')}
                                        className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                                            editImageMode === 'link' ? 'bg-white dark:bg-slate-950 text-green-600 shadow-xs' : 'text-slate-500'
                                        }`}
                                    >
                                        <LinkIcon size={12} /> Image Link
                                    </button>
                                </div>

                                {editImageMode === 'upload' ? (
                                    <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-white dark:bg-slate-950">
                                        <Upload size={20} className="text-green-600 mb-1" />
                                        <span className="text-xs font-bold">Choose new image file</span>
                                        <input type="file" accept="image/*" onChange={handleEditFileUpload} hidden />
                                    </label>
                                ) : (
                                    <input 
                                        type="url" 
                                        value={editForm.imageUrl} 
                                        onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} 
                                        placeholder="Paste image link URL..." 
                                        className="w-full p-2.5 bg-white dark:bg-slate-950 outline-none border border-slate-200 dark:border-slate-800 rounded-xl text-xs" 
                                    />
                                )}

                                {editForm.imageUrl && (
                                    <div className="mt-3 flex items-center gap-3">
                                        <img src={editForm.imageUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover border" />
                                        <span className="text-xs text-green-600 font-medium">✓ Image Selected</span>
                                    </div>
                                )}
                            </div>

                            <label className="block">
                                <span className="font-semibold text-xs text-slate-500 uppercase">Product Name</span>
                                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-green-500" required />
                            </label>

                            <label className="block">
                                <span className="font-semibold text-xs text-slate-500 uppercase">Description</span>
                                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-green-500 resize-none" required />
                            </label>

                            <div className="grid grid-cols-2 gap-3">
                                <label className="block">
                                    <span className="font-semibold text-xs text-slate-500 uppercase">Price (₹)</span>
                                    <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-green-500" required />
                                </label>
                                <label className="block">
                                    <span className="font-semibold text-xs text-slate-500 uppercase">Stock Quantity</span>
                                    <input type="number" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-green-500" required />
                                </label>
                            </div>

                            <label className="block">
                                <span className="font-semibold text-xs text-slate-500 uppercase">Category</span>
                                <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-green-500" required>
                                    {categories.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </label>

                            <div className="flex justify-end gap-3 pt-3">
                                <button type="button" onClick={() => setEditingProduct(null)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-sm">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50">
                                    <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}