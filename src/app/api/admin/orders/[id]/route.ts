import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Verify user is logged in
        const authSupabase = await createClient()
        const { data: { user } } = await
            authSupabase.auth.getUser()

        if (!user) {
            return Response.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()

        // Build update object — only include 
        // fields that were sent
        const updateData: Record<string, any> = {
            updated_at: new Date().toISOString()
        }

        if (body.status !== undefined)
            updateData.status = body.status

        if (body.payment_status !== undefined)
            updateData.payment_status = body.payment_status

        if (body.admin_notes !== undefined)
            updateData.admin_notes = body.admin_notes

        // Use admin client (bypasses RLS)
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Order update error:', error)
            return Response.json(
                { error: error.message },
                { status: 400 }
            )
        }

        return Response.json({
            data,
            message: 'Order updated successfully'
        })
    } catch (err: any) {
        console.error('PUT /api/admin/orders error:', err)
        return Response.json(
            { error: err.message || 'Server error' },
            { status: 500 }
        )
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('orders')
            .select(`
        *,
        order_items (*)
      `)
            .eq('id', id)
            .single()

        if (error) return Response.json(
            { error: error.message }, { status: 400 })

        return Response.json({ data })
    } catch (err: any) {
        return Response.json(
            { error: err.message }, { status: 500 })
    }
}
