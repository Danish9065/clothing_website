import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { ChevronLeft, Truck, PackageCheck, Package, Clock, CheckCircle2 } from "lucide-react";
import { ReorderButton } from "@/components/account/ReorderButton";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch the order with items, products, variants, and shipping
    const { data: order, error } = await supabase
        .from("orders")
        .select(`
      *,
      shipping_address:addresses(*),
      items:order_items(
        *,
        product:products(name, slug, min_order_quantity),
        variant:product_variants(size, stock_quantity)
      )
    `)
        .eq("id", params.id)
        .eq("profile_id", user.id)
        .single();

    if (error || !order) {
        return notFound();
    }

    // Format statuses for timeline
    const statuses = ["pending", "confirmed", "processing", "shipped", "delivered"];
    const currentIndex = statuses.indexOf(order.status);
    const isCancelled = order.status === "cancelled";

    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/account" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-sm border border-slate-200 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            Order #{order.id.split("-")[0].toUpperCase()}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                {/* Status Timeline */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 mb-8 overflow-x-auto">
                    {isCancelled ? (
                        <div className="flex items-center gap-4 text-red-600 bg-red-50 p-4 rounded-xl">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">✕</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Order Cancelled</h3>
                                <p className="text-sm">This order has been cancelled.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="min-w-[500px]">
                            <div className="flex justify-between items-center relative z-10 px-4">
                                {/* Connecting Line */}
                                <div className="absolute top-1/2 left-10 right-10 h-1 bg-slate-100 -z-10 -translate-y-1/2 rounded-full"></div>
                                <div
                                    className="absolute top-1/2 left-10 h-1 bg-brand-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
                                    style={{ width: `min(100%, ${(currentIndex / (statuses.length - 1)) * 100}% - 2.5rem)` }}
                                ></div>

                                {/* Steps */}
                                <Step
                                    icon={<Clock className="w-5 h-5" />}
                                    label="Pending"
                                    active={currentIndex >= 0}
                                    current={currentIndex === 0}
                                />
                                <Step
                                    icon={<CheckCircle2 className="w-5 h-5" />}
                                    label="Confirmed"
                                    active={currentIndex >= 1}
                                    current={currentIndex === 1}
                                />
                                <Step
                                    icon={<Package className="w-5 h-5" />}
                                    label="Processing"
                                    active={currentIndex >= 2}
                                    current={currentIndex === 2}
                                />
                                <Step
                                    icon={<Truck className="w-5 h-5" />}
                                    label="Shipped"
                                    active={currentIndex >= 3}
                                    current={currentIndex === 3}
                                />
                                <Step
                                    icon={<PackageCheck className="w-5 h-5" />}
                                    label="Delivered"
                                    active={currentIndex >= 4}
                                    current={currentIndex === 4}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Main - Items list */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h2 className="text-lg font-bold text-slate-900">Order Items ({order.items?.length || 0})</h2>
                                {(order.status === "delivered" || order.status === "cancelled") && (
                                    <ReorderButton orderItems={order.items || []} />
                                )}
                            </div>
                            <div className="divide-y divide-slate-100">
                                {order.items?.map((item: any) => (
                                    <div key={item.id} className="p-6 flex gap-4 sm:gap-6">
                                        <div className="w-20 h-28 sm:w-24 sm:h-32 bg-slate-100 rounded-lg overflow-hidden relative flex-shrink-0 border border-slate-200">
                                            <Image src="/placeholder.jpg" alt={item.product?.name || "Product"} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <Link href={`/product/${item.product?.slug}`} className="text-base sm:text-lg font-bold text-slate-900 hover:text-brand-600 line-clamp-2 mb-1">
                                                {item.product?.name || "Unknown Product"}
                                            </Link>
                                            <p className="text-sm text-slate-500 mb-2">Size: <span className="font-medium text-slate-900">{item.variant?.size}</span></p>

                                            <div className="flex justify-between items-end mt-auto">
                                                <div>
                                                    <p className="text-slate-500 text-xs sm:text-sm">Price: ₹{item.price_at_time}</p>
                                                    <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Quantity: <span className="font-bold text-slate-900">{item.quantity}</span> pcs</p>
                                                </div>
                                                <p className="text-lg font-bold text-slate-900">₹{item.price_at_time * item.quantity}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Summary & Shipping */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Payment Summary</h3>
                            <div className="space-y-3 mb-4 text-sm text-slate-600">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₹{order.total_amount}</span> {/* Assuming DB stored final, if shipping is separate, adjust logic */}
                                </div>
                                {/* Assuming Free shipping for display, actual DB should store shipping cost */}
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                                <span className="font-bold text-slate-900">Total</span>
                                <span className="text-2xl font-black text-brand-600">₹{order.total_amount}</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Shipping Details</h3>
                            {order.shipping_address ? (
                                <div className="text-sm text-slate-600 leading-relaxed">
                                    <p className="font-bold text-slate-900">{order.shipping_address.full_name}</p>
                                    <p>{order.shipping_address.address_line1}</p>
                                    {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                                    <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                                    <p className="mt-2 font-medium">Phone: +91 {order.shipping_address.phone_number}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic">No address provided.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function Step({ icon, label, active, current }: { icon: React.ReactNode, label: string, active: boolean, current: boolean }) {
    return (
        <div className="flex flex-col items-center gap-3 relative">
            <div className={`
        w-12 h-12 rounded-full flex items-center justify-center border-4 relative z-10 transition-all duration-300
        ${active
                    ? 'bg-brand-500 border-white text-white shadow-md'
                    : 'bg-slate-100 border-white text-slate-400'
                }
        ${current ? 'ring-4 ring-brand-100 scale-110' : ''}
      `}>
                {icon}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wide transition-colors ${active ? 'text-slate-900' : 'text-slate-400'}`}>
                {label}
            </span>
        </div>
    );
}
