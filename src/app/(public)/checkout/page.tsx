'use client'

import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CheckoutPage() {
    const { cartItems, clearCart } = useCart()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [placing, setPlacing] = useState(false)
    const [form, setForm] = useState({
        business_name: '',
        contact_name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        gst_number: '',
        notes: '',
    })

    useEffect(() => {
        const supabase = createClient()
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) {
                router.replace('/login?redirect=/checkout')
                return
            }
            setUser(data.user)
            // Pre-fill email
            setForm(prev => ({
                ...prev,
                email: data.user?.email || ''
            }))
            setLoading(false)
        })
    }, [router])

    useEffect(() => {
        if (!loading && cartItems.length === 0) {
            router.replace('/catalog')
        }
    }, [loading, cartItems, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center 
                      justify-center">
                <p className="text-slate-400">Loading...</p>
            </div>
        )
    }

    const wholesaleTotal = cartItems.reduce((sum, item) => {
        const price = item.wholesalePrice ||
            item.retailPrice
        return sum + (price * item.quantity)
    }, 0)

    async function handlePlaceOrder() {
        if (!form.business_name || !form.phone ||
            !form.address || !form.city ||
            !form.pincode) {
            alert('Please fill in all required fields')
            return
        }

        setPlacing(true)

        try {
            // Build order items
            const orderItems = cartItems.map(item => ({
                product_id: item.productId,
                variant_id: item.variantId || null,
                product_name: item.productName,
                size_label: item.sizeLabel || null,
                quantity: item.quantity,
                unit_price: item.wholesalePrice ||
                    item.retailPrice,
                total_price: (item.wholesalePrice ||
                    item.retailPrice) * item.quantity,
            }))

            // Create order via API
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: user.id,
                    business_name: form.business_name,
                    contact_name: form.contact_name,
                    phone: form.phone,
                    email: form.email,
                    shipping_address: `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`,
                    gst_number: form.gst_number || null,
                    notes: form.notes || null,
                    total_amount: wholesaleTotal,
                    payment_method: 'whatsapp',
                    payment_status: 'pending',
                    status: 'pending',
                    items: orderItems,
                }),
            })

            const json = await res.json()
            if (!res.ok) {
                alert(json.error || 'Failed to place order')
                setPlacing(false)
                return
            }

            const orderId = json.data?.id || 'NEW'

            // Build WhatsApp message
            const itemsList = cartItems
                .map(item =>
                    `• ${item.productName}${item.sizeLabel ? ` (${item.sizeLabel})` : ''} × ${item.quantity} = ₹${(item.wholesalePrice || item.retailPrice) * item.quantity}`
                )
                .join('\n')

            const message = encodeURIComponent(
                `🛍️ *New Wholesale Order*\n\n` +
                `Order ID: #${orderId.slice(0, 8).toUpperCase()}\n\n` +
                `*Business:* ${form.business_name}\n` +
                `*Name:* ${form.contact_name}\n` +
                `*Phone:* ${form.phone}\n` +
                `*Address:* ${form.address}, ${form.city}, ${form.state} - ${form.pincode}\n` +
                (form.gst_number
                    ? `*GST:* ${form.gst_number}\n` : '') +
                `\n*Items:*\n${itemsList}\n\n` +
                `*Total Amount: ₹${wholesaleTotal}*\n\n` +
                (form.notes
                    ? `*Notes:* ${form.notes}\n\n` : '') +
                `Please confirm this order and share payment details. Thank you! 🙏`
            )

            // Clear cart
            clearCart()

            // Open WhatsApp
            window.open(
                `https://wa.me/919310708172?text=${message}`,
                '_blank'
            )

            // Redirect to confirmation page
            router.push(
                `/order-confirmation?id=${orderId}`
            )
        } catch (err: any) {
            alert('Something went wrong. Please try again.')
            console.error(err)
            setPlacing(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-5xl mx-auto px-4">
                <h1 className="text-2xl font-bold 
                        text-slate-900 mb-2">
                    Checkout
                </h1>
                <p className="text-slate-500 mb-8 text-sm">
                    Fill your details. Your order will be sent
                    to us via WhatsApp for confirmation.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 
                        gap-6">
                    {/* Address Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl p-6 
                            border border-slate-100">
                            <h2 className="font-bold text-slate-900 
                              mb-6">
                                Delivery & Business Details
                            </h2>
                            <div className="grid grid-cols-1 
                              sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="text-sm font-medium 
                                     text-slate-700">
                                        Business / Shop Name *
                                    </label>
                                    <input
                                        value={form.business_name}
                                        onChange={e => setForm({
                                            ...form,
                                            business_name: e.target.value
                                        })}
                                        placeholder="Your shop name"
                                        className="mt-1 w-full px-4 py-3 
                               border border-slate-200 
                               rounded-xl text-sm 
                               focus:outline-none 
                               focus:ring-2 
                               focus:ring-pink-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium 
                                     text-slate-700">
                                        Contact Name *
                                    </label>
                                    <input
                                        value={form.contact_name}
                                        onChange={e => setForm({
                                            ...form,
                                            contact_name: e.target.value
                                        })}
                                        placeholder="Your full name"
                                        className="mt-1 w-full px-4 py-3 
                               border border-slate-200 
                               rounded-xl text-sm 
                               focus:outline-none 
                               focus:ring-2 
                               focus:ring-pink-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium 
                                     text-slate-700">
                                        WhatsApp Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={e => setForm({
                                            ...form, phone: e.target.value
                                        })}
                                        placeholder="10-digit mobile number"
                                        className="mt-1 w-full px-4 py-3 
                               border border-slate-200 
                               rounded-xl text-sm 
                               focus:outline-none 
                               focus:ring-2 
                               focus:ring-pink-400"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-sm font-medium 
                                     text-slate-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({
                                            ...form, email: e.target.value
                                        })}
                                        className="mt-1 w-full px-4 py-3 
                               border border-slate-200 
                               rounded-xl text-sm 
                               focus:outline-none 
                               focus:ring-2 
                               focus:ring-pink-400"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-sm font-medium 
                                     text-slate-700">
                                        Delivery Address *
                                    </label>
                                    <textarea
                                        value={form.address}
                                        onChange={e => setForm({
                                            ...form, address: e.target.value
                                        })}
                                        placeholder="Street address, area, landmark"
                                        rows={2}
                                        className="mt-1 w-full px-4 py-3 
                               border border-slate-200 
                               rounded-xl text-sm 
                               focus:outline-none 
                               focus:ring-2 
                               focus:ring-pink-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium 
                                     text-slate-700">
                                        City *
                                    </label>
                                    <input
                                        value={form.city}
                                        onChange={e => setForm({
                                            ...form, city: e.target.value
                                        })}
                                        className="mt-1 w-full px-4 py-3 
                               border border-slate-200 
                               rounded-xl text-sm 
                               focus:outline-none 
                               focus:ring-2 
                               focus:ring-pink-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium 
                                     text-slate-700">
                                        State
                                    </label>
                                    <input
                                        value={form.state}
                                        onChange={e => setForm({
                                            ...form, state: e.target.value
                                        })}
                                        className="mt-1 w-full px-4 py-3 
                               border border-slate-200 
                               rounded-xl text-sm 
                               focus:outline-none 
                               focus:ring-2 
                               focus:ring-pink-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium 
                                     text-slate-700">
                                        Pincode *
                                    </label>
                                    <input
                                        value={form.pincode}
                                        onChange={e => setForm({
                                            ...form, pincode: e.target.value
                                        })}
                                        className="mt-1 w-full px-4 py-3 
                               border border-slate-200 
                               rounded-xl text-sm 
                               focus:outline-none 
                               focus:ring-2 
                               focus:ring-pink-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium 
                                     text-slate-700">
                                        GST Number (Optional)
                                    </label>
                                    <input
                                        value={form.gst_number}
                                        onChange={e => setForm({
                                            ...form,
                                            gst_number: e.target.value
                                        })}
                                        placeholder="22AAAAA0000A1Z5"
                                        className="mt-1 w-full px-4 py-3 
                               border border-slate-200 
                               rounded-xl text-sm 
                               focus:outline-none 
                               focus:ring-2 
                               focus:ring-pink-400"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-sm font-medium 
                                     text-slate-700">
                                        Special Notes (Optional)
                                    </label>
                                    <textarea
                                        value={form.notes}
                                        onChange={e => setForm({
                                            ...form, notes: e.target.value
                                        })}
                                        placeholder="Any special requests..."
                                        rows={2}
                                        className="mt-1 w-full px-4 py-3 
                               border border-slate-200 
                               rounded-xl text-sm 
                               focus:outline-none 
                               focus:ring-2 
                               focus:ring-pink-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-green-50 border 
                            border-green-200 rounded-2xl 
                            p-4 mt-4 flex gap-3">
                            <div className="text-2xl">💬</div>
                            <div>
                                <p className="font-semibold 
                               text-green-800 text-sm">
                                    Payment via WhatsApp
                                </p>
                                <p className="text-green-700 text-xs mt-1">
                                    After placing your order, WhatsApp will
                                    open automatically with your order
                                    details. Our team will confirm your
                                    order and share payment details
                                    (UPI/Bank Transfer) within 24 hours.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-2xl p-6 
                          border border-slate-100 h-fit 
                          sticky top-4">
                        <h2 className="font-bold text-slate-900 
                            mb-4">
                            Order Summary
                        </h2>
                        <div className="space-y-3 mb-4">
                            {cartItems.map(item => {
                                const price =
                                    item.wholesalePrice ||
                                    item.retailPrice
                                return (
                                    <div key={`${item.productId}-${item.variantId}`}
                                        className="flex justify-between 
                                  text-sm">
                                        <span className="text-slate-600 
                                      flex-1 pr-2">
                                            {item.productName}
                                            {item.sizeLabel &&
                                                ` (${item.sizeLabel})`}
                                            <span className="text-slate-400">
                                                {' '}×{item.quantity}
                                            </span>
                                        </span>
                                        <span className="font-semibold 
                                      text-slate-900">
                                            ₹{price * item.quantity}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="border-t border-slate-100 
                            pt-4 mb-6">
                            <div className="flex justify-between 
                              font-bold text-slate-900">
                                <span>Total</span>
                                <span className="text-pink-600 text-lg">
                                    ₹{wholesaleTotal}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handlePlaceOrder}
                            disabled={placing}
                            className="w-full py-4 bg-green-500 
                         text-white rounded-xl font-bold 
                         text-lg hover:bg-green-600 
                         transition-all 
                         disabled:opacity-50 
                         flex items-center 
                         justify-center gap-2"
                        >
                            {placing ? (
                                'Placing Order...'
                            ) : (
                                <>
                                    <span>💬</span>
                                    Place Order via WhatsApp
                                </>
                            )}
                        </button>
                        <p className="text-xs text-slate-400 
                           text-center mt-2">
                            WhatsApp will open with your order details
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
