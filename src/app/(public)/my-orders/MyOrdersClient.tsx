'use client'

import { useState } from 'react'
import Link from 'next/link'

function formatDateOnly(dateString: string): string {
    const date = new Date(dateString)
    const day = date.getDate()
    const months = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ]
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
}

const STATUS_STEPS = [
    'pending', 'confirmed', 'processing',
    'shipped', 'delivered'
]

const STATUS_INFO: Record<string, {
    label: string; color: string; icon: string
}> = {
    pending: {
        label: 'Order Placed',
        color: 'text-amber-600',
        icon: '⏳'
    },
    confirmed: {
        label: 'Confirmed',
        color: 'text-blue-600',
        icon: '✅'
    },
    processing: {
        label: 'Processing',
        color: 'text-purple-600',
        icon: '📦'
    },
    shipped: {
        label: 'Shipped',
        color: 'text-indigo-600',
        icon: '🚚'
    },
    delivered: {
        label: 'Delivered',
        color: 'text-green-600',
        icon: '🎉'
    },
    cancelled: {
        label: 'Cancelled',
        color: 'text-red-600',
        icon: '❌'
    },
}

export default function MyOrdersClient({
    orders
}: { orders: any[] }) {
    const [expandedId, setExpandedId] =
        useState<string | null>(
            orders[0]?.id || null
        )

    if (orders.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 
                      flex items-center 
                      justify-center p-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <h2 className="text-xl font-bold 
                          text-slate-900 mb-2">
                        No orders yet
                    </h2>
                    <p className="text-slate-500 mb-6">
                        You haven't placed any orders yet.
                    </p>
                    <Link href="/catalog"
                        className="px-8 py-3 bg-slate-900 
                           text-white rounded-xl 
                           font-semibold">
                        Browse Catalog
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-3xl mx-auto px-4">
                <div className="flex items-center 
                        justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold 
                            text-slate-900">
                            My Orders
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            {orders.length} order
                            {orders.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 border border-slate-200 
                                      rounded-xl text-sm text-slate-500 
                                      hover:bg-slate-100 flex items-center 
                                      gap-2"
                        >
                            🔄 Refresh Status
                        </button>
                        <Link href="/catalog"
                            className="px-4 py-2 border 
                               border-slate-200 rounded-xl 
                               text-sm font-medium 
                               text-slate-600 
                               hover:bg-slate-100">
                            + New Order
                        </Link>
                    </div>
                </div>

                <div className="space-y-4">
                    {orders.map(order => {
                        const isExpanded = expandedId === order.id
                        const shortId = order.id.slice(0, 8)
                            .toUpperCase()
                        const statusInfo = STATUS_INFO[
                            order.status
                        ] || STATUS_INFO.pending
                        const currentStep = STATUS_STEPS.indexOf(
                            order.status
                        )
                        const date = formatDateOnly(order.created_at)

                        return (
                            <div key={order.id}
                                className="bg-white rounded-2xl 
                              border border-slate-100 
                              overflow-hidden">
                                {/* Header */}
                                <div
                                    className="p-5 cursor-pointer 
                             hover:bg-slate-50 
                             transition-colors"
                                    onClick={() => setExpandedId(
                                        isExpanded ? null : order.id
                                    )}
                                >
                                    <div className="flex items-center 
                                  justify-between">
                                        <div>
                                            <div className="flex items-center 
                                      gap-3">
                                                <span className="text-lg">
                                                    {statusInfo.icon}
                                                </span>
                                                <span className="font-mono 
                                          font-bold 
                                          text-slate-900">
                                                    #{shortId}
                                                </span>
                                                <span className={`text-sm 
                          font-semibold 
                          ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                                {order.payment_status ===
                                                    'received' ? (
                                                    <span className="text-xs 
                            bg-green-50 text-green-700 
                            px-2 py-0.5 rounded-full">
                                                        ✅ Paid
                                                    </span>
                                                ) : (
                                                    <span className="text-xs 
                            bg-amber-50 text-amber-700 
                            px-2 py-0.5 rounded-full">
                                                        ⏳ Payment Pending
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs 
                                     text-slate-400 
                                     mt-1 ml-8">
                                                Placed on {date}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold 
                                     text-slate-900">
                                                ₹{order.total_amount}
                                            </p>
                                            <p className="text-xs 
                                     text-slate-400">
                                                {isExpanded ? '▲' : '▼'}
                                                {isExpanded
                                                    ? 'Hide' : 'Details'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress bar 
                      (not for cancelled orders) */}
                                    {order.status !== 'cancelled' && (
                                        <div className="mt-4 ml-8">
                                            <div className="flex items-center 
                                      gap-1">
                                                {STATUS_STEPS.map((step, i) => (
                                                    <div key={step}
                                                        className="flex items-center 
                                          flex-1">
                                                        <div className={`w-4 h-4 
                              rounded-full flex-shrink-0 
                              flex items-center 
                              justify-center text-xs
                              ${i <= currentStep
                                                                ? 'bg-green-500 text-white'
                                                                : 'bg-slate-200 text-slate-400'
                                                            }`}>
                                                            {i <= currentStep
                                                                ? '✓' : ''}
                                                        </div>
                                                        {i < STATUS_STEPS.length - 1 && (
                                                            <div className={`flex-1 
                                h-0.5 mx-1
                                ${i < currentStep
                                                                    ? 'bg-green-500'
                                                                    : 'bg-slate-200'
                                                                }`} />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-between 
                                      mt-1">
                                                {STATUS_STEPS.map((step, i) => (
                                                    <span key={step}
                                                        className={`text-xs 
                            ${i <= currentStep
                                                                ? 'text-green-600 font-medium'
                                                                : 'text-slate-400'
                                                            }`}>
                                                        {step === 'pending'
                                                            ? 'Placed'
                                                            : step === 'confirmed'
                                                                ? 'Confirmed'
                                                                : step === 'processing'
                                                                    ? 'Packing'
                                                                    : step === 'shipped'
                                                                        ? 'Shipped'
                                                                        : 'Done'}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Expanded Items */}
                                {isExpanded && (
                                    <div className="border-t 
                                  border-slate-100 p-5">
                                        <h3 className="font-semibold 
                                    text-slate-900 
                                    text-sm mb-3">
                                            Items
                                        </h3>
                                        <div className="space-y-2 mb-4">
                                            {(order.order_items || [])
                                                .map((item: any) => (
                                                    <div key={item.id}
                                                        className="flex 
                               justify-between 
                               text-sm p-3 
                               bg-slate-50 
                               rounded-xl">
                                                        <span className="text-slate-700">
                                                            {item.product_name}
                                                            {item.size_label && (
                                                                <span className="ml-2 
                                text-xs px-2 py-0.5 
                                bg-white border 
                                border-slate-200 
                                rounded-full">
                                                                    {item.size_label}
                                                                </span>
                                                            )}
                                                            <span className="text-slate-400 
                                              ml-1">
                                                                ×{item.quantity}
                                                            </span>
                                                        </span>
                                                        <span className="font-semibold 
                                           text-slate-900">
                                                            ₹{item.total_price ||
                                                                (item.unit_price *
                                                                    item.quantity)}
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>

                                        {order.shipping_address && (
                                            <div className="bg-slate-50 
                                      rounded-xl p-3 
                                      text-sm">
                                                <span className="font-medium 
                                          text-slate-500">
                                                    Delivery to:
                                                </span>
                                                <span className="ml-2 
                                          text-slate-700">
                                                    {order.shipping_address}
                                                </span>
                                            </div>
                                        )}

                                        {order.payment_status !==
                                            'received' && (
                                                <div className="mt-4 p-4 
                                      bg-amber-50 
                                      border 
                                      border-amber-200 
                                      rounded-xl">
                                                    <p className="text-amber-800 
                                       font-semibold 
                                       text-sm">
                                                        💳 Payment Pending
                                                    </p>
                                                    <p className="text-amber-700 
                                       text-xs mt-1">
                                                        Please send payment via UPI/
                                                        Bank Transfer as shared on
                                                        WhatsApp.
                                                    </p>
                                                    <a
                                                        href={`https://wa.me/919310708172?text=${encodeURIComponent(`Hi! I want to know the payment details for my order #${shortId}`)}`}
                                                        target="_blank"
                                                        className="inline-flex 
                                     items-center gap-2 
                                     mt-3 px-4 py-2 
                                     bg-green-500 
                                     text-white rounded-xl 
                                     text-xs font-semibold"
                                                    >
                                                        💬 Ask on WhatsApp
                                                    </a>
                                                </div>
                                            )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
