'use client'
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartAIAssistant from "@/components/CartAIAssistant";

export default function PublicLayout({ children }) {

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
