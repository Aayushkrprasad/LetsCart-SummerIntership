'use client'
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function AuthCallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const userJson = searchParams.get('user');

        if (token && userJson) {
            try {
                const user = JSON.parse(userJson);
                
                // Save credentials to localStorage
                localStorage.setItem('letscart_token', token);
                localStorage.setItem('letscart_user', JSON.stringify(user));
                
                // Dispatch auth change event for Navbar updates
                window.dispatchEvent(new Event('authChange'));
                
                toast.success(`Logged in as ${user.name}!`);

                // Dynamic redirection based on role
                setTimeout(() => {
                    const r = user.role;
                    if (r === 'SELLER') {
                        router.push('/store');
                    } else if (r === 'DELIVERY') {
                        router.push('/delivery');
                    } else if (r === 'ADMIN') {
                        router.push('/admin');
                    } else {
                        router.push('/');
                    }
                }, 800);
            } catch (error) {
                console.error('Failed to parse user details from OAuth callback:', error);
                toast.error('Authentication parsing error.');
                router.push('/login');
            }
        } else {
            const errorMsg = searchParams.get('error');
            if (errorMsg) {
                toast.error(`Auth Error: ${errorMsg}`);
            } else {
                toast.error('Authentication details not found.');
            }
            router.push('/login');
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-green-50/20 to-indigo-50/20 relative overflow-hidden">
            {/* Background blur effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-300/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

            <div className="z-10 text-center flex flex-col items-center gap-4 bg-white/70 backdrop-blur-md border border-slate-100 rounded-3xl p-10 shadow-xl max-w-sm w-full mx-4">
                <div className="relative">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center animate-pulse">
                        <Loader2 size={32} className="animate-spin" />
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800">Signing you in...</h3>
                    <p className="text-xs text-slate-500 mt-2">Setting up your secure session with LetsCart. Please do not close this page.</p>
                </div>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-green-600" size={32} />
            </div>
        }>
            <AuthCallbackHandler />
        </Suspense>
    );
}
