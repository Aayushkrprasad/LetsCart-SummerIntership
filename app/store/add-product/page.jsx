'use client'
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Upload, Link as LinkIcon, Image as ImageIcon, Sparkles } from "lucide-react"

export default function StoreAddProduct() {
    const router = useRouter()
    const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health', 'Toys & Games', 'Sports & Outdoors', 'Books & Media', 'Food & Drink', 'Hobbies & Crafts', 'Others']

    const [imageMode, setImageMode] = useState('upload') // 'upload' | 'link'
    const [previewImage, setPreviewImage] = useState('')
    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: 0,
        price: 0,
        stock: 50,
        category: "",
        imageUrl: ""
    })
    const [loading, setLoading] = useState(false)

    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewImage(reader.result)
                setProductInfo(prev => ({ ...prev, imageUrl: reader.result }))
            }
            reader.readAsDataURL(file)
        }
    }

    const onSubmitHandler = async (e) => {
        if (e) e.preventDefault()
        setLoading(true)

        try {
            const token = localStorage.getItem('letscart_token')
            const savedUser = localStorage.getItem('letscart_user')
            let userId = null
            if (savedUser) {
                try { userId = JSON.parse(savedUser).id } catch (err) {}
            }

            const finalImage = previewImage.trim() || productInfo.imageUrl.trim() || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'

            const res = await fetch('/api/store/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    name: productInfo.name,
                    description: productInfo.description,
                    price: parseFloat(productInfo.price),
                    mrp: parseFloat(productInfo.mrp),
                    stock: parseInt(productInfo.stock) || 50,
                    category: productInfo.category,
                    images: [finalImage],
                    userId
                })
            })

            const data = await res.json()

            if (data.success) {
                toast.success("Product published successfully! 🎉")
                router.push('/store/manage-product')
            } else {
                throw new Error(data.message || 'Failed to add product')
            }

        } catch (error) {
            console.error("Add Product Error:", error)
            toast.error(error.message || "Could not add product")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className="text-slate-600 dark:text-slate-300 mb-28 max-w-2xl">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Add New <span className="text-green-600">Product</span></h1>
            
            {/* Dual Image Selection Strategy */}
            <div className="my-6 p-5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-3">Product Image</span>
                
                {/* Image Mode Switcher Tabs */}
                <div className="flex bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl mb-4 text-xs font-semibold max-w-xs">
                    <button
                        type="button"
                        onClick={() => setImageMode('upload')}
                        className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            imageMode === 'upload' ? 'bg-white dark:bg-slate-950 text-green-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Upload size={14} /> Upload File
                    </button>
                    <button
                        type="button"
                        onClick={() => setImageMode('link')}
                        className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            imageMode === 'link' ? 'bg-white dark:bg-slate-950 text-green-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <LinkIcon size={14} /> Image Web Link
                    </button>
                </div>

                {imageMode === 'upload' ? (
                    <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-green-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-white dark:bg-slate-950 transition">
                        <Upload size={28} className="text-green-600 mb-2" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Click to select image file from computer</span>
                        <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP up to 5MB</span>
                        <input type="file" accept="image/*" onChange={handleFileUpload} hidden />
                    </label>
                ) : (
                    <input 
                        type="url" 
                        name="imageUrl" 
                        onChange={(e) => { onChangeHandler(e); setPreviewImage(e.target.value); }} 
                        value={productInfo.imageUrl} 
                        placeholder="Paste image link URL (e.g. https://images.unsplash.com/...)" 
                        className="w-full p-3 bg-white dark:bg-slate-950 outline-none border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:border-green-500" 
                    />
                )}

                {/* Image Live Preview */}
                {previewImage && (
                    <div className="mt-4 flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white">
                            <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">✓ Image Preview Loaded</span>
                    </div>
                )}
            </div>

            <label className="flex flex-col gap-2 my-5">
                <span className="font-semibold text-sm">Product Name</span>
                <input type="text" name="name" onChange={onChangeHandler} value={productInfo.name} placeholder="e.g. Smart Waterproof Watch" className="w-full p-3 bg-white dark:bg-slate-900 outline-none border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:border-green-500" required />
            </label>

            <label className="flex flex-col gap-2 my-5">
                <span className="font-semibold text-sm">Description</span>
                <textarea name="description" onChange={onChangeHandler} value={productInfo.description} placeholder="Provide product features, specs, and details..." rows={4} className="w-full p-3 bg-white dark:bg-slate-900 outline-none border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:border-green-500 resize-none" required />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5">
                <label className="flex flex-col gap-2">
                    <span className="font-semibold text-sm">Original Price (₹)</span>
                    <input type="number" name="mrp" onChange={onChangeHandler} value={productInfo.mrp} placeholder="1999" className="w-full p-3 bg-white dark:bg-slate-900 outline-none border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:border-green-500" required />
                </label>
                <label className="flex flex-col gap-2">
                    <span className="font-semibold text-sm">Offer Price (₹)</span>
                    <input type="number" name="price" onChange={onChangeHandler} value={productInfo.price} placeholder="1499" className="w-full p-3 bg-white dark:bg-slate-900 outline-none border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:border-green-500" required />
                </label>
                <label className="flex flex-col gap-2">
                    <span className="font-semibold text-sm">Initial Stock Count</span>
                    <input type="number" name="stock" onChange={onChangeHandler} value={productInfo.stock} placeholder="50" className="w-full p-3 bg-white dark:bg-slate-900 outline-none border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:border-green-500" required />
                </label>
            </div>

            <div className="my-5">
                <span className="font-semibold text-sm block mb-2">Category</span>
                <select onChange={e => setProductInfo({ ...productInfo, category: e.target.value })} value={productInfo.category} className="w-full p-3 bg-white dark:bg-slate-900 outline-none border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:border-green-500" required>
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
            </div>

            <button 
                type="submit" 
                disabled={loading} 
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3.5 mt-4 rounded-xl shadow-lg shadow-green-600/30 transition cursor-pointer disabled:opacity-50"
            >
                {loading ? 'Publishing Product...' : 'Publish Product to Store'}
            </button>
        </form>
    )
}