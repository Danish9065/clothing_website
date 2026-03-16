'use client'

import { useState } from 'react'

interface Category {
    id: string
    name: string
    slug: string
    description: string | null
    display_order: number
    products?: { id: string }[]
}

export default function CategoriesClient({
    initialCategories
}: { initialCategories: Category[] }) {
    const [categories, setCategories] = useState(initialCategories)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({
        name: '', slug: '', description: '', display_order: '1'
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    function autoSlug(name: string) {
        return name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
    }

    async function handleSave() {
        setSaving(true)
        setError('')
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    slug: form.slug || autoSlug(form.name),
                    description: form.description,
                    display_order: Number(form.display_order),
                }),
            })
            const json = await res.json()
            if (!res.ok) {
                setError(json.error?.message || json.error || 'Failed to save')
                setSaving(false)
                return
            }
            setCategories(prev => [...prev, json.data])
            setShowForm(false)
            setForm({ name: '', slug: '', description: '', display_order: '1' })
        } catch (e) {
            setError('Network error')
        }
        setSaving(false)
    }

    async function handleDelete(id: string, productCount: number) {
        if (productCount > 0) {
            alert(`Cannot delete — ${productCount} products use this category. Reassign them first.`)
            return
        }
        if (!confirm('Delete this category?')) return
        await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
        setCategories(prev => prev.filter(c => c.id !== id))
    }

    return (
        <div>
            <button
                onClick={() => setShowForm(true)}
                className="mb-6 px-6 py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 transition-all"
            >
                + Add Category
            </button>

            {/* Existing Categories Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-6">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Name</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Slug</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Products</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Order</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                    No categories yet
                                </td>
                            </tr>
                        ) : categories.map(cat => (
                            <tr key={cat.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-semibold text-slate-900">
                                    {cat.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                                    {cat.slug}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {cat.products?.length || 0} products
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {cat.display_order}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleDelete(cat.id, cat.products?.length || 0)}
                                        className="text-red-400 hover:text-red-600 text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Category Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">
                            Add New Category
                        </h2>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">
                                {error}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Name *
                                </label>
                                <input
                                    value={form.name}
                                    onChange={e => setForm({
                                        ...form,
                                        name: e.target.value,
                                        slug: autoSlug(e.target.value)
                                    })}
                                    className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="e.g. Boys"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Slug *
                                </label>
                                <input
                                    value={form.slug}
                                    onChange={e => setForm({ ...form, slug: e.target.value })}
                                    className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Description
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    value={form.display_order}
                                    onChange={e => setForm({ ...form, display_order: e.target.value })}
                                    className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                                <p className="text-xs text-slate-400 mt-1">
                                    Lower numbers appear first.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowForm(false)
                                    setError('')
                                }}
                                className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !form.name}
                                className="flex-1 py-3 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
