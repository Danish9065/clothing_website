'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
    product: any
    categories: any[]
}

export default function ProductEditForm({
    product,
    categories
}: Props) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('basic')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [form, setForm] = useState({
        name: product.name || '',
        slug: product.slug || '',
        short_description: product.short_description || '',
        description: product.description || '',
        category_id: product.category_id || '',
        gender: product.gender || 'unisex',
        age_min_months: product.age_min_months || '',
        age_max_months: product.age_max_months || '',
        price: product.price || '',
        wholesale_price: product.wholesale_price || '',
        wholesale_min_qty: product.wholesale_min_qty || 0,
        compare_at_price: product.compare_at_price || '',
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
        is_new_arrival: product.is_new_arrival ?? false,
    })

    // Variants state
    const [variants, setVariants] = useState(product.product_variants || [])
    const [newVariant, setNewVariant] = useState({ size_label: '', stock_quantity: 0 })
    const [addingVariant, setAddingVariant] = useState(false)

    // Images state
    const [images, setImages] = useState(product.product_images || [])
    const [uploading, setUploading] = useState(false)
    const [compressing, setCompressing] = useState(false)

    async function handleSave() {
        setSaving(true)
        setError('')
        setSuccess('')

        try {
            const res = await fetch(
                `/api/admin/products/${product.id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: form.name,
                        slug: form.slug,
                        short_description: form.short_description || null,
                        description: form.description || null,
                        category_id: form.category_id || null,
                        gender: form.gender,
                        age_min_months: form.age_min_months ? Number(form.age_min_months) : null,
                        age_max_months: form.age_max_months ? Number(form.age_max_months) : null,
                        price: Number(form.price),
                        wholesale_price: form.wholesale_price ? Number(form.wholesale_price) : null,
                        wholesale_min_qty: Number(form.wholesale_min_qty) || 0,
                        compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
                        is_active: form.is_active,
                        is_featured: form.is_featured,
                        is_new_arrival: form.is_new_arrival,
                    }),
                }
            )
            const json = await res.json()
            if (!res.ok) {
                setError(json.error?.message || json.error || 'Failed to save')
            } else {
                setSuccess('Product saved successfully! ✅')
                router.refresh()
            }
        } catch (e) {
            setError('Network error. Try again.')
        }
        setSaving(false)
    }

    async function handleAddVariant() {
        if (!newVariant.size_label) return
        setAddingVariant(true)
        try {
            const res = await fetch(
                `/api/admin/products/${product.id}/variants`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        size_label: newVariant.size_label,
                        stock_quantity: Number(newVariant.stock_quantity) || 0,
                    }),
                }
            )
            const json = await res.json()
            if (res.ok) {
                setVariants((prev: any[]) => [...prev, json.data])
                setNewVariant({ size_label: '', stock_quantity: 0 })
            }
        } catch { }
        setAddingVariant(false)
    }

    async function handleDeleteVariant(variantId: string) {
        if (!confirm('Delete this variant?')) return
        await fetch(`/api/admin/variants/${variantId}`, { method: 'DELETE' })
        setVariants((prev: any[]) => prev.filter((v: any) => v.id !== variantId))
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setError('')
        try {
            // Compress before upload (skip GIFs)
            setCompressing(true)
            const { compressImage } = await import('@/lib/compressImage')
            const compressed = await compressImage(file, 200)
            setCompressing(false)

            setUploading(true)
            const { uploadToCloudinary } = await import('@/lib/cloudinary')
            const { secure_url, public_id } = await uploadToCloudinary(compressed, 'products')

            const res = await fetch(
                `/api/admin/products/${product.id}/images`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        image_url: secure_url,
                        cloudinary_public_id: public_id,
                        is_primary: images.length === 0,
                        alt_text: form.name,
                    }),
                }
            )
            const json = await res.json()
            if (res.ok) {
                setImages((prev: any[]) => [...prev, json.data])
            } else {
                setError(json.error?.message || json.error || 'Upload failed')
            }
        } catch (err: any) {
            setError(err.message || 'Upload failed')
        }
        setCompressing(false)
        setUploading(false)
    }

    async function handleSetPrimary(imageId: string) {
        await fetch(`/api/admin/images/${imageId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_primary: true }),
        })
        setImages((prev: any[]) =>
            prev.map((img: any) => ({
                ...img,
                is_primary: img.id === imageId,
            }))
        )
    }

    async function handleDeleteImage(imageId: string) {
        if (!confirm('Delete this image?')) return
        await fetch(`/api/admin/products/${product.id}/images`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_id: imageId }),
        })
        setImages((prev: any[]) => prev.filter((img: any) => img.id !== imageId))
    }

    const tabs = [
        { id: 'basic', label: 'Basic Info' },
        { id: 'pricing', label: 'Pricing & MOQ' },
        { id: 'variants', label: 'Variants & Stock' },
        { id: 'images', label: 'Images' },
    ]

    return (
        <div>
            {/* Tab Navigation */}
            <div className="flex gap-1 mb-8 bg-slate-100 p-1 rounded-xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-sm font-medium">
                    {success}
                </div>
            )}

            {/* BASIC INFO TAB */}
            {activeTab === 'basic' && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Product Name *
                            </label>
                            <input
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                URL Slug *
                            </label>
                            <input
                                value={form.slug}
                                onChange={e => setForm({ ...form, slug: e.target.value })}
                                className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-mono"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Category *
                            </label>
                            <select
                                value={form.category_id}
                                onChange={e => setForm({ ...form, category_id: e.target.value })}
                                className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Gender
                            </label>
                            <select
                                value={form.gender}
                                onChange={e => setForm({ ...form, gender: e.target.value })}
                                className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                            >
                                <option value="boys">Boys</option>
                                <option value="girls">Girls</option>
                                <option value="child">Child</option>
                                <option value="unisex">Unisex</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Short Description
                        </label>
                        <input
                            value={form.short_description}
                            onChange={e => setForm({ ...form, short_description: e.target.value })}
                            className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            rows={4}
                            className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                    </div>
                    <div className="flex gap-6">
                        {[
                            { key: 'is_active', label: 'Active' },
                            { key: 'is_featured', label: 'Featured' },
                            { key: 'is_new_arrival', label: 'New Arrival' },
                        ].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={(form as any)[key]}
                                    onChange={e => setForm({ ...form, [key]: e.target.checked })}
                                    className="w-4 h-4 rounded accent-pink-500"
                                />
                                <span className="text-sm text-slate-700">
                                    {label}
                                </span>
                            </label>
                        ))}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            )}

            {/* PRICING TAB */}
            {activeTab === 'pricing' && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Retail Price (₹) *
                            </label>
                            <input
                                type="number"
                                value={form.price}
                                onChange={e => setForm({ ...form, price: e.target.value })}
                                className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Compare at Price (₹)
                            </label>
                            <input
                                type="number"
                                value={form.compare_at_price}
                                onChange={e => setForm({ ...form, compare_at_price: e.target.value })}
                                placeholder="Leave blank if no discount"
                                className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Wholesale Price (₹)
                            </label>
                            <input
                                type="number"
                                value={form.wholesale_price}
                                onChange={e => setForm({ ...form, wholesale_price: e.target.value })}
                                placeholder="Leave blank for retail only"
                                className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Min. Pieces for Wholesale
                            </label>
                            <input
                                type="number"
                                value={form.wholesale_min_qty}
                                onChange={e => setForm({ ...form, wholesale_min_qty: e.target.value })}
                                className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                            />
                            <p className="text-xs text-slate-400 mt-1">
                                Set 0 for retail-only product
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            )}

            {/* VARIANTS TAB */}
            {activeTab === 'variants' && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">
                        Size Variants & Stock
                    </h3>

                    {/* Existing variants */}
                    <div className="space-y-3 mb-6">
                        {variants.length === 0 ? (
                            <p className="text-slate-400 text-sm py-4">
                                No variants yet. Add sizes below.
                            </p>
                        ) : (
                            variants.map((v: any) => (
                                <div key={v.id}
                                    className="flex items-center gap-4 p-4 
                  bg-slate-50 rounded-xl">
                                    <span className="font-bold text-slate-900 w-20">
                                        {v.size_label}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-500">
                                            Stock:
                                        </span>
                                        <input
                                            type="number"
                                            defaultValue={v.stock_quantity}
                                            min="0"
                                            onBlur={async (e) => {
                                                const newQty = Number(e.target.value)
                                                if (newQty === v.stock_quantity) return
                                                await fetch(
                                                    `/api/admin/variants/${v.id}`,
                                                    {
                                                        method: 'PUT',
                                                        headers: {
                                                            'Content-Type': 'application/json'
                                                        },
                                                        body: JSON.stringify({
                                                            stock_quantity: newQty
                                                        }),
                                                    }
                                                )
                                                setVariants((prev: any[]) =>
                                                    prev.map((pv: any) =>
                                                        pv.id === v.id
                                                            ? { ...pv, stock_quantity: newQty }
                                                            : pv
                                                    )
                                                )
                                            }}
                                            className="w-20 px-3 py-1 border 
                   border-slate-200 rounded-lg 
                   text-sm text-center font-bold
                   focus:outline-none 
                   focus:ring-2 focus:ring-pink-400
                   focus:border-transparent"
                                        />
                                        <span className="text-xs text-slate-400">
                                            pcs
                                        </span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full
      font-medium ml-2
      ${v.stock_quantity === 0
                                            ? 'bg-red-50 text-red-600'
                                            : v.stock_quantity <= 5
                                                ? 'bg-amber-50 text-amber-600'
                                                : 'bg-green-50 text-green-600'
                                        }`}>
                                        {v.stock_quantity === 0
                                            ? 'Out of Stock'
                                            : v.stock_quantity <= 5
                                                ? 'Low Stock'
                                                : 'In Stock'}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteVariant(v.id)}
                                        className="ml-auto text-red-400 
                 hover:text-red-600 text-xs 
                 font-medium px-2 py-1 
                 hover:bg-red-50 rounded-lg 
                 transition-all"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add new variant */}
                    <div className="border-t border-slate-100 pt-6">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">
                            Add New Size
                        </h4>
                        <div className="flex gap-4 items-end">
                            <div>
                                <label className="text-xs text-slate-500">
                                    Size Label
                                </label>
                                <input
                                    value={newVariant.size_label}
                                    onChange={e => setNewVariant({ ...newVariant, size_label: e.target.value })}
                                    placeholder="e.g. S, M, L, XL, 2-3Y"
                                    className="mt-1 w-40 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">
                                    Stock Qty
                                </label>
                                <input
                                    type="number"
                                    value={newVariant.stock_quantity}
                                    onChange={e => setNewVariant({ ...newVariant, stock_quantity: Number(e.target.value) })}
                                    className="mt-1 w-28 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                                />
                            </div>
                            <button
                                onClick={handleAddVariant}
                                disabled={addingVariant || !newVariant.size_label}
                                className="px-6 py-2 bg-pink-500 text-white rounded-xl text-sm font-semibold hover:bg-pink-600 disabled:opacity-50 transition-all"
                            >
                                {addingVariant ? 'Adding...' : '+ Add'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* IMAGES TAB */}
            {activeTab === 'images' && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">
                        Product Images
                    </h3>

                    {/* Upload */}
                    <label className="block w-full border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer hover:border-pink-400 transition-colors mb-6">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        {compressing ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                                <p className="text-slate-500 text-sm">Optimizing image size...</p>
                            </div>
                        ) : uploading ? (
                            <p className="text-slate-500 text-sm">Uploading...</p>
                        ) : (
                            <div>
                                <p className="text-slate-500 text-sm font-medium">
                                    Click to upload image
                                </p>
                                <p className="text-slate-400 text-xs mt-1">
                                    JPG, PNG, WebP — max 10MB
                                </p>
                            </div>
                        )}
                    </label>

                    {/* Image grid */}
                    <div className="grid grid-cols-4 gap-4">
                        {images.length === 0 ? (
                            <p className="col-span-4 text-center text-slate-400 text-sm py-4">
                                No images yet. Upload above.
                            </p>
                        ) : (
                            images.map((img: any) => (
                                <div key={img.id} className="relative group rounded-xl overflow-hidden bg-slate-100 aspect-[3/4] max-w-[200px]">
                                    <img
                                        src={img.image_url}
                                        alt={img.alt_text || ''}
                                        className="absolute inset-0 w-full h-full object-cover object-top"
                                    />
                                    {img.is_primary && (
                                        <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                            Primary
                                        </span>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        {!img.is_primary && (
                                            <button
                                                onClick={() => handleSetPrimary(img.id)}
                                                className="px-3 py-1 bg-white text-slate-900 rounded-lg text-xs font-medium"
                                            >
                                                Set Primary
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteImage(img.id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
