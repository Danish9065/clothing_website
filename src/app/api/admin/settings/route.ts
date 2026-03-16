import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')

    if (error) return Response.json(
        { error: error.message }, { status: 400 })

    // Convert array to object: [{key,value}] → {key: value}
    const settings: Record<string, string> = {}
    data?.forEach(row => {
        settings[row.key] = row.value || ''
    })
    return Response.json({ data: settings })
}

export async function POST(request: Request) {
    const authSupabase = await createClient()
    const { data: { user } } = await authSupabase.auth.getUser()
    if (!user) return Response.json(
        { error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('site_settings')
        .upsert(
            {
                key: body.key,
                value: body.value,
                updated_at: new Date().toISOString()
            },
            { onConflict: 'key' }
        )

    if (error) return Response.json(
        { error: error.message }, { status: 400 })
    return Response.json({ success: true })
}
