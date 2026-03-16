export async function uploadToCloudinary(
    file: File,
    folder: string = 'products',
    resourceType: 'image' | 'video' | 'auto' = 'auto'
): Promise<{ secure_url: string; public_id: string }> {

    // Get signature from our API
    const signRes = await fetch('/api/cloudinary-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
    })

    if (!signRes.ok) {
        throw new Error('Failed to get upload signature')
    }

    const { signature, timestamp, api_key, cloud_name, folder: signedFolder } = await signRes.json()

    // Upload to Cloudinary — use video endpoint for videos, image for everything else
    const formData = new FormData()
    formData.append('file', file)
    formData.append('signature', signature)
    formData.append('timestamp', String(timestamp))
    formData.append('api_key', api_key)
    formData.append('folder', signedFolder)

    const endpoint = resourceType === 'video' ? 'video' : 'image'
    const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/${endpoint}/upload`,
        { method: 'POST', body: formData }
    )

    if (!uploadRes.ok) {
        const err = await uploadRes.json()
        throw new Error(err.error?.message || 'Cloudinary upload failed')
    }

    const data = await uploadRes.json()
    return {
        secure_url: data.secure_url,
        public_id: data.public_id,
    }
}
