'use client'
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setProduct } from "@/lib/features/product/productSlice";
import { productDummyData } from "@/assets/assets";
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartAIAssistant from "@/components/CartAIAssistant";

export default function PublicLayout({ children }) {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchDbProducts = async () => {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                if (data.success && data.products) {
                    // Prepend database products to dummy products to keep catalog populated
                    // while showing real/newly added items first
                    const combined = [...data.products, ...productDummyData];
                    dispatch(setProduct(combined));
                }
            } catch (err) {
                console.error("Failed to load products from database:", err);
            }
        };

        fetchDbProducts();
    }, [dispatch]);

    return (
        <>
            <Banner />
            <Navbar />
            {children}
            <CartAIAssistant />
            <Footer />
        </>
    );
}
