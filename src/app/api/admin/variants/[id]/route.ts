import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const authSupabase = await createClient()
    const { data: { user } } = await
        authSupabase.auth.getUser()
    if (!user) return Response.json(
        { error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const adminSupabase = createAdminClient()

    const { data, error } = await adminSupabase
        .from('product_variants')
        .update({
            stock_quantity: body.stock_quantity,
            size_label: body.size_label,
            is_active: body.is_active,
        })
        .eq('id', params.id)
        .select()
        .single()

    if (error) return Response.json(
        { error: error.message }, { status: 400 })
    return Response.json({ data })
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const authSupabase = await createClient()
    const { data: { user } } = await
        authSupabase.auth.getUser()
    if (!user) return Response.json(
        { error: 'Unauthorized' }, { status: 401 })

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
        .from('product_variants')
        .delete()
        .eq('id', params.id)

    if (error) return Response.json(
        { error: error.message }, { status: 400 })
    return Response.json({ success: true })
}
