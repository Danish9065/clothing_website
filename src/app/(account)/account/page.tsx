import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Package, ChevronRight, FileText } from "lucide-react";
import SignOutButton from "@/components/public/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch orders
    const { data: orders } = await supabase
        .from("orders")
        .select("*, items:order_items(count)")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false });

    // Status badge config
    const statusConfig: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800",
        confirmed: "bg-blue-100 text-blue-800",
        processing: "bg-indigo-100 text-indigo-800",
        shipped: "bg-purple-100 text-purple-800",
        delivered: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
    };

    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Account</h1>
                        <p className="text-slate-500 mt-2">Manage your wholesale orders</p>
                    </div>
                    <SignOutButton />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                        <Package className="w-6 h-6 text-brand-600" />
                        <h2 className="text-xl font-bold text-slate-900">Order History</h2>
                    </div>

                    {orders && orders.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {orders.map((order: any) => {
                                const itemCount = order.items?.[0]?.count || 0;
                                return (
                                    <Link
                                        key={order.id}
                                        href={`/account/orders/${order.id}`}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-8 hover:bg-slate-50 transition-colors group"
                                    >
                                        <div className="mb-4 sm:mb-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-bold text-slate-900">
                                                    #{order.id.split("-")[0].toUpperCase()}
                                                </span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusConfig[order.status] || "bg-slate-100 text-slate-800"}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 flex items-center gap-3">
                                                <span>{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between sm:gap-8">
                                            <div className="text-left sm:text-right">
                                                <p className="text-xs text-slate-400 font-medium mb-0.5 uppercase tracking-wider">Total</p>
                                                <p className="text-lg font-bold text-slate-900">₹{order.total_amount}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No orders found</h3>
                            <p className="text-slate-500 mb-6">You haven't placed any wholesale orders yet.</p>
                            <Link href="/catalog" className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-sm">
                                Start Shopping
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
