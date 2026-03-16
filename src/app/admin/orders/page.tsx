import { createAdminClient } from '@/lib/supabase/admin'
import AdminOrdersClient from './AdminOrdersClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminOrdersPage() {
    const supabase = createAdminClient()

    const { data: orders } = await supabase
        .from('orders')
        .select(`
      id, business_name, contact_name, phone,
      email, shipping_address, total_amount,
      status, payment_status, admin_notes,
      created_at,
      order_items (
        id, product_name, size_label,
        quantity, unit_price, total_price
      )
    `)
        .order('created_at', { ascending: false })

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold 
                        text-slate-900">
                    Orders
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    {orders?.length || 0} total orders
                </p>
            </div>
            <AdminOrdersClient
                initialOrders={orders || []}
            />
        </div>
    )
}
