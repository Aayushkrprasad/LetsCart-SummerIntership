import Link from 'next/link';
import { Sparkles, ArrowLeft, Check, ShieldAlert } from 'lucide-react';

export default function PricingPage() {
    return (
        <div className='min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-slate-50/40 dark:bg-slate-950/20 transition-colors duration-300'>
            <div className='max-w-md w-full text-center space-y-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl transform hover:scale-[1.01] transition-all duration-300'>
                
                {/* Under Construction Banner */}
                <div className='inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-xs rounded-full border border-amber-500/20 shadow-sm animate-pulse'>
                    <ShieldAlert size={14} />
                    Work Under Process / Coming Soon 🛠️
                </div>

                <div className='space-y-3'>
                    <div className='mx-auto w-16 h-16 bg-green-150 dark:bg-green-950/30 text-green-600 rounded-full flex items-center justify-center text-3xl shadow-md'>
                        👑
                    </div>
                    <h1 className='text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight'>
                        LetsCart <span className='text-green-600'>Plus</span>
                    </h1>
                    <p className='text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto'>
                        We are currently building an exclusive membership program to offer premium perks and rewards to our shoppers.
                    </p>
                </div>

                {/* Sneak Peek Features List */}
                <div className='bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 text-left space-y-4'>
                    <h3 className='text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2'>
                        <Sparkles size={14} className='text-green-600' />
                        Expected Member Perks
                    </h3>
                    
                    <ul className='space-y-3.5 text-sm text-slate-600 dark:text-slate-350'>
                        <li className='flex items-start gap-3'>
                            <Check size={16} className='text-green-600 mt-0.5 shrink-0' />
                            <span><strong>Free Express Shipping:</strong> No minimum order constraints on all standard products.</span>
                        </li>
                        <li className='flex items-start gap-3'>
                            <Check size={16} className='text-green-600 mt-0.5 shrink-0' />
                            <span><strong>Exclusive Coupons:</strong> Additional 10-20% discounts on premium brands.</span>
                        </li>
                        <li className='flex items-start gap-3'>
                            <Check size={16} className='text-green-600 mt-0.5 shrink-0' />
                            <span><strong>Priority Support:</strong> Direct 24/7 client helpline call routing.</span>
                        </li>
                    </ul>
                </div>

                {/* Action Button */}
                <div className='pt-2 flex flex-col gap-3'>
                    <Link 
                        href="/" 
                        className='w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer'
                    >
                        <ArrowLeft size={14} /> Back to Shopping
                    </Link>
                </div>

            </div>
        </div>
    )
}