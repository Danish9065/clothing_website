'use client'

import { useState, useMemo } from 'react'
import { ProductCard } from './ProductCard'
import type { Product } from '@/types'

interface CatalogSectionProps {
    products: Product[]
}

type FilterType = 'all' | 'boys' | 'girls' | 'child'

export function CatalogSection({
    products
}: CatalogSectionProps) {
    const [activeFilter, setActiveFilter] =
        useState<FilterType>('all')

    const filteredProducts = useMemo(() => {
        if (activeFilter === 'all') return products
        return products.filter(p =>
            p.gender === activeFilter
        )
    }, [products, activeFilter])

    const tabs: { label: string; value: FilterType }[] = [
        { label: 'All', value: 'all' },
        { label: 'Boys', value: 'boys' },
        { label: 'Girls', value: 'girls' },
        { label: 'Child', value: 'child' },
    ]

    return (
        <section className="py-20 bg-slate-50" id="catalog">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 
                      lg:px-8">

                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 
                         mb-4">
                        Our Collections
                    </h2>
                    <p className="text-slate-600">
                        Handpicked premium designs for every age group.
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex justify-center gap-4 mb-12">
                    {tabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveFilter(tab.value)}
                            className={`px-6 py-2 rounded-full text-sm 
                font-medium transition-all cursor-pointer
                ${activeFilter === tab.value
                                    ? 'bg-slate-900 text-white shadow-lg'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                        >
                            {tab.label}
                            {tab.value !== 'all' && (
                                <span className="ml-1 text-xs opacity-70">
                                    ({products.filter(p =>
                                        p.gender === tab.value
                                    ).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 
                          lg:grid-cols-4 gap-8">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-slate-500 text-lg">
                            No products in {activeFilter} category yet.
                        </p>
                        <button
                            onClick={() => setActiveFilter('all')}
                            className="mt-4 px-6 py-2 bg-slate-900 
                         text-white rounded-xl text-sm 
                         font-medium"
                        >
                            Show All Products
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}
