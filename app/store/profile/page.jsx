'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    Store, User, Mail, Phone, CreditCard, ShieldCheck, 
    Edit3, Plus, Package, ExternalLink, Save, CheckCircle, 
    AlertCircle, Sparkles, Building, ArrowUpRight, ArrowLeft, LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SellerProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('store'); // 'store' | 'account' | 'payouts'
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Seller Account State
    const [sellerData, setSellerData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'SELLER'
    });

    // Store State
    const [storeData, setStoreData] = useState({
        name: 'TechGear Official',
        username: 'techgear',
        description: 'Premium electronics, gadgets, smart devices and accessories.',
        status: 'approved',
        stripeAccountId: 'acct_1N23456789'
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedUser = localStorage.getItem('letscart_user');
            if (savedUser) {
                try {
                    const parsed = JSON.parse(savedUser);
                    setUser(parsed);
                    setSellerData({
                        name: parsed.name || 'Store Owner',
                        email: parsed.email || 'seller@letscart.com',
                        phone: parsed.phone || '+91 98123 45678',
                        role: 'SELLER'
                    });
                } catch (e) {
                    router.push('/login');
                }
            } else {
                router.push('/login');
            }
        }
    }, [router]);

    const handleSaveStore = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setIsEditing(false);
            toast.success('Store profile updated successfully!');
        }, 600);
    };

    const handleSaveAccount = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setIsEditing(false);
            const updatedUser = { ...user, name: sellerData.name, email: sellerData.email, phone: sellerData.phone };
            setUser(updatedUser);
            localStorage.setItem('letscart_user', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event('authChange'));
            toast.success('Seller profile updated!');
        }, 600);
    };

    const handleLogout = () => {
        localStorage.removeItem('letscart_token');
        localStorage.removeItem('letscart_user');
        window.dispatchEvent(new Event('authChange'));
        toast.success('Logged out successfully');
        router.push('/');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Back to Seller Dashboard */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/store"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
                    >
                        <ArrowLeft size={16} /> Back to Seller Dashboard
                    </Link>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                        Store Owner Portal
                    </span>
                </div>

                {/* Store Header Banner */}
                <div className="relative bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute left-1/3 -top-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Store Avatar / Logo */}
                        <div className="relative group">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white text-indigo-700 font-bold text-4xl flex items-center justify-center border-4 border-white/40 shadow-2xl uppercase">
                                <Store size={48} className="text-indigo-600" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-400 border-2 border-white rounded-full flex items-center justify-center shadow" title="Verified Store">
                                <ShieldCheck size={16} className="text-white" />
                            </div>
                        </div>

                        {/* Store Info */}
                        <div className="flex-1 text-center sm:text-left space-y-2">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{storeData.name}</h1>
                                <span className="px-3 py-1 bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                    ● Active Store
                                </span>
                            </div>
                            <p className="text-indigo-200 text-xs font-mono">
                                @{storeData.username} • Owner: <span className="text-white font-semibold">{sellerData.name}</span>
                            </p>
                            <p className="text-indigo-100/80 text-xs max-w-xl line-clamp-2 pt-1">
                                {storeData.description}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 self-center sm:self-start">
                            <Link
                                href="/store/add-product"
                                className="px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
                            >
                                <Plus size={16} /> Add Product
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-xs font-semibold backdrop-blur-md transition flex items-center gap-2"
                            >
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar Nav */}
                    <div className="lg:col-span-1 space-y-2">
                        <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200/80 space-y-1">
                            <button
                                onClick={() => setActiveTab('store')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                    activeTab === 'store'
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <Store size={18} />
                                Store Profile
                            </button>

                            <button
                                onClick={() => setActiveTab('account')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                    activeTab === 'account'
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <User size={18} />
                                Seller Account
                            </button>

                            <button
                                onClick={() => setActiveTab('payouts')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                    activeTab === 'payouts'
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <CreditCard size={18} />
                                Payouts & Stripe
                            </button>
                        </div>

                        {/* Quick Shortcuts */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-3">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Seller Tools</h4>
                            <div className="space-y-2 text-xs">
                                <Link
                                    href="/store/manage-product"
                                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700 transition"
                                >
                                    <span className="flex items-center gap-2"><Package size={16} className="text-indigo-600" /> Manage Products</span>
                                    <ArrowUpRight size={14} />
                                </Link>
                                <Link
                                    href="/store/orders"
                                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700 transition"
                                >
                                    <span className="flex items-center gap-2"><Building size={16} className="text-indigo-600" /> Store Orders</span>
                                    <ArrowUpRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">

                        {/* TAB 1: Store Profile Details */}
                        {activeTab === 'store' && (
                            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Store Information</h3>
                                        <p className="text-xs text-slate-500">Public store branding, description, and handle</p>
                                    </div>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                                        >
                                            <Edit3 size={15} />
                                            Edit Store Details
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleSaveStore} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                                Store Name
                                            </label>
                                            <input
                                                type="text"
                                                disabled={!isEditing}
                                                value={storeData.name}
                                                onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                                Store Username / Slug
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-3.5 text-slate-400 font-mono text-xs">@</span>
                                                <input
                                                    type="text"
                                                    disabled={!isEditing}
                                                    value={storeData.username}
                                                    onChange={(e) => setStoreData({ ...storeData, username: e.target.value })}
                                                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                                Store Description
                                            </label>
                                            <textarea
                                                rows={3}
                                                disabled={!isEditing}
                                                value={storeData.description}
                                                onChange={(e) => setStoreData({ ...storeData, description: e.target.value })}
                                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition resize-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                                Store Status
                                            </label>
                                            <input
                                                type="text"
                                                disabled
                                                value="APPROVED (Active Vendor)"
                                                className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-xl text-xs cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
                                            >
                                                <Save size={16} />
                                                {isSaving ? 'Saving...' : 'Save Store Details'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl transition cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}

                        {/* TAB 2: Seller Personal Account */}
                        {activeTab === 'account' && (
                            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Seller Account Information</h3>
                                        <p className="text-xs text-slate-500">Personal owner credentials (stored in `sellers` table)</p>
                                    </div>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                                        >
                                            <Edit3 size={15} />
                                            Edit Credentials
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleSaveAccount} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                                Owner Name
                                            </label>
                                            <div className="relative">
                                                <User size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    disabled={!isEditing}
                                                    value={sellerData.name}
                                                    onChange={(e) => setSellerData({ ...sellerData, name: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                                Business Email
                                            </label>
                                            <div className="relative">
                                                <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                                                <input
                                                    type="email"
                                                    disabled={!isEditing}
                                                    value={sellerData.email}
                                                    onChange={(e) => setSellerData({ ...sellerData, email: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                                Business Phone
                                            </label>
                                            <div className="relative">
                                                <Phone size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    disabled={!isEditing}
                                                    value={sellerData.phone}
                                                    onChange={(e) => setSellerData({ ...sellerData, phone: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                                Account Type
                                            </label>
                                            <input
                                                type="text"
                                                disabled
                                                value="Store Owner (SELLER)"
                                                className="w-full px-4 py-3 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-xl text-xs cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
                                            >
                                                <Save size={16} />
                                                {isSaving ? 'Saving...' : 'Save Account Details'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl transition cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}

                        {/* TAB 3: Stripe Payouts */}
                        {activeTab === 'payouts' && (
                            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
                                <div className="border-b border-slate-100 pb-4">
                                    <h3 className="text-lg font-bold text-slate-800">Stripe Connect Payouts</h3>
                                    <p className="text-xs text-slate-500">Receive payouts directly to your bank account for product sales</p>
                                </div>

                                <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl space-y-4 shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/30 flex items-center justify-center border border-indigo-400/30">
                                                <CreditCard size={20} className="text-indigo-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm">Stripe Account Linked</h4>
                                                <p className="text-xs text-slate-400 font-mono">{storeData.stripeAccountId}</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold uppercase">
                                            Active
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Payouts are automatically processed on a rolling 2-day schedule directly into your registered bank account.
                                    </p>
                                    <div className="pt-2 flex flex-wrap gap-3">
                                        <button
                                            onClick={() => toast.success("Opening Stripe Express Dashboard...")}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow"
                                        >
                                            Stripe Dashboard <ExternalLink size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}
