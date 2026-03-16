import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminDashboardPage() {
    const supabase = createAdminClient()

    // Fetch all stats in parallel
    const [
        { data: products },
        { data: variants },
        { data: orders },
        { data: recentOrders },
    ] = await Promise.all([
        supabase
            .from('products')
            .select('id, name, is_active'),
        supabase
            .from('product_variants')
            .select('id, stock_quantity, is_active, product_id, size_label, products(name)'),
        supabase
            .from('orders')
            .select('id, created_at, total_amount, status')
            .gte('created_at',
                new Date().toISOString().split('T')[0]),
        supabase
            .from('orders')
            .select(`
        id, created_at, total_amount, status,
        business_name, email
      `)
            .order('created_at', { ascending: false })
            .limit(5),
    ])

    const totalProducts = products?.length || 0
    const activeProducts = products?.filter(
        p => p.is_active
    ).length || 0
    const outOfStock = variants?.filter(
        v => v.is_active !== false &&
            (v.stock_quantity || 0) === 0
    ).length || 0
    const ordersToday = orders?.length || 0

    const lowStockVariants = (variants || [])
        .filter(v =>
            v.is_active !== false &&
            (v.stock_quantity || 0) > 0 &&
            (v.stock_quantity || 0) <= 5
        )
        .slice(0, 10)

    const stats = [
        {
            label: 'TOTAL PRODUCTS',
            value: totalProducts,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
        },
        {
            label: 'ACTIVE PRODUCTS',
            value: activeProducts,
            color: 'text-green-500',
            bg: 'bg-green-50',
        },
        {
            label: 'OUT OF STOCK',
            value: outOfStock,
            color: 'text-red-500',
            bg: 'bg-red-50',
        },
        {
            label: 'ORDERS TODAY',
            value: ordersToday,
            color: 'text-purple-500',
            bg: 'bg-purple-50',
        },
    ]

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">
                    Dashboard
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Welcome back, Admin
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-2xl border border-slate-100 p-6"
                    >
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            {stat.label}
                        </p>
                        <p className={`text-4xl font-bold ${stat.color}`}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Low Stock + Recent Orders */}
            <div className="grid grid-cols-2 gap-6">
                {/* Low Stock Alert */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        ⚠️ Low Stock Alert
                        <span className="text-xs font-normal text-slate-400">
                            (5 or fewer remaining)
                        </span>
                    </h2>
                    {lowStockVariants.length === 0 ? (
                        <p className="text-slate-400 text-sm py-4">
                            All products have healthy stock levels.
                        </p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                                    <th className="pb-2">Product</th>
                                    <th className="pb-2">Size</th>
                                    <th className="pb-2">Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockVariants.map((v: any) => (
                                    <tr key={v.id} className="border-b border-slate-50">
                                        <td className="py-2 text-slate-700 truncate max-w-[140px]">
                                            {(v.products as any)?.name || '—'}
                                        </td>
                                        <td className="py-2 text-slate-500">
                                            {v.size_label}
                                        </td>
                                        <td className="py-2">
                                            <span className="text-amber-600 font-bold">
                                                {v.stock_quantity}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-slate-900">
                            Recent Orders
                        </h2>
                        <a href="/admin/orders" className="text-pink-500 text-sm font-medium hover:underline">
                            View All →
                        </a>
                    </div>
                    {!recentOrders || recentOrders.length === 0 ? (
                        <p className="text-slate-400 text-sm py-4">
                            No recent orders.
                        </p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                                    <th className="pb-2">Business</th>
                                    <th className="pb-2">Total</th>
                                    <th className="pb-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order: any) => (
                                    <tr key={order.id} className="border-b border-slate-50">
                                        <td className="py-2 text-slate-700 truncate max-w-[140px]">
                                            {order.business_name || order.email}
                                        </td>
                                        <td className="py-2 font-semibold text-slate-900">
                                            ₹{order.total_amount}
                                        </td>
                                        <td className="py-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                        ${order.status === 'delivered'
                                                    ? 'bg-green-50 text-green-700'
                                                    : order.status === 'pending'
                                                        ? 'bg-amber-50 text-amber-700'
                                                        : 'bg-blue-50 text-blue-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}
