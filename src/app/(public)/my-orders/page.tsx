import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MyOrdersClient from './MyOrdersClient'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MyOrdersPage() {
    const supabase = await createClient()
    const { data: { user } } = await
        supabase.auth.getUser()

    if (!user) {
        redirect('/login?redirect=/my-orders')
    }

    // Use admin client to bypass RLS issues
    const adminSupabase = createAdminClient()

    const { data: orders, error } = await adminSupabase
        .from('orders')
        .select(`
      id,
      business_name,
      contact_name,
      total_amount,
      status,
      payment_status,
      shipping_address,
      created_at,
      order_items (
        id,
        product_name,
        size_label,
        quantity,
        unit_price,
        total_price
      )
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('My orders error:', error)
    }

    return <MyOrdersClient orders={orders || []} />
}
