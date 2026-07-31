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

    // Drag-and-drop state configuration
    const [position, setPosition] = useState({ x: null, y: null });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ offsetX: 0, offsetY: 0 });
    const [hasDragged, setHasDragged] = useState(false);
    const containerRef = useRef(null);

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

    // Setup window-level event listeners for tracking position changes during drag
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            updatePosition(e.clientX, e.clientY);
        };

        const handleTouchMove = (e) => {
            if (!isDragging || e.touches.length !== 1) return;
            updatePosition(e.touches[0].clientX, e.touches[0].clientY);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        const updatePosition = (clientX, clientY) => {
            if (!containerRef.current) return;
            
            let newX = clientX - dragStart.offsetX;
            let newY = clientY - dragStart.offsetY;

            const elWidth = containerRef.current.offsetWidth || 0;
            const elHeight = containerRef.current.offsetHeight || 0;
            
            // Mark as dragged if user actually slides the mouse/finger
            setHasDragged(true);

            // Clamp coordinates inside screen bounds with a small padding
            const padding = 12;
            newX = Math.max(padding, Math.min(window.innerWidth - elWidth - padding, newX));
            newY = Math.max(padding, Math.min(window.innerHeight - elHeight - padding, newY));

            setPosition({ x: newX, y: newY });
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchend', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging, dragStart]);

    const startDrag = (clientX, clientY) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        setDragStart({
            offsetX: clientX - rect.left,
            offsetY: clientY - rect.top
        });
        setHasDragged(false);
        setIsDragging(true);
    };

    const handleMouseDown = (e) => {
        if (e.button !== 0) return; // Only allow left clicks
        if (e.target.closest('button')) return; // Ignore drag triggers on clicking buttons
        startDrag(e.clientX, e.clientY);
    };

    const handleTouchStart = (e) => {
        if (e.target.closest('button')) return;
        if (e.touches.length === 1) {
            startDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    const handleToggleClick = (e) => {
        if (hasDragged) {
            e.preventDefault();
            return;
        }
        setIsOpen(!isOpen);
    };

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

        // Fetch AI response from the Gemini API route
        fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: queryText,
                history: [...messages, userMsg],
                products: products
            })
        })
        .then(res => res.json())
        .then(data => {
            // Find recommended products by matching their IDs
            const matchedProducts = [];
            if (data.recommendedProductIds && Array.isArray(data.recommendedProductIds)) {
                data.recommendedProductIds.forEach(id => {
                    const found = products.find(p => String(p.id) === String(id));
                    if (found) matchedProducts.push(found);
                });
            }

            const aiMsg = {
                id: `msg-${Date.now() + 1}`,
                sender: 'ai',
                text: data.text || "Sorry, I didn't get a response. Please try again.",
                suggestedProducts: matchedProducts
            };

            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        })
        .catch(err => {
            console.error("AI assistant endpoint error:", err);
            const errorMsg = {
                id: `msg-${Date.now() + 1}`,
                sender: 'ai',
                text: "⚠️ **Connection Error**\n\nCould not reach the server. Please check that `npm run dev` is running."
            };
            setMessages(prev => [...prev, errorMsg]);
            setIsTyping(false);
        });
    };

    // Helper function to render basic markdown elements inside messages
    const renderMessageText = (text) => {
        if (!text) return null;
        
        const lines = text.split('\n');
        return lines.map((line, idx) => {
            let content = line;
            
            // Check if line is a bullet list item
            const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
            if (isBullet) {
                content = line.replace(/^[\-\*]\s+/, '');
            }

            // Regex for bold text (**bold**)
            const parts = content.split(/(\*\*.*?\*\*)/g);
            const elements = parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                        <strong key={pIdx} className="font-bold text-slate-900 dark:text-slate-100">
                            {part.slice(2, -2)}
                        </strong>
                    );
                }
                return part;
            });

            if (isBullet) {
                return (
                    <li key={idx} className="ml-4 list-disc mt-1 text-slate-700 dark:text-slate-300">
                        {elements}
                    </li>
                );
            }

            return (
                <p key={idx} className={`${idx > 0 ? 'mt-2' : ''} text-slate-700 dark:text-slate-300`}>
                    {elements}
                </p>
            );
        });
    };

    const positionStyle = position.x !== null && position.y !== null
        ? { left: `${position.x}px`, top: `${position.y}px`, position: 'fixed' }
        : { right: '24px', bottom: '24px', position: 'fixed' };

    return (
        <div 
            ref={containerRef}
            style={positionStyle}
            className="z-50 select-none touch-none"
        >
            {/* Launcher Button */}
            {!isOpen && (
                <button
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onClick={handleToggleClick}
                    className="relative group flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full shadow-2xl shadow-emerald-600/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-grab active:cursor-grabbing border border-white/20"
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
                <div className="w-[calc(100vw-48px)] sm:w-[400px] h-[520px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-card-pop">
                    
                    {/* Header */}
                    <div 
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                        className="bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 p-4 text-white flex items-center justify-between shadow-md cursor-grab active:cursor-grabbing"
                    >
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
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-900 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
                        <button
                            onClick={() => handleSend("Recommend top deals")}
                            className="flex-none px-3 py-1 bg-white dark:bg-slate-950 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-full transition font-medium flex items-center gap-1 cursor-pointer"
                        >
                            <Zap size={12} className="text-yellow-500" /> Top Deals
                        </button>
                        <button
                            onClick={() => handleSend("Budget items under ₹1000")}
                            className="flex-none px-3 py-1 bg-white dark:bg-slate-950 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-full transition font-medium flex items-center gap-1 cursor-pointer"
                        >
                            💰 Budget Picks
                        </button>
                        <button
                            onClick={() => handleSend("Track my order")}
                            className="flex-none px-3 py-1 bg-white dark:bg-slate-950 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-full transition font-medium flex items-center gap-1 cursor-pointer"
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
                                    <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Bot size={15} />
                                    </div>
                                )}

                                <div className="max-w-[82%] space-y-2">
                                    <div className={`p-3 rounded-2xl leading-relaxed ${
                                        msg.sender === 'user'
                                            ? 'bg-emerald-600 text-white rounded-br-none shadow-sm font-medium'
                                            : 'bg-slate-100 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/80 dark:border-slate-800/80'
                                    }`}>
                                        {msg.sender === 'user' ? msg.text : renderMessageText(msg.text)}
                                    </div>

                                    {/* Embedded Product Cards in AI Reply */}
                                    {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                                        <div className="space-y-2 pt-1">
                                            {msg.suggestedProducts.map(prod => (
                                                <Link
                                                    key={prod.id}
                                                    href={`/product/${typeof prod.id === 'object' ? (prod.id.id || prod.id._id || String(prod.id)) : prod.id}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center gap-3 p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl transition shadow-xs group"
                                                >
                                                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {prod.images && prod.images[0] ? (
                                                            <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ShoppingBag size={18} className="text-slate-400 dark:text-slate-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate text-[11px] group-hover:text-emerald-600 transition">{prod.name}</p>
                                                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">₹{prod.price}</p>
                                                    </div>
                                                    <ArrowRight size={14} className="text-slate-400 dark:text-slate-600 group-hover:translate-x-0.5 transition" />
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {msg.sender === 'user' && (
                                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-[10px]">
                                        YOU
                                    </div>
                                )}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs pl-2">
                                <Bot size={16} className="text-emerald-600 dark:text-emerald-500 animate-spin" />
                                <span>CartAI is thinking...</span>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Footer */}
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="p-3 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 flex items-center gap-2"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask for products, deals, or help..."
                            className="flex-1 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition"
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
