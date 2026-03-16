'use client'

import { useState, useEffect, useRef } from 'react'

type MediaType = 'image' | 'gif' | 'video' | null

function getMediaType(url: string): MediaType {
  if (!url) return null
  const lower = url.toLowerCase()
  if (
    lower.includes('.mp4') ||
    lower.includes('.webm') ||
    lower.includes('.mov') ||
    lower.includes('video')
  ) return 'video'
  if (lower.includes('.gif')) return 'gif'
  return 'image'
}

function getCloudinaryPublicId(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

export default function AdminSettingsPage() {
  const [mediaUrl, setMediaUrl] = useState('')
  const [oldMediaUrl, setOldMediaUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const mediaType = getMediaType(mediaUrl)

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings')
        const json = await res.json()
        const url = json.data?.hero_media_url || json.data?.hero_image_url || ''
        setMediaUrl(url)
        setOldMediaUrl(url)
      } catch (e) {
        console.error('Failed to load settings:', e)
      }
      setLoading(false)
    }
    loadSettings()
  }, [])

  async function deleteOldCloudinaryAsset(url: string) {
    if (!url || !url.includes('cloudinary.com')) return
    const publicId = getCloudinaryPublicId(url)
    if (!publicId) return

    try {
      await fetch('/api/admin/cloudinary-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: publicId }),
      })
      console.log('Old asset deleted:', publicId)
    } catch (e) {
      console.error('Could not delete old asset:', e)
      // Don't throw — deletion failure is non-critical
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const isValid =
      file.type.startsWith('image/') ||
      file.type.startsWith('video/') ||
      file.type === 'image/gif'

    if (!isValid) {
      setError('Please upload an image, GIF, or video file')
      return
    }

    // Validate file size (max 50MB for video, 10MB for images)
    const maxSize = file.type.startsWith('video/')
      ? 50 * 1024 * 1024
      : 10 * 1024 * 1024

    if (file.size > maxSize) {
      setError(
        `File too large. Max size: ${file.type.startsWith('video/') ? '50MB' : '10MB'}`
      )
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')
    setUploadProgress(0)

    try {
      const { uploadToCloudinary } = await import('@/lib/cloudinary')

      // Determine resource type
      const resourceType = file.type.startsWith('video/') ? 'video' : 'image'

      // Compress images (not videos) before upload
      let fileToUpload = file
      if (file.type.startsWith('image/')) {
        setCompressing(true)
        const { compressImage } = await import('@/lib/compressImage')
        fileToUpload = await compressImage(file, 200)
        setCompressing(false)
      }

      // Upload new file
      const result = await uploadToCloudinary(fileToUpload, 'hero', resourceType)

      const newUrl = result.secure_url
      setMediaUrl(newUrl)
      setUploadProgress(100)

      // Delete old Cloudinary asset if exists
      if (oldMediaUrl && oldMediaUrl !== newUrl && oldMediaUrl.includes('cloudinary.com')) {
        await deleteOldCloudinaryAsset(oldMediaUrl)
      }

      // Auto-save to database
      await saveToDatabase(newUrl)
      setOldMediaUrl(newUrl)
      setSuccess('✅ Uploaded and saved successfully!')
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Upload failed')
    }

    setUploading(false)
    setUploadProgress(0)
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function saveToDatabase(url: string) {
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'hero_media_url', value: url }),
    })
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      // Delete old if URL manually changed
      if (
        oldMediaUrl &&
        oldMediaUrl !== mediaUrl &&
        oldMediaUrl.includes('cloudinary.com')
      ) {
        await deleteOldCloudinaryAsset(oldMediaUrl)
      }
      await saveToDatabase(mediaUrl)
      setOldMediaUrl(mediaUrl)
      setSuccess('✅ Settings saved!')
    } catch (e: any) {
      setError(e.message || 'Save failed')
    }
    setSaving(false)
  }

  async function handleRemove() {
    if (!confirm('Remove hero media? This will also delete it from Cloudinary.')) return

    if (mediaUrl.includes('cloudinary.com')) {
      await deleteOldCloudinaryAsset(mediaUrl)
    }
    setMediaUrl('')
    await saveToDatabase('')
    setOldMediaUrl('')
    setSuccess('✅ Media removed')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-400">Loading settings...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Site Settings</h1>
      <p className="text-slate-500 text-sm mb-8">Manage your homepage hero section</p>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 max-w-xl">
        <h2 className="font-bold text-slate-900 mb-1">Hero Section Media</h2>
        <p className="text-slate-400 text-xs mb-5">
          Supports: JPG, PNG, WebP images • GIF animations • MP4/WebM videos
        </p>

        {/* Current Media Preview */}
        {mediaUrl && (
          <div className="mb-5 rounded-xl overflow-hidden border border-slate-100 relative group">
            {mediaType === 'video' ? (
              <video
                src={mediaUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-48 object-cover"
              />
            ) : (
              <img src={mediaUrl} alt="Hero preview" className="w-full h-48 object-cover" />
            )}
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
                {mediaType === 'video' ? '🎬 Video' : mediaType === 'gif' ? '🎞️ GIF' : '🖼️ Image'}
              </span>
              <button
                onClick={handleRemove}
                className="bg-red-500/90 text-white text-xs px-2 py-1 rounded-lg hover:bg-red-600"
              >
                ✕ Remove
              </button>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <label className="block w-full border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50/30 transition-all mb-4 group">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,image/gif,video/mp4,video/webm,video/quicktime"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          {compressing ? (
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Optimizing image size...</p>
              </div>
            </div>
          ) : uploading ? (
            <div>
              <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                <div
                  className="bg-pink-500 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress || 30}%` }}
                />
              </div>
              <p className="text-sm text-slate-500">⏳ Uploading...</p>
            </div>
          ) : (
            <>
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📤</div>
              <p className="text-sm font-semibold text-slate-600">Click to upload</p>
              <p className="text-xs text-slate-400 mt-1">Image (JPG/PNG/WebP) • GIF • Video (MP4)</p>
              <p className="text-xs text-slate-300 mt-1">Max 10MB for images/GIFs • 50MB for videos</p>
            </>
          )}
        </label>

        {/* Manual URL Input */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Or paste URL directly
          </label>
          <input
            type="text"
            value={mediaUrl}
            onChange={(e) => {
              setMediaUrl(e.target.value)
              setSuccess('')
              setError('')
            }}
            placeholder="https://res.cloudinary.com/..."
            className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
            {success}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || uploading || !mediaUrl}
          className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
