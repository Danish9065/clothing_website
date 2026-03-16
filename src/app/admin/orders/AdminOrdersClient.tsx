'use client'

import { useState } from 'react'

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const day = date.getDate()
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    const hours = date.getHours()
    const minutes = date.getMinutes()
        .toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'AM' : 'am'
    const displayHour = hours % 12 || 12
    return `${day} ${month} ${year}, ${displayHour}:${minutes} ${ampm}`
}

const STATUS_OPTIONS = [
    {
        value: 'pending',
        label: 'Pending',
        color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
        value: 'confirmed',
        label: 'Confirmed',
        color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
        value: 'processing',
        label: 'Processing',
        color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
        value: 'shipped',
        label: 'Shipped',
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
        value: 'delivered',
        label: 'Delivered',
        color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
        value: 'cancelled',
        label: 'Cancelled',
        color: 'bg-red-50 text-red-700 border-red-200'
    },
]

const PAYMENT_OPTIONS = [
    {
        value: 'pending',
        label: 'Payment Pending',
        activeClass: 'bg-amber-500 text-white border-amber-500'
    },
    {
        value: 'received',
        label: '✅ Payment Received',
        activeClass: 'bg-green-500 text-white border-green-500'
    },
    {
        value: 'failed',
        label: '❌ Payment Failed',
        activeClass: 'bg-red-500 text-white border-red-500'
    },
]

