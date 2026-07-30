'use client'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, Store, ChevronDown, Sun, Moon, Truck, ShieldCheck, ShoppingBag } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const StoreNavbar = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [theme, setTheme] = useState('light');
    const [mounted, setMounted] = useState(false);

    const checkUser = () => {
        if (typeof window !== 'undefined') {
            const savedUser = localStorage.getItem('letscart_user');
            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch (e) {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        }
    };

    useEffect(() => {
        checkUser();
        setMounted(true);
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? 'dark' : 'light');

        window.addEventListener('authChange', checkUser);
        window.addEventListener('storage', checkUser);

        return () => {
            window.removeEventListener('authChange', checkUser);
            window.removeEventListener('storage', checkUser);
        };
    }, []);

    const toggleTheme = () => {
        if (theme === 'light') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setTheme('dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setTheme('light');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('letscart_token');
        localStorage.removeItem('letscart_user');
        setUser(null);
        setDropdownOpen(false);
        window.dispatchEvent(new Event('authChange'));
        toast.success("Logged out successfully");
        router.push('/');
    };

    const handleSwitchRole = async (targetRole) => {
        setDropdownOpen(false);
        try {
            const token = localStorage.getItem('letscart_token');
            if (!token) return;

            const res = await fetch('/api/auth/switch-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ targetRole })
            });

            const data = await res.json();
            if (data.success && data.token) {
                localStorage.setItem('letscart_token', data.token);
                localStorage.setItem('letscart_user', JSON.stringify(data.user));
                window.dispatchEvent(new Event('authChange'));
                toast.success(data.message || `Switched to ${targetRole}!`);
                
                if (targetRole === 'SELLER') {
                    router.push('/store');
                } else if (targetRole === 'DELIVERY') {
                    router.push('/delivery');
                } else if (targetRole === 'ADMIN') {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            } else {
                toast.error(data.message || 'Failed to switch profiles');
            }
        } catch (err) {
            console.error("Role switch error:", err);
            toast.error("Role switch connection error");
        }
    };

    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all">
            <Link href="/" className="relative text-4xl font-semibold text-slate-700 dark:text-slate-200">
                <span className="text-green-600">go</span>cart<span className="text-green-600 text-5xl leading-0">.</span>
                <p className="absolute text-xs font-semibold -top-1 -right-11 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                    Store
                </p>
            </Link>

            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    aria-label="Toggle theme"
                >
                    {!mounted ? (
                        <div className="w-5 h-5" />
                    ) : theme === 'dark' ? (
                        <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
                    ) : (
                        <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform duration-300 hover:-rotate-12" />
                    )}
                </button>

                {/* User Profile Dropdown */}
                {user ? (
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-800 dark:text-slate-200 text-sm font-semibold transition cursor-pointer border border-transparent dark:border-slate-800"
                        >
                            <div className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                                {user.name ? user.name[0] : 'U'}
                            </div>
                            <span className="max-w-[100px] truncate">{user.name || 'Account'}</span>
                            <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-950 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800/80 py-2 z-50 text-sm animate-card-pop">
                                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-900 mb-1">
                                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                                    <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${user.role === 'SELLER' ? 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300' : user.role === 'DELIVERY' ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300' : user.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300' : 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300'}`}>
                                        {user.role === 'SELLER' ? 'Store Owner' : user.role === 'DELIVERY' ? 'Delivery Partner' : user.role === 'ADMIN' ? 'Master Admin' : 'Customer'}
                                    </span>
                                </div>

                                <Link
                                    href={user.role === 'SELLER' ? '/store/profile' : '/profile'}
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
                                >
                                    <User size={16} className="text-green-600 dark:text-green-500" />
                                    My Account Profile
                                </Link>

                                {user.role === 'SELLER' && (
                                    <Link
                                        href="/store"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition font-bold"
                                    >
                                        <Store size={16} className="text-indigo-600 dark:text-indigo-400" />
                                        My Store Dashboard
                                    </Link>
                                )}

                                {user.hasMultipleRoles && user.availableRoles && (
                                    <div className="border-t border-b border-slate-100 dark:border-slate-900 my-1 py-1">
                                        <span className="px-4 py-1 text-[10px] uppercase font-bold text-slate-400 block">Switch Profile</span>
                                        {user.availableRoles.map(availRole => {
                                            if (availRole === user.role) return null;
                                            
                                            let roleLabel = 'Customer';
                                            let roleIcon = <ShoppingBag size={14} className="text-green-600" />;
                                            if (availRole === 'SELLER') {
                                                roleLabel = 'Seller Store';
                                                roleIcon = <Store size={14} className="text-indigo-600" />;
                                            } else if (availRole === 'DELIVERY') {
                                                roleLabel = 'Delivery Dispatch';
                                                roleIcon = <Truck size={14} className="text-amber-500" />;
                                            } else if (availRole === 'ADMIN') {
                                                roleLabel = 'Master Admin';
                                                roleIcon = <ShieldCheck size={14} className="text-purple-600" />;
                                            }

                                            return (
                                                <button
                                                    key={availRole}
                                                    onClick={() => handleSwitchRole(availRole)}
                                                    className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer"
                                                >
                                                    {roleIcon}
                                                    Switch to {roleLabel}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left cursor-pointer mt-1 border-t border-slate-100 dark:border-slate-900"
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link href="/login" className="px-6 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full text-sm font-semibold transition shadow-xs">
                        Login
                    </Link>
                )}
            </div>
        </div>
    )
}

export default StoreNavbar