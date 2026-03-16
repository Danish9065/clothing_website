"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, X } from "lucide-react";

type Category = {
    id: string;
    name: string;
    slug: string;
    description: string;
    display_order: number;
    products: { count: number }[];
};

export function CategoryManager({ categories }: { categories: Category[] }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentId, setCurrentId] = useState("");

    // Form State
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [order, setOrder] = useState<number>(0);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setName(val);
        if (!isEditMode) {
            setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    };

    const openNew = () => {
        setIsEditMode(false);
        setCurrentId("");
        setName("");
        setSlug("");
        setDescription("");
        setOrder(0);
        setIsOpen(true);
    };

    const openEdit = (cat: Category) => {
        setIsEditMode(true);
        setCurrentId(cat.id);
        setName(cat.name);
        setSlug(cat.slug);
        setDescription(cat.description || "");
        setOrder(cat.display_order || 0);
        setIsOpen(true);
    };

    const close = () => setIsOpen(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = { name, slug, description, display_order: order };
            const url = isEditMode ? `/api/admin/categories/${currentId}` : `/api/admin/categories`;
            const method = isEditMode ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error?.message || "Failed to save category");
            }

            setIsOpen(false);
            router.refresh();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, count: number) => {
        if (count > 0) {
            return alert(`Cannot delete category because it contains ${count} products.`);
        }
        if (!confirm("Are you sure you want to delete this category?")) return;

        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            router.refresh();
        } catch (err) {
            alert("Error deleting category");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
                    <p className="text-slate-500 text-sm mt-1">Organize your product catalog into groups</p>
                </div>
                <button
                    onClick={openNew}
                    className="inline-flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-600 transition shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Add Category
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Slug</th>
                                <th className="px-6 py-4">Products</th>
                                <th className="px-6 py-4">Display Order</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {categories.map(cat => {
                                const count = cat.products?.[0]?.count || 0;
                                return (
                                    <tr key={cat.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-bold text-slate-900">{cat.name}</td>
                                        <td className="px-6 py-4 font-mono text-slate-500">{cat.slug}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-bold text-xs">
                                                {count} items
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-500">{cat.display_order}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(cat)}
                                                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id, count)}
                                                    className={`p-2 rounded-lg transition-colors ${count > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                                                    title={count > 0 ? "Cannot delete (has products)" : "Delete"}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No categories found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">{isEditMode ? "Edit Category" : "Add New Category"}</h2>
                            <button onClick={close} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={handleNameChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Slug *</label>
                                    <input
                                        type="text"
                                        required
                                        value={slug}
                                        onChange={e => setSlug(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Display Order</label>
                                    <input
                                        type="number"
                                        value={order}
                                        onChange={e => setOrder(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Lower numbers appear first.</p>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={close}
                                    className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !name || !slug}
                                    className="px-6 py-2.5 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition disabled:opacity-50"
                                >
                                    {isSubmitting ? "Saving..." : "Save Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
