'use client'
import { Search, ShoppingCart, User, LogOut, Store, Package, Heart, ChevronDown, Menu, X, Sun, Moon, Truck, ShieldCheck, Sparkles, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setWishlist } from "@/lib/features/wishlist/wishlistSlice";
import toast from "react-hot-toast";

const Navbar = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [search, setSearch] = useState('');
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [theme, setTheme] = useState('light');
    const [mounted, setMounted] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const cartCount = useSelector(state => state.cart.total);
    const wishlistCount = useSelector(state => state.wishlist?.items?.length || 0);

    const checkUser = () => {
        if (typeof window !== 'undefined') {
            const savedUser = localStorage.getItem('letscart_user');
            const token = localStorage.getItem('letscart_token');
            if (savedUser) {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    setUser(parsedUser);

                    // Sync Wishlist from API
                    if (token) {
                        fetch(`/api/wishlist?userId=${parsedUser.id}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success && data.wishlist) {
                                dispatch(setWishlist(data.wishlist.map(p => p.id)));
                            }
                        })
                        .catch(console.error);
                    }
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
        
        // Setup initial theme state
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? 'dark' : 'light');

        // Scroll listener for sticky styling
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Listen for custom login/logout events across tabs or components
        window.addEventListener('authChange', checkUser);
        window.addEventListener('storage', checkUser);

        return () => {
            window.removeEventListener('scroll', handleScroll);
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

    const handleSearch = (e) => {
        e.preventDefault();
        router.push(`/shop?search=${search}`);
    };

    return (
        <nav className={`sticky top-0 z-40 transition-all duration-300 ${
            isScrolled 
                ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-md border-b border-slate-200/50 dark:border-slate-800/50' 
                : 'bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-900'
        }`}>
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">

                    <Link href="/" className="relative text-4xl font-semibold text-slate-700 dark:text-slate-200">
                        <span className="text-green-600">Lets</span>Cart<span className="text-green-600 text-5xl leading-0">.</span>
                        <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                            plus
                        </p>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-6 text-slate-600 dark:text-slate-300 font-medium">
                        <Link href="/" className="hover:text-green-600 dark:hover:text-green-400 transition">Home</Link>
                        <Link href="/shop" className="hover:text-green-600 dark:hover:text-green-400 transition">Shop</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 focus-within:border-green-500/50 dark:focus-within:border-green-500/50 transition-all px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600 dark:text-slate-400" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-500 dark:placeholder-slate-400 text-slate-800 dark:text-slate-200" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

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

                        {/* Wishlist Link */}
                        <Link href="/wishlist" className="relative flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition">
                            <Heart size={18} className={wishlistCount > 0 ? "text-red-500 fill-red-500" : ""} />
                            Wishlist
                            {wishlistCount > 0 && (
                                <button className="absolute -top-1.5 left-3 text-[9px] font-bold text-white bg-red-500 size-4 rounded-full flex items-center justify-center">{wishlistCount}</button>
                            )}
                        </Link>

                        {/* Cart Link */}
                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition">
                            <ShoppingCart size={18} />
                            Cart
                            <button className="absolute -top-1.5 left-3 text-[9px] font-bold text-white bg-green-600 dark:bg-green-500 size-4 rounded-full flex items-center justify-center">{cartCount}</button>
                        </Link>

                        {/* User Profile / Login Button */}
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
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
                                            >
                                                <Store size={16} className="text-indigo-600 dark:text-indigo-400" />
                                                My Store Dashboard
                                            </Link>
                                        )}

                                        {user.role === 'DELIVERY' && (
                                            <Link
                                                href="/delivery"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition font-bold text-green-600"
                                            >
                                                <Truck size={16} className="text-green-600" />
                                                Delivery Dispatch Hub
                                            </Link>
                                        )}

                                        {user.role === 'ADMIN' && (
                                            <Link
                                                href="/admin"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition font-bold text-purple-600"
                                            >
                                                <ShieldCheck size={16} className="text-purple-600" />
                                                Master Admin Portal
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

                                        <Link
                                            href="/wishlist"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
                                        >
                                            <Heart size={16} className="text-red-500" />
                                            My Wishlist
                                        </Link>

                                        <Link
                                            href="/orders"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
                                        >
                                            <Package size={16} className="text-slate-500 dark:text-slate-400" />
                                            My Orders
                                        </Link>

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
                            <Link href="/login" className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full font-medium inline-block shadow-sm">
                                Login
                            </Link>
                        )}

                    </div>

                    {/* Mobile Header Bar Icons & Toggle & Hamburger */}
                    <div className="sm:hidden flex items-center gap-2">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {!mounted ? (
                                <div className="w-5 h-5" />
                            ) : theme === 'dark' ? (
                                <Sun className="w-5 h-5 text-amber-400" />
                            ) : (
                                <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            )}
                        </button>

                        {/* Mobile Wishlist Icon */}
                        <Link href="/wishlist" className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                            <Heart size={20} className={wishlistCount > 0 ? "text-red-500 fill-red-500" : ""} />
                            {wishlistCount > 0 && (
                                <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        {/* Cart */}
                        <Link href="/cart" className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                            <ShoppingCart size={20} />
                            {cartCount > 0 && (
                                <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[9px] font-bold text-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Hamburger Button */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                            aria-label="Open menu"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 sm:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Drawer */}
            <div className={`fixed top-0 right-0 bottom-0 z-50 w-72 max-w-[80vw] bg-white dark:bg-slate-950 p-6 shadow-2xl transition-transform duration-300 ease-in-out transform sm:hidden flex flex-col justify-between ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-900">
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-semibold text-slate-700 dark:text-slate-200">
                            <span className="text-green-600">Lets</span>Cart<span className="text-green-600 text-3xl">.</span>
                        </Link>
                        <button 
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Search */}
                    <form onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false); }} className="my-6 flex items-center text-sm gap-2 bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 focus-within:border-green-500/50 rounded-full px-4 py-2.5">
                        <Search size={16} className="text-slate-500" />
                        <input className="w-full bg-transparent outline-none placeholder-slate-500 dark:placeholder-slate-400 text-slate-800 dark:text-slate-200 text-sm" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                    </form>

                    {/* Navigation Links */}
                    <div className="flex flex-col gap-2 text-slate-600 dark:text-slate-300 font-medium">
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition">
                            Home
                        </Link>
                        <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition">
                            Shop
                        </Link>
                        <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition">
                            Wishlist ({wishlistCount})
                        </Link>
                        <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition">
                            Cart ({cartCount})
                        </Link>
                    </div>
                </div>

                {/* Footer section inside drawer (User details / Login) */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-900">
                    {user ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 px-2">
                                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold uppercase shrink-0">
                                    {user.name ? user.name[0] : 'U'}
                                </div>
                                <div className="truncate">
                                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-1 mt-2">
                                <Link
                                    href={user.role === 'SELLER' ? '/store/profile' : '/profile'}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition rounded-lg"
                                >
                                    <User size={16} className="text-green-600 dark:text-green-500" />
                                    My Profile
                                </Link>

                                {user.role === 'SELLER' && (
                                    <Link
                                        href="/store"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition rounded-lg"
                                    >
                                        <Store size={16} className="text-indigo-600 dark:text-indigo-400" />
                                        Store Dashboard
                                    </Link>
                                )}

                                <Link
                                    href="/orders"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition rounded-lg"
                                >
                                    <Package size={16} className="text-slate-500 dark:text-slate-400" />
                                    My Orders
                                </Link>
                            </div>

                            <button
                                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/45 transition rounded-xl text-sm font-semibold cursor-pointer"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link 
                            href="/login" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-xl font-medium inline-block text-center shadow-sm text-sm"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;