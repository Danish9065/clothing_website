"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem } from "@/types";

type CartContextType = {
    cartItems: CartItem[]; // Renamed from cart to cartItems for consistency with CartDrawer
    cartCount: number;
    cartTotal: number;
    addToCart: (item: CartItem) => void;
    removeFromCart: (variantId: string) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    toggleWholesale: (variantId: string) => void;
    clearCart: () => void;
    isInCart: (variantId: string) => boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const saved = localStorage.getItem("lmc_cart");
        if (saved) {
            try {
                setCart(JSON.parse(saved));
            } catch {
                console.error("Failed to parse cart from local storage.");
            }
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem("lmc_cart", JSON.stringify(cart));
        }
    }, [cart, isClient]);

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => {
        const price = item.isWholesale
            ? (item.wholesalePrice ?? item.retailPrice)
            : item.retailPrice;
        return total + (price * item.quantity);
    }, 0);

    const addToCart = (item: CartItem) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.variantId === item.variantId);
            if (existing) {
                const addQty = existing.isWholesale ? existing.wholesaleMinQty : 1;
                const newQuantity = existing.quantity + addQty;
                // Cap at maxStock
                const cappedQuantity = Math.min(newQuantity, item.maxStock);
                return prev.map((i) =>
                    i.variantId === item.variantId
                        ? { ...i, quantity: cappedQuantity }
                        : i
                );
            }

            // If new: check if it came with isWholesale
            const startWholesale = item.isWholesale ?? false;
            const startQty = startWholesale ? item.wholesaleMinQty : 1;
            const initialQuantity = Math.min(startQty, item.maxStock);

            return [...prev, { ...item, isWholesale: startWholesale, quantity: initialQuantity }];
        });
    };

    const removeFromCart = (variantId: string) => {
        setCart((prev) => prev.filter((item) => item.variantId !== variantId));
    };

    const updateQuantity = (variantId: string, quantity: number) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.variantId === variantId);
            if (!existing) return prev; // Not in cart

            // Reject if quantity > maxStock
            if (quantity > existing.maxStock) return prev;

            if (existing.isWholesale) {
                // Wholesale rules
                if (quantity < existing.wholesaleMinQty) return prev;
                if (quantity % existing.wholesaleMinQty !== 0) return prev;
            } else {
                // Retail rules
                if (quantity < 1) return prev;
            }

            return prev.map((i) =>
                i.variantId === variantId ? { ...i, quantity } : i
            );
        });
    };

    const toggleWholesale = (variantId: string) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.variantId === variantId);
            if (!existing || existing.wholesaleMinQty === 0) return prev;

            const newIsWholesale = !existing.isWholesale;
            let newQuantity = newIsWholesale ? existing.wholesaleMinQty : 1;
            newQuantity = Math.min(newQuantity, existing.maxStock);

            return prev.map((i) =>
                i.variantId === variantId
                    ? { ...i, isWholesale: newIsWholesale, quantity: newQuantity }
                    : i
            );
        });
    };

    const clearCart = () => {
        setCart([]);
    };

    const isInCart = (variantId: string) => {
        return cart.some((item) => item.variantId === variantId);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems: cart, // Map the internal 'cart' state to 'cartItems'
                cartCount,
                cartTotal,
                addToCart,
                removeFromCart,
                updateQuantity,
                toggleWholesale,
                clearCart,
                isInCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
