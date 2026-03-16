'use client'

import { useState, useMemo } from 'react'
import { ProductCard } from '@/components/public/ProductCard'

type FilterType = 'all' | 'boys' | 'girls' | 'child'

interface CatalogClientProps {
    products: any[]
}

export default function CatalogClient({ products }: CatalogClientProps) {
    const [activeFilter, setActiveFilter] = useState<FilterType>('all')
    const [searchQuery, setSearchQuery] = useState('')

    const filteredProducts = useMemo(() => {
        let result = products

        if (activeFilter !== 'all') {
            result = result.filter(p => p.gender === activeFilter)
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            result = result.filter(
                p => p.name.toLowerCase().includes(q) ||
                    p.short_description?.toLowerCase().includes(q)
            )
        }

        return result
    }, [products, activeFilter, searchQuery])

    const tabs: { label: string; value: FilterType }[] = [
        { label: 'All', value: 'all' },
        { label: 'Boys', value: 'boys' },
        { label: 'Girls', value: 'girls' },
        { label: 'Child', value: 'child' },
    ]

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Our Catalog
                    </h1>
                    <p className="text-slate-500 mt-2">
                        {products.length} wholesale products available
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search + Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full sm:w-80 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                    />

                    {/* Filter tabs */}
                    <div className="flex gap-2 flex-wrap">
                        {tabs.map(tab => {
                            const count = tab.value === 'all'
                                ? products.length
                                : products.filter(p => p.gender === tab.value).length

                            return (
                                <button
                                    key={tab.value}
                                    onClick={() => setActiveFilter(tab.value)}
                                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === tab.value
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    {tab.label}
                                    <span className="ml-1 text-xs opacity-70">
                                        ({count})
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-400 text-lg">
                            No products found.
                        </p>
                        {activeFilter !== 'all' && (
                            <button
                                onClick={() => setActiveFilter('all')}
                                className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm"
                            >
                                Show All Products
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
