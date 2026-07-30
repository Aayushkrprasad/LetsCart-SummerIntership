'use client'
import { useEffect, useState } from "react"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"
import { dummyStoreData } from "@/assets/assets"

const StoreLayout = ({ children }) => {


    const [isSeller, setIsSeller] = useState(false)
    const [loading, setLoading] = useState(true)
    const [storeInfo, setStoreInfo] = useState(null)

    const fetchIsSeller = async () => {
        if (typeof window !== 'undefined') {
            const savedUser = localStorage.getItem('letscart_user')
            if (savedUser) {
                try {
                    const user = JSON.parse(savedUser)
                    if (user.role === 'SELLER') {
                        setIsSeller(true)
                        setStoreInfo(dummyStoreData)
                    } else {
                        setIsSeller(false)
                    }
                } catch (e) {
                    setIsSeller(false)
                }
            } else {
                setIsSeller(false)
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchIsSeller()
    }, [])

    const handleSignOut = () => {
        localStorage.removeItem('letscart_token')
        localStorage.removeItem('letscart_user')
        window.dispatchEvent(new Event('authChange'))
        window.location.href = '/login'
    }

    return loading ? (
        <Loading />
    ) : isSeller ? (
        <div className="flex flex-col h-screen">
            <SellerNavbar />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <SellerSidebar storeInfo={storeInfo} />
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">You are not authorized to access this page</h1>
            <p className="text-sm text-slate-500 mt-2">Only Store Owners are allowed to view this panel.</p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8">
                <Link href="/" className="bg-slate-700 text-white flex items-center gap-2 p-2.5 px-6 rounded-full text-sm">
                    Go to home <ArrowRightIcon size={16} />
                </Link>
                <button 
                    onClick={handleSignOut}
                    className="bg-red-600 hover:bg-red-700 transition text-white flex items-center gap-2 p-2.5 px-6 rounded-full text-sm font-semibold cursor-pointer"
                >
                    Sign Out & Switch Account
                </button>
            </div>
        </div>
    )
}

export default StoreLayout