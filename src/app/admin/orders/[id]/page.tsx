import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, MessageCircle, MapPin, User, Mail, Phone, Calendar, AlertCircle } from "lucide-react";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();

    const { data: order, error } = await supabase
        .from("orders")
        .select(`
      *,
      profile:profiles(business_name, full_name, phone, role),
      shipping_address:addresses(*),
      items:order_items(
        *,
        product:products(name, slug, min_order_quantity),
        variant:product_variants(size, sku)
      )
    `)
        .eq("id", params.id)
        .single();

    if (error || !order) {
        return notFound();
    }

    const dateIST = new Date(order.created_at).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });

    const businessName = order.profile?.business_name || order.profile?.full_name || "Guest";
    const userPhone = order.shipping_address?.phone_number || order.profile?.phone;
    // Fallback to finding user email directly from auth if joined (supabase doesn't cleanly join auth.users without rpc usually, so maybe order has it?)
    // Using profile ID for now

    const handleWhatsAppHref = () => {
        if (!userPhone) return "#";
        const phone = userPhone.replace(/[^0-9]/g, '');
        const msg = encodeURIComponent(`Hi ${businessName}, your order #${order.id.split("-")[0].toUpperCase()} status is now ${order.status.toUpperCase()}. Thank you for shopping with Little Mumbai Choice.`);
        const waNum = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9310708172";
        return `https://wa.me/91${waNum}?text=${msg}`;
    };

    const statusColors: any = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
        processing: 'bg-purple-100 text-purple-800 border-purple-200',
        shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        delivered: 'bg-green-100 text-green-800 border-green-200',
        cancelled: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
        <div className="space-y-6 max-w-6xl">
            <div className="mb-2">
                <Link href="/admin/orders" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Orders
                </Link>
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-3xl font-black text-slate-900">
                            #{order.id.split("-")[0].toUpperCase()}
                        </h1>
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md border ${statusColors[order.status] || 'bg-slate-100 text-slate-800'}`}>
                            {order.status}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {dateIST}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1.5 font-medium text-slate-700"><User className="w-4 h-4" /> {businessName}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {userPhone && (
                        <a
                            href={handleWhatsAppHref()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#1ebd5a] transition shadow-sm"
                        >
                            <MessageCircle className="w-5 h-5" />
                            WhatsApp Buyer
                        </a>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Main Section */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Items Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-900">Order Items</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Product</th>
                                        <th className="px-6 py-4">Size</th>
                                        <th className="px-6 py-4 text-center">Min.Q</th>
                                        <th className="px-6 py-4 text-center">Qty</th>
                                        <th className="px-6 py-4 text-right">Price</th>
                                        <th className="px-6 py-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {order.items?.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4 border-slate-200 min-w-[200px]">
                                                    <div className="w-10 h-14 bg-slate-100 rounded flex-shrink-0 relative overflow-hidden">
                                                        <Image src="/placeholder.jpg" alt={item.product?.name || "Product"} fill className="object-cover" />
                                                    </div>
                                                    <Link href={`/admin/products/${item.product?.id}`} className="font-bold text-slate-900 hover:text-brand-600 truncate max-w-[250px] inline-block">
                                                        {item.product?.name || "Unknown Product"}
                                                    </Link>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-700">{item.variant?.size || "-"}</td>
                                            <td className="px-6 py-4 text-center text-slate-500">{item.product?.min_order_quantity || 1}</td>
                                            <td className="px-6 py-4 text-center font-bold text-slate-900">{item.quantity}</td>
                                            <td className="px-6 py-4 text-right text-slate-500">₹{item.price_at_time}</td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-900">₹{item.price_at_time * item.quantity}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-slate-50 border-t-2 border-slate-100">
                                        <td colSpan={5} className="px-6 py-4 text-right font-medium text-slate-500">Order Total</td>
                                        <td className="px-6 py-4 text-right font-black text-brand-600 text-lg">₹{order.total_amount}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Optional Order Notes */}
                    {order.notes && (
                        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 flex gap-4">
                            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-amber-900 mb-1">Order Notes / Instructions</h3>
                                <p className="text-amber-800 text-sm whitespace-pre-wrap">{order.notes}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">

                    {/* Status Panel */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Status Control</h3>

                        <div className="mb-4">
                            <p className="text-sm font-medium text-slate-500 mb-1">Current Status</p>
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-sm uppercase tracking-wide ${statusColors[order.status] || 'bg-slate-100 text-slate-800'}`}>
                                <div className={`w-2 h-2 rounded-full bg-current opacity-75`}></div>
                                {order.status}
                            </div>
                        </div>

                        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                    </div>

                    {/* Customer Panel */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Customer Info</h3>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="font-bold text-slate-900">{businessName}</p>
                                    <p className="text-sm text-slate-500">Profile ID: {order.profile_id.substring(0, 8)}...</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 pt-2 text-sm text-slate-600">
                                {userPhone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span>+91 {userPhone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <span className="truncate">Contact buyer via auth email</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Panel */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Shipping Address</h3>

                        {order.shipping_address ? (
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                                <div className="text-sm text-slate-700 leading-relaxed">
                                    <p className="font-bold text-slate-900 mb-1">{order.shipping_address.full_name}</p>
                                    <p>{order.shipping_address.address_line1}</p>
                                    {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                                    <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                                    <p className="font-medium mt-1">PIN: {order.shipping_address.postal_code}</p>
                                    <p className="mt-2 text-slate-500 flex items-center gap-2">
                                        <Phone className="w-3 h-3" /> {order.shipping_address.phone_number}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 italic">No address provided or digital order.</p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
