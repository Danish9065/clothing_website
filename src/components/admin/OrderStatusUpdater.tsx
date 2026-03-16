"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Package, Truck, PackageCheck, AlertCircle, X } from "lucide-react";

type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

const transitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
};

const statusLabels: Record<OrderStatus, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

export function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string, currentStatus: OrderStatus }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState("");

    const allowedNext = transitions[currentStatus] || [];

    if (allowedNext.length === 0) {
        return (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 text-center italic">
                This order is {currentStatus}. No further status updates available.
            </div>
        );
    }

    const handleUpdate = async (newStatus: OrderStatus) => {
        setIsUpdating(true);
        setError("");
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error?.message || "Failed to update status");

            setIsOpen(false);
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="mt-6 border-t border-slate-100 pt-6">
            <button
                onClick={() => setIsOpen(true)}
                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-md"
            >
                Update Status
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-900">Update Order Status</h2>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 outline-none">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                            <p className="text-sm text-slate-500 mb-2">Select the new status for this order:</p>

                            <div className="space-y-3">
                                {allowedNext.map(status => (
                                    <button
                                        key={status}
                                        onClick={() => handleUpdate(status)}
                                        disabled={isUpdating}
                                        className={`
                      w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all font-bold group
                      ${status === 'cancelled'
                                                ? 'border-red-100 hover:border-red-500 bg-red-50 text-red-700'
                                                : 'border-slate-100 hover:border-brand-500 hover:bg-brand-50 text-slate-700 hover:text-brand-700'}
                      ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                                    >
                                        {statusLabels[status]}
                                        {status === 'cancelled' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
