'use client'

import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CartPage() {
    const { cartItems, removeFromCart,
        updateQuantity, cartTotal,
        clearCart } = useCart()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const supabase = createClient()
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user)
        })
    }, [])

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
                <div className="text-6xl">🛒</div>
                <h2 className="text-2xl font-bold text-slate-900">
                    Your cart is empty
                </h2>
                <p className="text-slate-500">
                    Browse our catalog to add products
                </p>
                <Link href="/catalog"
                    className="px-8 py-3 bg-slate-900 text-white rounded-xl font-semibold">
                    Browse Catalog
                </Link>
            </div>
        )
    }

    const wholesaleTotal = cartItems.reduce(
        (sum, item) => {
            const price = item.wholesalePrice ||
                item.retailPrice
            return sum + (price * item.quantity)
        }, 0
    )

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-slate-900 mb-8">
                    Your Cart ({cartItems.length} items)
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map(item => {
                            const price =
                                item.wholesalePrice ||
                                item.retailPrice
                            const primaryImg = item.imageUrl

                            return (
                                <div key={`${item.productId}-${item.variantId}`}
                                    className="bg-white rounded-2xl p-4 flex gap-4 border border-slate-100">
                                    <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                                        {primaryImg ? (
                                            <img
                                                src={primaryImg}
                                                alt={item.productName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">
                                                No img
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-900">
                                            {item.productName}
                                        </h3>
                                        {item.sizeLabel && (
                                            <p className="text-sm text-slate-500">
                                                Size: {item.sizeLabel}
                                            </p>
                                        )}
                                        <p className="text-sm font-bold text-slate-900 mt-1">
                                            ₹{price} × {item.quantity} =
                                            <span className="text-pink-600 ml-1">
                                                ₹{price * item.quantity}
                                            </span>
                                        </p>
                                        {item.wholesaleMinQty > 0 && (
                                            <p className="text-xs text-amber-600 mt-1">
                                                Min. {item.wholesaleMinQty} pcs for wholesale price
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <button
                                            onClick={() => removeFromCart(
                                                item.variantId
                                            )}
                                            className="text-red-400 hover:text-red-600 text-xs"
                                        >
                                            Remove
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(
                                                    item.variantId,
                                                    Math.max(1, item.quantity - 1)
                                                )}
                                                className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                                            >
                                                −
                                            </button>
                                            <span className="w-8 text-center font-semibold text-sm">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(
                                                    item.variantId,
                                                    item.quantity + 1
                                                )}
                                                className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 h-fit sticky top-4">
                        <h2 className="font-bold text-slate-900 mb-4">
                            Order Summary
                        </h2>
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Subtotal</span>
                                <span>₹{wholesaleTotal}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Shipping</span>
                                <span className="text-green-600">
                                    Calculated at checkout
                                </span>
                            </div>
                        </div>
                        <div className="border-t border-slate-100 pt-4 mb-6">
                            <div className="flex justify-between font-bold text-slate-900">
                                <span>Total</span>
                                <span className="text-pink-600 text-lg">
                                    ₹{wholesaleTotal}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                if (!user) {
                                    router.push(
                                        '/login?redirect=/checkout'
                                    )
                                } else {
                                    router.push('/checkout')
                                }
                            }}
                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all"
                        >
                            {user
                                ? 'Proceed to Checkout →'
                                : 'Login to Checkout →'
                            }
                        </button>
                        {!user && (
                            <p className="text-xs text-slate-400 text-center mt-2">
                                You need to login to place an order
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
