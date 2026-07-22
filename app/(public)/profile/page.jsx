'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    User, Mail, Phone, MapPin, Package, Heart, Lock, Shield, 
    Edit3, Plus, Trash2, CheckCircle2, ShoppingBag, ArrowRight,
    Sparkles, KeyRound, AlertCircle, Save, LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'addresses' | 'security' | 'orders'
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Profile Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        avatar: ''
    });

    // Password Change State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Addresses List State
    const [addresses, setAddresses] = useState([
        {
            id: 'addr-1',
            fullName: 'Aayush Kumar Prasad',
            phone: '+91 98765 43210',
            street: 'Flat 402, Green Valley Heights, MG Road',
            city: 'Bengaluru',
            state: 'Karnataka',
            zipCode: '560001',
            country: 'India',
            isDefault: true
        }
    ]);

    // New Address Form State
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        isDefault: false
    });

    const [pastOrders, setPastOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [isPersonalized, setIsPersonalized] = useState(false);
    const [categoriesAnalyzed, setCategoriesAnalyzed] = useState([]);

    const fetchPastOrders = async (userId) => {
        try {
            setLoadingOrders(true);
            const token = localStorage.getItem('letscart_token');
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`/api/orders?userId=${userId}`, { headers });
            const data = await res.json();
            if (data.success && data.orders) {
                setPastOrders(data.orders);
            }
        } catch (err) {
            console.error('Failed to load past orders:', err);
        } finally {
            setLoadingOrders(false);
        }
    };

    const fetchRecommendations = async (userId) => {
        try {
            const token = localStorage.getItem('letscart_token');
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`/api/recommendations?userId=${userId}`, { headers });
            const data = await res.json();
            if (data.success && data.recommendations) {
                setRecommendations(data.recommendations);
                setIsPersonalized(data.personalized);
                setCategoriesAnalyzed(data.categoriesAnalyzed || []);
            }
        } catch (err) {
            console.error('Failed to load recommendations:', err);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedUser = localStorage.getItem('letscart_user');
            if (savedUser) {
                try {
                    const parsed = JSON.parse(savedUser);
                    setUser(parsed);
                    setFormData({
                        name: parsed.name || '',
                        email: parsed.email || '',
                        phone: parsed.phone || '+91 98765 43210',
                        avatar: parsed.avatar || ''
                    });
                    fetchPastOrders(parsed.id);
                    fetchRecommendations(parsed.id);
                } catch (e) {
                    router.push('/login');
                }
            } else {
                router.push('/login');
            }
        }
    }, [router]);

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setIsEditing(false);
            const updatedUser = { ...user, name: formData.name, email: formData.email, phone: formData.phone };
            setUser(updatedUser);
            localStorage.setItem('letscart_user', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event('authChange'));
            toast.success('Profile details updated successfully!');
        }, 600);
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }
        toast.success('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const handleAddAddress = (e) => {
        e.preventDefault();
        const addressObj = {
            id: `addr-${Date.now()}`,
            ...newAddress
        };

        if (newAddress.isDefault) {
            setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(addressObj));
        } else {
            setAddresses(prev => [...prev, addressObj]);
        }

        setShowAddressForm(false);
        setNewAddress({
            fullName: '',
            phone: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India',
            isDefault: false
        });
        toast.success('New address added!');
    };

    const handleDeleteAddress = (id) => {
        setAddresses(prev => prev.filter(a => a.id !== id));
        toast.success('Address removed');
    };

    const handleSetDefaultAddress = (id) => {
        setAddresses(prev => prev.map(a => ({
            ...a,
            isDefault: a.id === id
        })));
        toast.success('Default address updated');
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
        <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Profile Header Banner */}
                <div className="relative bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute left-1/2 -top-10 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white text-green-700 font-bold text-4xl flex items-center justify-center border-4 border-white/40 shadow-2xl uppercase">
                                {user.name ? user.name[0] : 'U'}
                            </div>
                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-400 border-2 border-white rounded-full flex items-center justify-center shadow">
                                <CheckCircle2 size={14} className="text-white" />
                            </div>
                        </div>

                        {/* User Metadata */}
                        <div className="flex-1 text-center sm:text-left space-y-2">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{user.name}</h1>
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-emerald-100 border border-white/30">
                                    Customer Account
                                </span>
                            </div>
                            <p className="text-emerald-100/90 text-sm flex items-center justify-center sm:justify-start gap-2">
                                <Mail size={16} />
                                {user.email}
                            </p>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-emerald-100/80 pt-1">
                                <span className="flex items-center gap-1.5">
                                    <Shield size={14} /> Verified Member
                                </span>
                                <span>•</span>
                                <span>Joined 2026</span>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/30 rounded-xl text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer self-center sm:self-start"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1 space-y-2">
                        <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200/80 space-y-1">
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                    activeTab === 'personal'
                                        ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <User size={18} />
                                Personal Info
                            </button>

                            <button
                                onClick={() => setActiveTab('addresses')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                    activeTab === 'addresses'
                                        ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <MapPin size={18} />
                                Saved Addresses
                                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border font-medium">
                                    {addresses.length}
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                    activeTab === 'orders'
                                        ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <Package size={18} />
                                Order History
                            </button>

                            <button
                                onClick={() => setActiveTab('recommendations')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                    activeTab === 'recommendations'
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                        : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                            >
                                <Sparkles size={18} className="text-yellow-400" />
                                Recommended for You
                                {recommendations.length > 0 && (
                                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                        AI
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                    activeTab === 'security'
                                        ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <Lock size={18} />
                                Account Security
                            </button>
                        </div>

                        {/* Store Switch Banner */}
                        <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg space-y-3">
                            <div className="flex items-center gap-2">
                                <Sparkles size={20} className="text-yellow-300" />
                                <h4 className="font-bold text-sm">Become a Seller!</h4>
                            </div>
                            <p className="text-xs text-indigo-100 leading-relaxed">
                                Open your own Store on LetsCart and start selling products to thousands of customers.
                            </p>
                            <Link
                                href="/create-store"
                                className="block text-center py-2 px-3 bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-bold rounded-xl shadow transition"
                            >
                                Create Store
                            </Link>
                        </div>
                    </div>

                    {/* Main Tab Content */}
                    <div className="lg:col-span-3">

                        {/* TAB 1: Personal Info */}
                        {activeTab === 'personal' && (
                            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
                                        <p className="text-xs text-slate-500">Manage your basic account details and contacts</p>
                                    </div>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                                        >
                                            <Edit3 size={15} />
                                            Edit Details
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleProfileSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <User size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    disabled={!isEditing}
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                                                <input
                                                    type="email"
                                                    disabled={!isEditing}
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                                Phone Number
                                            </label>
                                            <div className="relative">
                                                <Phone size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    disabled={!isEditing}
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                                Account Role
                                            </label>
                                            <input
                                                type="text"
                                                disabled
                                                value="Customer (BUYER)"
                                                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 font-semibold cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-green-600/20 transition cursor-pointer"
                                            >
                                                <Save size={16} />
                                                {isSaving ? 'Saving...' : 'Save Changes'}
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

                        {/* TAB 2: Saved Addresses */}
                        {activeTab === 'addresses' && (
                            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Saved Addresses</h3>
                                        <p className="text-xs text-slate-500">Manage delivery locations for checkout</p>
                                    </div>
                                    <button
                                        onClick={() => setShowAddressForm(!showAddressForm)}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-green-600/20 transition cursor-pointer"
                                    >
                                        <Plus size={16} />
                                        Add New Address
                                    </button>
                                </div>

                                {/* Add Address Form */}
                                {showAddressForm && (
                                    <form onSubmit={handleAddAddress} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-card-pop">
                                        <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                            <MapPin size={16} className="text-green-600" /> New Delivery Address
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                required
                                                value={newAddress.fullName}
                                                onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                                                className="p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-green-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Phone Number"
                                                required
                                                value={newAddress.phone}
                                                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                                className="p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-green-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Street Address / Flat No."
                                                required
                                                value={newAddress.street}
                                                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                                className="sm:col-span-2 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-green-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="City"
                                                required
                                                value={newAddress.city}
                                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                className="p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-green-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="State"
                                                required
                                                value={newAddress.state}
                                                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                                className="p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-green-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Zip / Postal Code"
                                                required
                                                value={newAddress.zipCode}
                                                onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                                                className="p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-green-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Country"
                                                required
                                                value={newAddress.country}
                                                onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                                                className="p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-green-500"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={newAddress.isDefault}
                                                    onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                                                    className="rounded border-slate-300 text-green-600 accent-green-600"
                                                />
                                                Set as default address
                                            </label>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddressForm(false)}
                                                    className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-xl shadow"
                                                >
                                                    Save Address
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                )}

                                {/* Address Cards List */}
                                <div className="space-y-4">
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            className={`p-5 rounded-2xl border transition-all ${
                                                addr.isDefault
                                                    ? 'border-green-500 bg-green-50/40 ring-2 ring-green-500/20'
                                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-sm text-slate-800">{addr.fullName}</h4>
                                                        {addr.isDefault && (
                                                            <span className="px-2.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-600">{addr.street}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {addr.city}, {addr.state} - {addr.zipCode}, {addr.country}
                                                    </p>
                                                    <p className="text-xs text-slate-500 font-medium pt-1">Phone: {addr.phone}</p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {!addr.isDefault && (
                                                        <button
                                                            onClick={() => handleSetDefaultAddress(addr.id)}
                                                            className="text-xs text-slate-500 hover:text-green-600 underline font-medium"
                                                        >
                                                            Set Default
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteAddress(addr.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete Address"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB 3: Order History */}
                        {activeTab === 'orders' && (
                            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Order History</h3>
                                        <p className="text-xs text-slate-500">Track and view your recent purchases</p>
                                    </div>
                                    <Link
                                        href="/orders"
                                        className="flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700"
                                    >
                                        View Full Orders Page <ArrowRight size={14} />
                                    </Link>
                                </div>

                                {pastOrders.length > 0 ? (
                                    <div className="space-y-4">
                                        {pastOrders.map((order) => (
                                            <div key={order.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all space-y-3">
                                                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 text-xs">
                                                    <div>
                                                        <span className="font-bold text-slate-800">Order #{order.orderNumber || order.id.slice(0, 8)}</span>
                                                        <p className="text-slate-400">{new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString()}</p>
                                                    </div>
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full text-[10px] uppercase">
                                                        {order.status || 'PAID'}
                                                    </span>
                                                </div>

                                                <div className="space-y-2">
                                                    {order.items?.map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between text-xs py-1">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 font-bold flex items-center justify-center text-xs">
                                                                    <Package size={14} />
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-800">{item.product?.name || 'Purchased Item'}</p>
                                                                    <p className="text-slate-500">Qty: {item.quantity} • ₹{item.price}</p>
                                                                </div>
                                                            </div>
                                                            <span className="font-bold text-slate-700">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs font-bold text-slate-800">
                                                    <span>Total Paid</span>
                                                    <span className="text-sm text-green-600">₹{order.totalAmount?.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                                            <ShoppingBag size={24} />
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-sm">No orders found yet</h4>
                                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                            Your completed and active orders will show up here once you place a purchase.
                                        </p>
                                        <Link
                                            href="/shop"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold text-xs rounded-xl shadow hover:bg-green-700 transition"
                                        >
                                            Browse Store Catalog
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 4: AI Recommendations */}
                        {activeTab === 'recommendations' && (
                            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
                                <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="text-yellow-500 fill-yellow-400" size={20} />
                                            <h3 className="text-lg font-bold text-slate-800">Recommended For You</h3>
                                        </div>
                                        <p className="text-xs text-slate-500 pt-0.5">
                                            {isPersonalized
                                                ? `Personalized picks based on your past purchases (${categoriesAnalyzed.join(', ')})`
                                                : 'Top picks and trending products curated for you'}
                                        </p>
                                    </div>
                                    <Link
                                        href="/shop"
                                        className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                                    >
                                        View All Shop Catalog <ArrowRight size={14} />
                                    </Link>
                                </div>

                                {recommendations.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {recommendations.map((item) => (
                                            <div key={item.id} className="group border border-slate-200/90 hover:border-emerald-500 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg bg-white flex flex-col justify-between">
                                                <div className="space-y-3">
                                                    <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden relative flex items-center justify-center">
                                                        {item.images && item.images[0] ? (
                                                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                        ) : (
                                                            <ShoppingBag size={40} className="text-slate-300" />
                                                        )}
                                                        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full shadow">
                                                            {item.category || 'Featured'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-mono text-slate-400 uppercase">{item.store?.name || 'LetsCart Store'}</p>
                                                        <h4 className="font-bold text-sm text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition">{item.name}</h4>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
                                                    <span className="font-extrabold text-base text-slate-900">₹{item.price}</span>
                                                    <Link
                                                        href={`/product/${item.id}`}
                                                        className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-xs font-bold rounded-xl transition"
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                                            <Sparkles size={24} />
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-sm">Recommendations loading...</h4>
                                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                            As you browse and purchase items, your AI recommendation feed will update automatically!
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'security' && (
                            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
                                <div className="border-b border-slate-100 pb-4">
                                    <h3 className="text-lg font-bold text-slate-800">Account Security</h3>
                                    <p className="text-xs text-slate-500">Update password and manage security preferences</p>
                                </div>

                                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-green-600/20 transition cursor-pointer pt-2"
                                    >
                                        <KeyRound size={16} />
                                        Update Password
                                    </button>
                                </form>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}
