'use client'

import { useCart } from '@/context/CartContext'
import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react'

interface CartDrawerProps {
    isOpen: boolean
    onClose: () => void
}

export default function CartDrawer({
    isOpen,
    onClose
}: CartDrawerProps) {
    const { cartItems, cartTotal, updateQuantity,
        removeFromCart, cartCount, toggleWholesale } = useCart()

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop — dark overlay, NO blur */}
            <div
                className="fixed inset-0 z-40 bg-black/50"
                style={{ backdropFilter: 'none' }}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer panel — slides in from right */}
            <div className="fixed right-0 top-0 h-full w-full 
                      max-w-md bg-white z-50 shadow-2xl 
                      flex flex-col transform transition-transform overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between 
                        p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 text-brand-500" />
                        <h2 className="text-lg font-bold text-slate-900">
                            Your Cart ({cartCount})
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full 
                       transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center 
                            justify-center h-full text-center">
                            <ShoppingBag className="w-16 h-16 
                                      text-slate-200 mb-4" />
                            <p className="text-slate-500 font-medium">
                                Your cart is empty
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-4 px-6 py-2 bg-slate-900 
                           text-white rounded-xl text-sm 
                           font-medium hover:bg-slate-800"
                            >
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div
                                key={item.variantId}
                                className="flex gap-4 p-4 bg-slate-50 
                           rounded-2xl"
                            >
                                {/* Image */}
                                <div className="w-16 h-16 rounded-xl 
                                overflow-hidden bg-slate-200 
                                flex-shrink-0">
                                    {item.imageUrl && (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.productName}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 
                                text-sm truncate">
                                        {item.productName}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Size: {item.sizeLabel}
                                    </p>
                                    <p className="text-sm font-bold 
                                text-slate-900 mt-1">
                                        ₹{item.isWholesale
                                            ? item.wholesalePrice
                                            : item.retailPrice}
                                        {item.isWholesale && (
                                            <span className="ml-2 text-[10px] 
                        bg-amber-50 text-amber-700 
                        border border-amber-200 px-2 py-0.5 
                        rounded-full font-medium">
                                                Wholesale
                                            </span>
                                        )}
                                    </p>

                                    {/* Toggle buttons below product name, size, and price */}
                                    {item.wholesaleMinQty > 0 && (
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => toggleWholesale(item.variantId)}
                                                className={`px-3 py-1 rounded-full text-xs 
                          font-medium transition-all
                          ${!item.isWholesale
                                                        ? 'bg-slate-900 text-white'
                                                        : 'bg-white border border-slate-200 text-slate-600'
                                                    }`}
                                            >
                                                Retail ₹{item.retailPrice}
                                            </button>
                                            <button
                                                onClick={() => toggleWholesale(item.variantId)}
                                                className={`px-3 py-1 rounded-full text-xs 
                          font-medium transition-all
                          ${item.isWholesale
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-white border border-amber-200 text-amber-600'
                                                    }`}
                                            >
                                                Wholesale ₹{item.wholesalePrice}
                                                (Min.{item.wholesaleMinQty}pcs)
                                            </button>
                                        </div>
                                    )}

                                    {/* Qty controls */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            onClick={() => updateQuantity(
                                                item.variantId,
                                                item.quantity - (item.isWholesale
                                                    ? item.wholesaleMinQty : 1)
                                            )}
                                            className="w-7 h-7 rounded-full 
                                 border border-slate-200 
                                 flex items-center justify-center 
                                 hover:bg-slate-100 transition-colors"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-sm font-semibold 
                                     text-slate-900 w-6 
                                     text-center">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(
                                                item.variantId,
                                                item.quantity + (item.isWholesale
                                                    ? item.wholesaleMinQty : 1)
                                            )}
                                            className="w-7 h-7 rounded-full 
                                 border border-slate-200 
                                 flex items-center justify-center 
                                 hover:bg-slate-100 transition-colors"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => removeFromCart(
                                                item.variantId
                                            )}
                                            className="ml-auto p-1 text-slate-400 
                                 hover:text-red-500 
                                 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="p-6 border-t border-slate-100 
                          space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 font-medium">
                                Subtotal
                            </span>
                            <span className="text-xl font-bold text-slate-900">
                                ₹{cartTotal.toLocaleString('en-IN')}
                            </span>
                        </div>
                        <a
                            href="/cart"
                            className="block w-full py-4 bg-slate-900 
                         text-white text-center rounded-2xl 
                         font-semibold hover:bg-slate-800 
                         transition-all"
                            onClick={onClose}
                        >
                            View Cart & Checkout
                        </a>
                    </div>
                )}
            </div>
        </>
    )
}
