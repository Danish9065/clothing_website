"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Sparkles, ShoppingBag, Menu, X } from "lucide-react";
import { createClient } from '@/lib/supabase/client';
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";

export function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { cartCount } = useCart();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });
        const { data: { subscription } } =
            supabase.auth.onAuthStateChange((_, session) => {
                setUser(session?.user || null);
            });
        return () => subscription.unsubscribe();
    }, []);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Catalog", href: "/catalog" },
        { name: "Contact", href: "/#contact" },
    ];

    return (
        <header className="sticky top-0 z-30 bg-white/95 border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-slate-900 text-lg">
                            Little Mumbai Choice
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex gap-8 items-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium hover:text-brand-600 transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="hidden md:flex items-center gap-3">
                                <Link href="/my-orders"
                                    className="text-sm font-medium 
                                                text-slate-700 hover:text-slate-900 
                                                flex items-center gap-1">
                                    📦 My Orders
                                </Link>
                                <button
                                    onClick={async () => {
                                        const { createClient } =
                                            await import('@/lib/supabase/client')
                                        const supabase = createClient()
                                        await supabase.auth.signOut()
                                        window.location.href = '/'
                                    }}
                                    className="text-sm text-slate-400 
                                            hover:text-red-500"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <Link href="/login"
                                className="hidden md:block text-sm font-medium px-4 py-2 
                                             bg-slate-900 text-white rounded-xl 
                                             hover:bg-slate-800">
                                Login / Sign Up
                            </Link>
                        )}
                        <button
                            className="relative p-2 text-slate-600 hover:text-brand-600 transition-colors"
                            onClick={() => setIsCartOpen(true)}
                        >
                            <ShoppingBag className="w-6 h-6" />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 text-white text-[10px] rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                        <button
                            id="mobile-menu-btn"
                            className="md:hidden p-2 text-slate-600"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 py-4 px-4 flex flex-col gap-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="text-sm font-medium hover:text-brand-600 transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                    {user && (
                        <Link
                            href="/my-orders"
                            onClick={() => setMenuOpen(false)}
                            className="text-sm font-medium hover:text-brand-600 transition-colors flex items-center gap-1 text-slate-700"
                        >
                            📦 My Orders
                        </Link>
                    )}
                    {user ? (
                        <button
                            onClick={async () => {
                                const { createClient } =
                                    await import('@/lib/supabase/client')
                                const supabase = createClient()
                                await supabase.auth.signOut()
                                window.location.href = '/'
                            }}
                            className="text-sm font-medium text-left text-slate-400 hover:text-red-500 transition-colors"
                        >
                            Sign Out
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            onClick={() => setMenuOpen(false)}
                            className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                        >
                            Login / Sign Up
                        </Link>
                    )}
                </div>
            )}

            {/* Cart Drawer Overlay */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
            />
        </header>
    );
}
