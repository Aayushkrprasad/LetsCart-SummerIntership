'use client'
import { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, X, Send, Bot, User, ShoppingBag, ArrowRight, RefreshCw, Zap } from 'lucide-react';
import { useSelector } from 'react-redux';
import Link from 'next/link';

export default function CartAIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const products = useSelector(state => state.product?.list || []);

    const [messages, setMessages] = useState([
        {
            id: 'msg-1',
            sender: 'ai',
            text: 'Hey there! 👋 I am your LetsCart AI Assistant. Ask me anything about products, deals, or order recommendations!',
            suggestedProducts: []
        }
    ]);

    const chatEndRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = (textToSend) => {
        const queryText = textToSend || input;
        if (!queryText.trim()) return;

        // Add user message
        const userMsg = {
            id: `msg-${Date.now()}`,
            sender: 'user',
            text: queryText
        };

        setMessages(prev => [...prev, userMsg]);
        if (!textToSend) setInput('');
        setIsTyping(true);

        // Process query and respond
        setTimeout(() => {
            let replyText = '';
            let matchedProducts = [];
            const lower = queryText.toLowerCase();

            if (lower.includes('order') || lower.includes('track') || lower.includes('status')) {
                replyText = 'You can check your active and past orders anytime in your Account Profile page or the Orders section!';
            } else if (lower.includes('budget') || lower.includes('cheap') || lower.includes('under') || lower.includes('low price')) {
                replyText = 'Here are some of our best budget-friendly products available right now:';
                matchedProducts = [...products].sort((a, b) => a.price - b.price).slice(0, 3);
            } else if (lower.includes('tech') || lower.includes('headphone') || lower.includes('speaker') || lower.includes('watch') || lower.includes('electronics')) {
                replyText = 'Check out these top trending tech and electronic items in our store:';
                matchedProducts = products.filter(p => 
                    (p.category && p.category.toLowerCase().includes('tech')) ||
                    p.name.toLowerCase().includes('headphone') ||
                    p.name.toLowerCase().includes('speaker') ||
                    p.name.toLowerCase().includes('watch') ||
                    p.name.toLowerCase().includes('lamp')
                ).slice(0, 3);
            } else if (lower.includes('recommend') || lower.includes('cool') || lower.includes('best') || lower.includes('top')) {
                replyText = 'Here are our top-rated customer favorites specially recommended for you:';
                matchedProducts = [...products].slice(0, 3);
            } else {
                // Search products by name or category match
                const matches = products.filter(p => 
                    p.name.toLowerCase().includes(lower) || 
                    (p.category && p.category.toLowerCase().includes(lower))
                );
                if (matches.length > 0) {
                    replyText = `I found ${matches.length} products matching "${queryText}":`;
                    matchedProducts = matches.slice(0, 3);
                } else {
                    replyText = `I couldn't find exact matches for "${queryText}", but check out these popular picks from our store catalog:`;
                    matchedProducts = products.slice(0, 3);
                }
            }

            const aiMsg = {
                id: `msg-${Date.now() + 1}`,
                sender: 'ai',
                text: replyText,
                suggestedProducts: matchedProducts
            };

            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 700);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Launcher Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="relative group flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full shadow-2xl shadow-emerald-600/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-white/20"
                >
                    <div className="relative">
                        <Sparkles size={20} className="text-yellow-300 animate-pulse" />
                    </div>
                    <span className="font-bold text-xs tracking-wide">Ask LetsCart AI</span>
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400"></span>
                    </span>
                </button>
            )}

            {/* Chat Drawer Window */}
            {isOpen && (
                <div className="w-[360px] sm:w-[400px] h-[520px] bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-card-pop">
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 p-4 text-white flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                <Bot size={22} className="text-yellow-300" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm flex items-center gap-1.5">
                                    LetsCart AI <span className="text-[9px] bg-white/20 text-emerald-100 px-1.5 py-0.5 rounded-full font-mono uppercase">Live</span>
                                </h3>
                                <p className="text-[11px] text-emerald-100/90">Smart Shopping Assistant</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 hover:bg-white/20 rounded-full transition cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Quick Suggestion Chips */}
                    <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
                        <button
                            onClick={() => handleSend("Recommend top deals")}
                            className="flex-none px-3 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-200 rounded-full transition font-medium flex items-center gap-1 cursor-pointer"
                        >
                            <Zap size={12} className="text-yellow-500" /> Top Deals
                        </button>
                        <button
                            onClick={() => handleSend("Budget items under ₹500")}
                            className="flex-none px-3 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-200 rounded-full transition font-medium flex items-center gap-1 cursor-pointer"
                        >
                            💰 Budget Picks
                        </button>
                        <button
                            onClick={() => handleSend("Track my order")}
                            className="flex-none px-3 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-200 rounded-full transition font-medium flex items-center gap-1 cursor-pointer"
                        >
                            📦 Track Orders
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.sender === 'ai' && (
                                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Bot size={15} />
                                    </div>
                                )}

                                <div className={`max-w-[82%] space-y-2`}>
                                    <div className={`p-3 rounded-2xl leading-relaxed ${
                                        msg.sender === 'user'
                                            ? 'bg-emerald-600 text-white rounded-br-none shadow-sm font-medium'
                                            : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/80'
                                    }`}>
                                        {msg.text}
                                    </div>

                                    {/* Embedded Product Cards in AI Reply */}
                                    {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                                        <div className="space-y-2 pt-1">
                                            {msg.suggestedProducts.map(prod => (
                                                <Link
                                                    key={prod.id}
                                                    href={`/product/${prod.id}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center gap-3 p-2 bg-white border border-slate-200 hover:border-emerald-500 rounded-xl transition shadow-xs group"
                                                >
                                                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {prod.images && prod.images[0] ? (
                                                            <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ShoppingBag size={18} className="text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-slate-800 truncate text-[11px] group-hover:text-emerald-600 transition">{prod.name}</p>
                                                        <p className="text-[10px] text-emerald-700 font-bold">₹{prod.price}</p>
                                                    </div>
                                                    <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition" />
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {msg.sender === 'user' && (
                                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-[10px]">
                                        YOU
                                    </div>
                                )}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
                                <Bot size={16} className="text-emerald-600 animate-spin" />
                                <span>CartAI is thinking...</span>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Footer */}
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask for products, deals, or help..."
                            className="flex-1 px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow transition cursor-pointer"
                        >
                            <Send size={15} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
