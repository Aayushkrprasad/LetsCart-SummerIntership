'use client'
import { Search, ShoppingCart, User, LogOut, Store, Package, Heart, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const Navbar = () => {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const cartCount = useSelector(state => state.cart.total);

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
        // Listen for custom login/logout events across tabs or components
        window.addEventListener('authChange', checkUser);
        window.addEventListener('storage', checkUser);
        return () => {
            window.removeEventListener('authChange', checkUser);
            window.removeEventListener('storage', checkUser);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('letscart_token');
        localStorage.removeItem('letscart_user');
        setUser(null);
        setDropdownOpen(false);
        window.dispatchEvent(new Event('authChange'));
        toast.success("Logged out successfully");
        router.push('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.push(`/shop?search=${search}`);
    };

    return (
        <nav className="relative bg-white z-40">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">

                    <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                        <span className="text-green-600">Lets</span>Cart<span className="text-green-600 text-5xl leading-0">.</span>
                        <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                            plus
                        </p>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600 font-medium">
                        <Link href="/" className="hover:text-green-600 transition">Home</Link>
                        <Link href="/shop" className="hover:text-green-600 transition">Shop</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600 hover:text-green-600 transition">
                            <ShoppingCart size={18} />
                            Cart
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                        </Link>

                        {/* User Profile / Login Button */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-800 text-sm font-semibold transition cursor-pointer"
                                >
                                    <div className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                                        {user.name ? user.name[0] : 'U'}
                                    </div>
                                    <span className="max-w-[100px] truncate">{user.name || 'Account'}</span>
                                    <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-sm animate-card-pop">
                                        <div className="px-4 py-2 border-b border-slate-100 mb-1">
                                            <p className="font-bold text-slate-800 truncate">{user.name}</p>
                                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                            <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${user.role === 'SELLER' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                                                {user.role === 'SELLER' ? 'Store Owner' : 'Customer'}
                                            </span>
                                        </div>

                                        {user.role === 'SELLER' && (
                                            <Link
                                                href="/store"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition"
                                            >
                                                <Store size={16} className="text-indigo-600" />
                                                My Store Dashboard
                                            </Link>
                                        )}

                                        <Link
                                            href="/orders"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition"
                                        >
                                            <Package size={16} className="text-slate-500" />
                                            My Orders
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-600 hover:bg-red-50 transition text-left cursor-pointer mt-1 border-t border-slate-100"
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

                    {/* Mobile User Button */}
                    <div className="sm:hidden flex items-center gap-3">
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-full transition cursor-pointer"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link href="/login" className="px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full font-medium inline-block">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
    );
};

export default Navbar;