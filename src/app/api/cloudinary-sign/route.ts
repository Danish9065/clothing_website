import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json(
            { error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
        .from('profiles').select('role')
        .eq('id', user.id).single()

    const jwtRole = user.app_metadata?.role
    if (profile?.role !== 'admin' &&
        jwtRole !== 'admin') {
        return NextResponse.json(
            { error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const folder = body.folder || 'products'

    const timestamp = Math.round(Date.now() / 1000)
    const apiSecret = process.env.CLOUDINARY_API_SECRET!
    const apiKey = process.env.CLOUDINARY_API_KEY!
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!

    // Generate signature
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`
    const signature = crypto
        .createHash('sha256')
        .update(paramsToSign + apiSecret)
        .digest('hex')

    return NextResponse.json({
        signature,
        timestamp,
        api_key: apiKey,
        cloud_name: cloudName,
        folder,
    })
}
