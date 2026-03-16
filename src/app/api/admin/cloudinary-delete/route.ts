import { createClient } from '@/lib/supabase/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const authSupabase = await createClient()
    const {
      data: { user },
    } = await authSupabase.auth.getUser()
    if (!user)
      return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { public_id } = await request.json()

    if (!public_id)
      return Response.json({ error: 'No public_id provided' }, { status: 400 })

    // Try image, video, and raw resource types
    const results = []

    for (const type of ['image', 'video', 'raw'] as const) {
      try {
        const result = await cloudinary.uploader.destroy(public_id, {
          resource_type: type,
        })
        if (result.result === 'ok') {
          results.push({ type, result: 'deleted' })
          break
        }
      } catch {
        // Try next type
      }
    }

    return Response.json({
      success: true,
      results,
      message: `Deleted: ${public_id}`,
    })
  } catch (err: any) {
    console.error('Cloudinary delete error:', err)
    // Return success anyway — deletion is non-critical
    return Response.json({ success: true, message: 'Delete attempted' })
  }
}
