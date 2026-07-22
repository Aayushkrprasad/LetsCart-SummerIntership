'use client'
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ShoppingBag, Sparkles, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductOrbitShowcase from '@/components/ProductOrbitShowcase';

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [role, setRole] = useState('BUYER'); // 'BUYER' | 'SELLER'
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (mode === 'register') {
            if (formData.password !== formData.confirmPassword) {
                toast.error("Passwords do not match!");
                return;
            }
            if (!formData.agreeToTerms) {
                toast.error("Please accept the terms & conditions");
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: role
                })
            });

            const data = await res.json();
            setIsSubmitting(false);

            if (data.success) {
                toast.success(data.message || (mode === 'register' ? 'Account created in database!' : 'Welcome back!'));
                if (data.token) {
                    localStorage.setItem('letscart_token', data.token);
                    localStorage.setItem('letscart_user', JSON.stringify(data.user));
                    window.dispatchEvent(new Event('authChange'));
                }

                // Redirect based on role
                setTimeout(() => {
                    if (data.user?.role === 'SELLER') {
                        router.push('/create-store');
                    } else {
                        router.push('/');
                    }
                }, 800);
            } else {
                toast.error(data.message || 'Authentication failed');
            }
        } catch (err) {
            setIsSubmitting(false);
            toast.error('Network error connecting to auth server');
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-green-50/40 to-indigo-50/30 relative overflow-hidden">
            {/* Animated Floating Background Orbs */}
            <div className="absolute top-10 left-1/4 w-96 h-96 bg-green-300/30 rounded-full blur-3xl pointer-events-none animate-float-slow" />
            <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl pointer-events-none animate-float-reverse" />
            <div className="absolute top-1/2 left-10 w-72 h-72 bg-emerald-200/25 rounded-full blur-3xl pointer-events-none animate-pulse" />

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10 my-4">
                
                {/* Left Side: Circular Rotating Product Showcase */}
                <ProductOrbitShowcase />

                {/* Right Side: Auth Form Card */}
                <div className="w-full max-w-md mx-auto animate-card-pop">
                    {/* Brand Header */}
                    <div className="text-center mb-6">
                        <Link href="/" className="inline-flex items-center gap-2 text-3xl font-bold text-slate-800 tracking-tight hover:scale-105 transition-transform duration-300">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-green-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-green-500/30 group">
                                <ShoppingBag size={22} className="group-hover:rotate-12 transition-transform duration-300" />
                            </div>
                            <span><span className="text-green-600">Lets</span>Cart<span className="text-green-600 text-4xl">.</span></span>
                        </Link>
                        <p className="mt-2 text-sm text-slate-500 font-medium transition-all duration-300">
                            {mode === 'register' 
                                ? (role === 'SELLER' ? 'Set up your Store Owner account' : 'Create a Customer account to shop')
                                : 'Welcome back! Log in to access your account'}
                        </p>
                    </div>

                    {/* Main Auth Card with Glassmorphism & Soft Shadow Glow */}
                    <div className="bg-white/85 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-8 shadow-2xl shadow-slate-300/40 transition-all duration-300 hover:shadow-slate-300/60">
                        
                        {/* Animated Tab Switcher */}
                        <div className="relative flex bg-slate-100/90 p-1.5 rounded-2xl mb-6 text-sm font-medium">
                            <div 
                                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-md shadow-slate-200 transition-all duration-300 ease-out ${
                                    mode === 'register' ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setMode('login')}
                                className={`relative z-10 flex-1 py-2.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                                    mode === 'login' ? 'text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('register')}
                                className={`relative z-10 flex-1 py-2.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                                    mode === 'register' ? 'text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Sparkles size={14} className={mode === 'register' ? 'text-green-600 animate-spin' : 'opacity-0'} />
                                Create Account
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Account Type Role Selector (Register Mode Only) */}
                            {mode === 'register' && (
                                <div className="animate-field-fade mb-2">
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                        Account Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => setRole('BUYER')}
                                            className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                                                role === 'BUYER'
                                                    ? 'border-green-500 bg-green-50/60 ring-2 ring-green-500/20 text-slate-900'
                                                    : 'border-slate-200 bg-slate-50/50 text-slate-500 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <ShoppingBag size={18} className={role === 'BUYER' ? 'text-green-600' : 'text-slate-400'} />
                                                {role === 'BUYER' && <span className="w-2 h-2 rounded-full bg-green-500" />}
                                            </div>
                                            <div className="mt-2">
                                                <p className="text-xs font-bold text-slate-800">Customer</p>
                                                <p className="text-[10px] text-slate-500">Shop & buy products</p>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setRole('SELLER')}
                                            className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                                                role === 'SELLER'
                                                    ? 'border-green-500 bg-green-50/60 ring-2 ring-green-500/20 text-slate-900'
                                                    : 'border-slate-200 bg-slate-50/50 text-slate-500 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <Store size={18} className={role === 'SELLER' ? 'text-green-600' : 'text-slate-400'} />
                                                {role === 'SELLER' && <span className="w-2 h-2 rounded-full bg-green-500" />}
                                            </div>
                                            <div className="mt-2">
                                                <p className="text-xs font-bold text-slate-800">Store Owner</p>
                                                <p className="text-[10px] text-slate-500">Sell & list items</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Name Input (Register Mode Only) */}
                            {mode === 'register' && (
                                <div className="animate-field-fade">
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                        Full Name
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-green-600 transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email Input */}
                            <div className="animate-field-fade">
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-green-600 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="name@example.com"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="animate-field-fade">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Password
                                    </label>
                                    {mode === 'login' && (
                                        <a href="#" className="text-xs font-medium text-green-600 hover:text-green-700 transition-all hover:underline">
                                            Forgot Password?
                                        </a>
                                    )}
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-green-600 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password (Register Mode Only) */}
                            {mode === 'register' && (
                                <div className="animate-field-fade">
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                        Confirm Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-green-600 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Checkbox Options */}
                            {mode === 'login' ? (
                                <div className="flex items-center justify-between text-sm py-1 animate-field-fade">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500 accent-green-600 transition"
                                        />
                                        <span className="text-slate-600 text-xs font-medium group-hover:text-slate-800 transition-colors">Remember me for 30 days</span>
                                    </label>
                                </div>
                            ) : (
                                <div className="py-1 animate-field-fade">
                                    <label className="flex items-start gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            name="agreeToTerms"
                                            checked={formData.agreeToTerms}
                                            onChange={handleChange}
                                            className="w-4 h-4 mt-0.5 rounded border-slate-300 text-green-600 focus:ring-green-500 accent-green-600 transition"
                                        />
                                        <span className="text-slate-600 text-xs font-medium group-hover:text-slate-800 transition-colors">
                                            I agree to the <a href="#" className="text-green-600 hover:underline font-semibold">Terms of Service</a> and <a href="#" className="text-green-600 hover:underline font-semibold">Privacy Policy</a>
                                        </span>
                                    </label>
                                </div>
                            )}

                            {/* Animated CTA Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3.5 px-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:to-teal-700 active:scale-[0.98] hover:scale-[1.01] text-white font-semibold rounded-xl shadow-lg shadow-green-600/25 hover:shadow-green-600/40 transition-all duration-200 flex items-center justify-center gap-2 group mt-2 cursor-pointer disabled:opacity-75"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>
                                            {mode === 'login' 
                                                ? 'Sign In' 
                                                : (role === 'SELLER' ? 'Register Store Owner' : 'Create Customer Account')}
                                        </span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Social Login Divider */}
                        <div className="my-6 flex items-center gap-3">
                            <div className="flex-1 h-px bg-slate-200" />
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Or continue with</span>
                            <div className="flex-1 h-px bg-slate-200" />
                        </div>

                        {/* Social Interactive Animated Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => toast.success("Google Sign-In coming soon!")}
                                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer shadow-xs"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                </svg>
                                Google
                            </button>
                            <button
                                type="button"
                                onClick={() => toast.success("GitHub Sign-In coming soon!")}
                                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer shadow-xs"
                            >
                                <svg className="w-4 h-4 fill-slate-800" viewBox="0 0 24 24">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                            GitHub
                        </button>
                    </div>
                </div>

                {/* Bottom Helper Footer */}
                <p className="text-center text-xs text-slate-500 mt-6">
                    Protected by LetsCart Security • <Link href="/" className="text-green-600 hover:underline font-semibold transition-colors">Return to Store</Link>
                </p>
                </div>
            </div>
        </div>
    );
}
