/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export function CatalogFilterSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) params.set(name, value);
            else params.delete(name);
            return params.toString();
        },
        [searchParams]
    );

    const toggleSize = (size: string) => {
        const currentSizes = searchParams.get("size")?.split(",") || [];
        const newSizes = currentSizes.includes(size)
            ? currentSizes.filter((s) => s !== size)
            : [...currentSizes, size];

        // reset page to 1
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", "1");
        if (newSizes.length > 0) params.set("size", newSizes.join(","));
        else params.delete("size");
        router.push(`/catalog?${params.toString()}`);
    };

    const handleClear = () => {
        router.push("/catalog");
    };

    return (
        <div className="space-y-8 pr-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Filters</h3>
                <button onClick={handleClear} className="text-sm text-brand-500 font-medium hover:text-brand-600">
                    Clear All
                </button>
            </div>

            {/* Gender */}
            <div className="space-y-4">
                <h4 className="font-semibold text-slate-900">Gender</h4>
                <div className="space-y-2">
                    {["boys", "girls", "child"].map((gender) => (
                        <label key={gender} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="gender"
                                checked={searchParams.get("gender") === gender}
                                onChange={() => router.push(`/catalog?${createQueryString("gender", gender)}&page=1`)}
                                className="text-brand-500 focus:ring-brand-500 cursor-pointer"
                            />
                            <span className="text-slate-700 capitalize">{gender}</span>
                        </label>
                    ))}
                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                        <input
                            type="radio"
                            name="gender"
                            checked={!searchParams.get("gender")}
                            onChange={() => router.push(`/catalog?${createQueryString("gender", "")}&page=1`)}
                            className="text-brand-500 focus:ring-brand-500 cursor-pointer"
                        />
                        <span className="text-slate-700">All</span>
                    </label>
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
                <h4 className="font-semibold text-slate-900">Price Range (₹)</h4>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        value={searchParams.get("min_price") || ""}
                        onChange={(e) => router.push(`/catalog?${createQueryString("min_price", e.target.value)}&page=1`)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-brand-500 focus:border-brand-500"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={searchParams.get("max_price") || ""}
                        onChange={(e) => router.push(`/catalog?${createQueryString("max_price", e.target.value)}&page=1`)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-brand-500 focus:border-brand-500"
                    />
                </div>
            </div>

            {/* Size */}
            <div className="space-y-4">
                <h4 className="font-semibold text-slate-900">Size</h4>
                <div className="grid grid-cols-2 gap-2">
                    {["0-3M", "3-6M", "6-12M", "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y", "S", "M", "L", "XL"].map((size) => {
                        const isSelected = searchParams.get("size")?.split(",").includes(size);
                        return (
                            <button
                                key={size}
                                onClick={() => toggleSize(size)}
                                className={`py-2 text-sm font-medium rounded-lg border transition-colors ${isSelected
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                                    }`}
                            >
                                {size}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export function CatalogFilterHeader({ totalProducts }: { totalProducts: number }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const activeFilters = [];
    if (searchParams.get("gender")) activeFilters.push({ key: "gender", label: `Gender: ${searchParams.get("gender")}` });
    if (searchParams.get("min_price")) activeFilters.push({ key: "min_price", label: `Min: ₹${searchParams.get("min_price")}` });
    if (searchParams.get("max_price")) activeFilters.push({ key: "max_price", label: `Max: ₹${searchParams.get("max_price")}` });

    const sizes = searchParams.get("size");
    if (sizes) {
        sizes.split(",").forEach(s => activeFilters.push({ key: "size", val: s, label: `Size: ${s}` }));
    }

    const removeFilter = (filter: any) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", "1");
        if (filter.key === "size") {
            const currentSizes = params.get("size")?.split(",") || [];
            const newSizes = currentSizes.filter(s => s !== filter.val);
            if (newSizes.length > 0) params.set("size", newSizes.join(","));
            else params.delete("size");
        } else {
            params.delete(filter.key);
        }
        router.push(`/catalog?${params.toString()}`);
    };

    const currentSort = searchParams.get("sort") || "newest";

    const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", e.target.value);
        params.set("page", "1");
        router.push(`/catalog?${params.toString()}`);
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Catalog</h1>
                    <p className="text-slate-500 mt-1">Showing {totalProducts} products</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                    </button>

                    <select
                        value={currentSort}
                        onChange={handleSort}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-brand-500 focus:border-brand-500 bg-white"
                    >
                        <option value="newest">Newest</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="featured">Featured</option>
                    </select>
                </div>
            </div>

            {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {activeFilters.map((f, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full font-medium">
                            {f.label}
                            <button onClick={() => removeFilter(f)} className="hover:text-slate-900 hover:bg-slate-200 rounded-full p-0.5">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Mobile Bottom Sheet */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/50">
                    <div className="bg-white w-full h-[85vh] rounded-t-3xl shadow-xl flex flex-col animate-in slide-in-from-bottom-full duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold">Filters</h3>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <CatalogFilterSidebar />
                        </div>
                        <div className="p-4 border-t border-slate-100 flex gap-4">
                            <button
                                onClick={() => {
                                    router.push("/catalog");
                                    setIsMobileMenuOpen(false);
                                }}
                                className="flex-1 py-3 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex-[2] py-3 text-sm font-semibold text-white bg-slate-900 rounded-xl"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
