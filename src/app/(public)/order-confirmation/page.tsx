'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function OrderConfirmationContent() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get('id') || ''
    const shortId = orderId.slice(0, 8).toUpperCase()

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-slate-100">
                <div className="text-6xl mb-4">✅</div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    Order Placed!
                </h1>
                <p className="text-slate-500 mb-2">
                    Order ID:
                    <span className="font-mono font-bold text-slate-900 ml-1">
                        #{shortId}
                    </span>
                </p>
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 my-6 text-left">
                    <p className="text-green-800 font-semibold text-sm mb-1">
                        📱 WhatsApp has been opened
                    </p>
                    <p className="text-green-700 text-xs">
                        If WhatsApp didn't open, message us at
                        <a href="https://wa.me/919310708172"
                            className="font-bold ml-1 underline"
                            target="_blank">
                            9310708172
                        </a>
                    </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-left">
                    <p className="text-amber-800 font-semibold text-sm mb-2">
                        What happens next?
                    </p>
                    <ol className="text-amber-700 text-xs space-y-1">
                        <li>1. We review your order on WhatsApp</li>
                        <li>2. We confirm availability & share payment details</li>
                        <li>3. You pay via UPI/Bank Transfer</li>
                        <li>4. We dispatch your order 🚚</li>
                    </ol>
                </div>
                <Link href="/catalog"
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold block hover:bg-slate-800">
                    Continue Shopping
                </Link>
            </div>
        </div>
    )
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        }>
            <OrderConfirmationContent />
        </Suspense>
    )
}