export default function AdminOrdersClient({
    initialOrders
}: { initialOrders: any[] }) {
    const [orders, setOrders] = useState(initialOrders)
    const [expandedId, setExpandedId] = useState<
        string | null>(null)
    const [updatingId, setUpdatingId] = useState<
        string | null>(null)
    const [adminNotes, setAdminNotes] = useState<
        Record<string, string>>({})
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error'
    } | null>(null)

    function showToast(
        message: string,
        type: 'success' | 'error' = 'success'
    ) {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    function getStatusStyle(status: string) {
        return STATUS_OPTIONS.find(
            s => s.value === status
        )?.color ||
            'bg-slate-50 text-slate-700 border-slate-200'
    }

    async function updateOrder(
        orderId: string,
        updates: Record<string, any>
    ) {
        setUpdatingId(orderId)
        try {
            const res = await fetch(
                `/api/admin/orders/${orderId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updates),
                }
            )

            const json = await res.json()

            if (!res.ok) {
                showToast(
                    json.error || 'Update failed',
                    'error'
                )
                setUpdatingId(null)
                return
            }

            // Update local state immediately
            setOrders(prev => prev.map(o =>
                o.id === orderId
                    ? { ...o, ...updates }
                    : o
            ))

            // Show success message based on what changed
            if (updates.status) {
                showToast(`✅ Status → ${updates.status}`)
            } else if (updates.payment_status) {
                showToast(
                    `✅ Payment → ${updates.payment_status}`
                )
            } else if (updates.admin_notes !== undefined) {
                showToast('✅ Notes saved')
            }
        } catch (e: any) {
            console.error('updateOrder error:', e)
            showToast(e.message || 'Network error', 'error')
        }
        setUpdatingId(null)
    }

    async function saveNotes(orderId: string) {
        const notes = adminNotes[orderId] ??
            orders.find(
                o => o.id === orderId
            )?.admin_notes ?? ''
        await updateOrder(orderId, {
            admin_notes: notes
        })
    }

    return (
        <>
            {toast && (
                <div className={`fixed top-6 right-6 z-50 
                    px-5 py-3 rounded-xl shadow-lg text-white 
                    text-sm font-medium transition-all
                    ${toast.type === 'success'
                        ? 'bg-green-500'
                        : 'bg-red-500'}`}>
                    {toast.message}
                </div>
            )}
            <div className="space-y-4">
                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl border 
                        border-slate-100 p-12 
                        text-center">
                        <p className="text-slate-400 text-lg">
                            No orders yet
                        </p>
                    </div>
                ) : (
                    orders.map(order => {
                        const isExpanded = expandedId === order.id
                        const shortId = order.id.slice(0, 8)
                            .toUpperCase()
                        const date = formatDate(order.created_at)

                        return (
                            <div key={order.id}
                                className="bg-white rounded-2xl 
                            border border-slate-100 
                            overflow-hidden">
                                {/* Order Header */}
                                <div
                                    className="p-5 flex items-center 
                           gap-4 cursor-pointer 
                           hover:bg-slate-50 
                           transition-colors"
                                    onClick={() => setExpandedId(
                                        isExpanded ? null : order.id
                                    )}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center 
                                  gap-3 flex-wrap">
                                            <span className="font-mono 
                                      font-bold 
                                      text-slate-900">
                                                #{shortId}
                                            </span>
                                            <span className={`px-3 py-1 
                      rounded-full text-xs font-medium 
                      border ${getStatusStyle(
                                                order.status
                                            )}`}>
                                                {STATUS_OPTIONS.find(
                                                    s => s.value === order.status
                                                )?.label || order.status}
                                            </span>
                                            {order.payment_status === 'received' ? (
                                                <span className="px-3 py-1 rounded-full 
                                                               text-xs font-medium
                                                               bg-green-50 text-green-700 
                                                               border border-green-200">
                                                    ✅ Paid
                                                </span>
                                            ) : order.payment_status === 'failed' ? (
                                                <span className="px-3 py-1 rounded-full 
                                                               text-xs font-medium
                                                               bg-red-50 text-red-700 
                                                               border border-red-200">
                                                    ❌ Payment Failed
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full 
                                                               text-xs font-medium
                                                               bg-amber-50 text-amber-700 
                                                               border border-amber-200">
                                                    ⏳ Payment Pending
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center 
                                  gap-4 mt-1 flex-wrap">
                                            <span className="text-sm 
                                      font-semibold 
                                      text-slate-700">
                                                {order.business_name ||
                                                    order.contact_name ||
                                                    order.email}
                                            </span>
                                            {order.phone && (
                                                <a
                                                    href={`https://wa.me/91${order.phone}?text=${encodeURIComponent(`Hi! Your order #${shortId} from Little Mumbai Choice.`)}`}
                                                    target="_blank"
                                                    onClick={e => e.stopPropagation()}
                                                    className="text-xs text-green-600 
                                   hover:underline font-medium"
                                                >
                                                    📱 WhatsApp {order.phone}
                                                </a>
                                            )}
                                            <span className="text-xs 
                                      text-slate-400">
                                                {date}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right 
                                flex-shrink-0">
                                        <p className="text-xl font-bold 
                                 text-slate-900">
                                            ₹{order.total_amount}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {order.order_items?.length || 0} items
                                        </p>
                                    </div>
                                    <span className="text-slate-400 
                                  text-lg ml-2">
                                        {isExpanded ? '▲' : '▼'}
                                    </span>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="border-t 
                                border-slate-100 p-5">
                                        <div className="grid grid-cols-1 
                                  md:grid-cols-2 gap-6">
                                            {/* Left: Customer + Items */}
                                            <div className="space-y-4">
                                                {/* Customer Details */}
                                                <div className="bg-slate-50 
                                      rounded-xl p-4">
                                                    <h3 className="font-semibold 
                          text-slate-900 text-sm mb-3">
                                                        Customer Details
                                                    </h3>
                                                    <div className="space-y-1 
                                        text-sm">
                                                        {order.business_name && (
                                                            <p>
                                                                <span className="text-slate-400">
                                                                    Shop:
                                                                </span>
                                                                <span className="ml-2 
                                font-medium 
                                text-slate-700">
                                                                    {order.business_name}
                                                                </span>
                                                            </p>
                                                        )}
                                                        {order.contact_name && (
                                                            <p>
                                                                <span className="text-slate-400">
                                                                    Name:
                                                                </span>
                                                                <span className="ml-2 
                                text-slate-700">
                                                                    {order.contact_name}
                                                                </span>
                                                            </p>
                                                        )}
                                                        {order.phone && (
                                                            <p>
                                                                <span className="text-slate-400">
                                                                    Phone:
                                                                </span>
                                                                <span className="ml-2 
                                text-slate-700">
                                                                    {order.phone}
                                                                </span>
                                                            </p>
                                                        )}
                                                        {order.email && (
                                                            <p>
                                                                <span className="text-slate-400">
                                                                    Email:
                                                                </span>
                                                                <span className="ml-2 
                                text-slate-700">
                                                                    {order.email}
                                                                </span>
                                                            </p>
                                                        )}
                                                        {order.shipping_address && (
                                                            <p>
                                                                <span className="text-slate-400">
                                                                    Address:
                                                                </span>
                                                                <span className="ml-2 
                                text-slate-700">
                                                                    {order.shipping_address}
                                                                </span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Order Items */}
                                                <div>
                                                    <h3 className="font-semibold 
                          text-slate-900 text-sm mb-3">
                                                        Items Ordered
                                                    </h3>
                                                    <div className="space-y-2">
                                                        {(order.order_items || [])
                                                            .map((item: any) => (
                                                                <div key={item.id}
                                                                    className="flex 
                                   justify-between 
                                   text-sm p-3 
                                   bg-slate-50 
                                   rounded-xl">
                                                                    <span className="text-slate-700">
                                                                        {item.product_name ||
                                                                            'Product'}
                                                                        {item.size_label && (
                                                                            <span className="ml-2 
                                    text-xs px-2 py-0.5 
                                    bg-slate-200 rounded-full">
                                                                                {item.size_label}
                                                                            </span>
                                                                        )}
                                                                        <span className="text-slate-400 
                                                  ml-2">
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
                                                        <div className="flex 
                            justify-between font-bold 
                            text-slate-900 pt-2 
                            border-t border-slate-200">
                                                            <span>Total</span>
                                                            <span className="text-pink-600">
                                                                ₹{order.total_amount}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Status Controls */}
                                            <div className="space-y-4">
                                                {/* Order Status */}
                                                <div className="bg-slate-50 
                                      rounded-xl p-4">
                                                    <h3 className="font-semibold 
                          text-slate-900 text-sm mb-3">
                                                        Update Order Status
                                                    </h3>
                                                    <div className="grid 
                                        grid-cols-2 
                                        gap-2">
                                                        {STATUS_OPTIONS.map(s => (
                                                            <button
                                                                key={s.value}
                                                                onClick={() => updateOrder(
                                                                    order.id,
                                                                    { status: s.value }
                                                                )}
                                                                disabled={
                                                                    updatingId === order.id
                                                                }
                                                                className={`py-2 px-3 
                                rounded-xl text-xs 
                                font-medium border 
                                transition-all
                                ${order.status === s.value
                                                                        ? `${s.color} 
                                     ring-2 ring-offset-1 
                                     ring-current 
                                     font-bold`
                                                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                                                                    }`}
                                                            >
                                                                {order.status === s.value
                                                                    ? '✓ ' : ''}
                                                                {s.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Payment Status */}
                                                <div className="bg-slate-50 rounded-xl p-4">
                                                    <h3 className="font-semibold text-slate-900 
                                                                  text-sm mb-3">
                                                        Payment Status
                                                    </h3>
                                                    <div className="flex flex-col gap-2">
                                                        {PAYMENT_OPTIONS.map(p => (
                                                            <button
                                                                key={p.value}
                                                                onClick={() => updateOrder(
                                                                    order.id,
                                                                    { payment_status: p.value }
                                                                )}
                                                                disabled={updatingId === order.id}
                                                                className={`w-full py-2.5 px-4 
                                                          rounded-xl text-sm font-semibold 
                                                          border transition-all text-left
                                                          flex items-center justify-between
                                                          ${order.payment_status === p.value
                                                                        ? p.activeClass
                                                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                                                    }
                                                          disabled:opacity-50`}
                                                            >
                                                                <span>{p.label}</span>
                                                                {order.payment_status === p.value && (
                                                                    <span className="text-xs opacity-75">
                                                                        ← current
                                                                    </span>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* WhatsApp Customer */}
                                                {order.phone && (
                                                    <a
                                                        href={`https://wa.me/91${order.phone}?text=${encodeURIComponent(
                                                            `Hi ${order.contact_name || order.business_name}! 👋\n\nYour order #${shortId} from Little Mumbai Choice.\n\nStatus: ${STATUS_OPTIONS.find(s => s.value === order.status)?.label || order.status}\n\nThank you for shopping with us! 🙏`
                                                        )}`}
                                                        target="_blank"
                                                        className="flex items-center 
                                     justify-center gap-2 
                                     w-full py-3 
                                     bg-green-500 
                                     text-white rounded-xl 
                                     text-sm font-semibold 
                                     hover:bg-green-600 
                                     transition-all"
                                                    >
                                                        <span>💬</span>
                                                        Message Customer on WhatsApp
                                                    </a>
                                                )}

                                                {/* Admin Notes */}
                                                <div>
                                                    <label className="text-xs 
                          font-semibold text-slate-500 
                          uppercase tracking-wider">
                                                        Admin Notes
                                                    </label>
                                                    <textarea
                                                        value={adminNotes[order.id]
                                                            ?? (order.admin_notes || '')}
                                                        onChange={e => setAdminNotes(
                                                            prev => ({
                                                                ...prev,
                                                                [order.id]: e.target.value
                                                            })
                                                        )}
                                                        placeholder="Internal notes about this order..."
                                                        rows={3}
                                                        className="mt-1 w-full px-3 
                                     py-2 border 
                                     border-slate-200 
                                     rounded-xl text-sm 
                                     focus:outline-none 
                                     focus:ring-2 
                                     focus:ring-pink-400"
                                                    />
                                                    <button
                                                        onClick={() => saveNotes(
                                                            order.id
                                                        )}
                                                        className="mt-2 px-4 py-2 
                                     bg-slate-900 
                                     text-white rounded-lg 
                                     text-xs font-medium 
                                     hover:bg-slate-800"
                                                    >
                                                        Save Notes
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </>
    )
}
