import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    const authSupabase = await createClient()
    const { data: { user } } = await
        authSupabase.auth.getUser()

    if (!user) {
        return Response.json(
            { error: 'Please login to place an order' },
            { status: 401 }
        )
    }

    const body = await request.json()
    const supabase = createAdminClient()

    // First check which columns exist by trying
    // a safe minimal insert
    const orderData: Record<string, any> = {
        user_id: user.id,
        total_amount: Number(body.total_amount) || 0,
        status: 'pending',
    }

    // Safely add optional columns
    if (body.business_name !== undefined)
        orderData.business_name = body.business_name
    if (body.contact_name !== undefined)
        orderData.contact_name = body.contact_name
    if (body.phone !== undefined)
        orderData.phone = body.phone
    if (body.email !== undefined)
        orderData.email = body.email || user.email
    if (body.shipping_address !== undefined)
        orderData.shipping_address = body.shipping_address
    if (body.gst_number !== undefined)
        orderData.gst_number = body.gst_number || null
    if (body.notes !== undefined)
        orderData.notes = body.notes || null
    if (body.payment_method !== undefined)
        orderData.payment_method = body.payment_method
    if (body.payment_status !== undefined)
        orderData.payment_status = body.payment_status

    const { data: order, error: orderError } =
        await supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single()

    if (orderError) {
        console.error('Order insert error:', orderError)
        return Response.json(
            { error: orderError.message },
            { status: 400 }
        )
    }

    // Insert order items
    if (body.items && body.items.length > 0) {
        const itemsData = body.items.map((item: any) => {
            const itemRow: Record<string, any> = {
                order_id: order.id,
                product_id: item.product_id,
                quantity: Number(item.quantity) || 1,
            }
            if (item.variant_id)
                itemRow.variant_id = item.variant_id
            if (item.product_name)
                itemRow.product_name = item.product_name
            if (item.size_label)
                itemRow.size_label = item.size_label
            if (item.unit_price !== undefined)
                itemRow.unit_price = Number(item.unit_price)
            if (item.total_price !== undefined)
                itemRow.total_price = Number(item.total_price)

            return itemRow
        })

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsData)

        if (itemsError) {
            console.error('Order items error:', itemsError)
            // Don't fail the whole order for items error
        }
    }

    return Response.json({
        data: order,
        message: 'Order placed successfully'
    })
}

export async function GET(request: Request) {
    const authSupabase = await createClient()
    const { data: { user } } = await
        authSupabase.auth.getUser()

    if (!user) {
        return Response.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      order_items (*)
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) return Response.json(
        { error: error.message }, { status: 400 })

    return Response.json({ data })
}
