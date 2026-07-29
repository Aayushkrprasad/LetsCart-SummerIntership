'use client'
import { assets } from "@/assets/assets"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"

export default function CreateStore() {
    const router = useRouter()
    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const [storeInfo, setStoreInfo] = useState({
        name: "",
        username: "",
        description: "",
        email: "",
        contact: "",
        address: "",
        image: null
    })

    const onChangeHandler = (e) => {
        setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value })
    }

    const fetchSellerStatus = async () => {
        if (typeof window !== 'undefined') {
            const savedUser = localStorage.getItem('letscart_user')
            if (savedUser) {
                try {
                    const u = JSON.parse(savedUser)
                    setStoreInfo(prev => ({
                        ...prev,
                        name: `${u.name}'s Store`,
                        username: `store_${u.id.substring(0, 8)}`,
                        email: u.email
                    }))
                } catch (e) {}
            }
        }
        setLoading(false)
    }

    const onSubmitHandler = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setSubmitting(true);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('letscart_token') : null;
            const savedUser = typeof window !== 'undefined' ? localStorage.getItem('letscart_user') : null;
            let userId = null;
            if (savedUser) {
                try { userId = JSON.parse(savedUser).id; } catch (err) {}
            }

            const res = await fetch('/api/store/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    name: storeInfo.name || 'My Store',
                    username: storeInfo.username || `store_${Date.now()}`,
                    description: storeInfo.description || 'Official Store',
                    userId: userId
                })
            });

            const data = await res.json();
            setSubmitting(false);

            if (data.success) {
                toast.success('Store profile saved successfully!');
                setAlreadySubmitted(true);
                setStatus('approved');
                setMessage('Your store has been created and activated! Redirecting to seller dashboard...');
                setTimeout(() => {
                    router.push('/store');
                }, 1500);
            } else {
                toast.error(data.message || 'Failed to create store');
            }
        } catch (err) {
            setSubmitting(false);
            toast.error('Network error creating store');
        }
    }

    useEffect(() => {
        fetchSellerStatus()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="mx-6 min-h-[70vh] my-12">
            {!alreadySubmitted ? (
                <form onSubmit={onSubmitHandler} className="max-w-2xl mx-auto flex flex-col items-start gap-4 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Setup Your <span className="text-green-600">Store Profile</span></h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Fill out your store details to start listing products on LetsCart.</p>
                    </div>

                    <div className="w-full space-y-4 mt-4">
                        <label className="block">
                            <span className="font-semibold text-xs text-slate-600 dark:text-slate-400 uppercase">Store Name</span>
                            <input name="name" onChange={onChangeHandler} value={storeInfo.name} type="text" placeholder="Enter store name" className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-800 dark:text-slate-200 text-sm focus:border-green-500" required />
                        </label>

                        <label className="block">
                            <span className="font-semibold text-xs text-slate-600 dark:text-slate-400 uppercase">Store Username</span>
                            <input name="username" onChange={onChangeHandler} value={storeInfo.username} type="text" placeholder="Enter store username" className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-800 dark:text-slate-200 text-sm focus:border-green-500" required />
                        </label>

                        <label className="block">
                            <span className="font-semibold text-xs text-slate-600 dark:text-slate-400 uppercase">Description</span>
                            <textarea name="description" onChange={onChangeHandler} value={storeInfo.description} rows={3} placeholder="Describe your store and products..." className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-800 dark:text-slate-200 text-sm focus:border-green-500 resize-none" />
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="block">
                                <span className="font-semibold text-xs text-slate-600 dark:text-slate-400 uppercase">Email</span>
                                <input name="email" onChange={onChangeHandler} value={storeInfo.email} type="email" placeholder="store@example.com" className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-800 dark:text-slate-200 text-sm focus:border-green-500" />
                            </label>

                            <label className="block">
                                <span className="font-semibold text-xs text-slate-600 dark:text-slate-400 uppercase">Contact Number</span>
                                <input name="contact" onChange={onChangeHandler} value={storeInfo.contact} type="text" placeholder="+91 9876543210" className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-800 dark:text-slate-200 text-sm focus:border-green-500" />
                            </label>
                        </div>

                        <label className="block">
                            <span className="font-semibold text-xs text-slate-600 dark:text-slate-400 uppercase">Address</span>
                            <textarea name="address" onChange={onChangeHandler} value={storeInfo.address} rows={2} placeholder="Store location / business address" className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-800 dark:text-slate-200 text-sm focus:border-green-500 resize-none" />
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting} 
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-600/30 transition cursor-pointer mt-4 disabled:opacity-50"
                    >
                        {submitting ? 'Activating Store...' : 'Submit & Activate Store'}
                    </button>
                </form>
            ) : (
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                    <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 max-w-xl mb-3">{message}</p>
                    {status === "approved" && <p className="text-sm text-green-600 dark:text-green-400 font-semibold">Redirecting to your dashboard in 1.5 seconds...</p>}
                </div>
            )}
        </div>
    )
}