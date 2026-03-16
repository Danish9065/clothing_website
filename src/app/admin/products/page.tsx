import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminProductsPage() {
    const supabase = createAdminClient()

    const { data: products, error } = await supabase
        .from('products')
        .select(`
      id,
      name,
      slug,
      price,
      wholesale_price,
      wholesale_min_qty,
      is_active,
      is_featured,
      gender,
      created_at,
      category_id,
      categories!category_id (
        id,
        name
      ),
      product_images (
        image_url,
        is_primary
      ),
      product_variants (
        id,
        stock_quantity,
        is_active
      )
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Products fetch error:', error)
    }

    const totalStock = (variants: any[]) =>
        (variants || [])
            .filter((v: any) => v.is_active !== false)
            .reduce((sum: number, v: any) =>
                sum + (Number(v.stock_quantity) || 0), 0)

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Products
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {products?.length || 0} total products
                    </p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="px-6 py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 transition-all"
                >
                    + Add New Product
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
                    Database error: {error.message}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                {['Product', 'Category', 'Retail Price',
                                    'Wholesale', 'Stock', 'Status',
                                    'Actions'].map(h => (
                                        <th key={h}
                                            className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {!products || products.length === 0 ? (
                                <tr>
                                    <td colSpan={7}
                                        className="px-6 py-16 text-center">
                                        <p className="text-slate-400 mb-2">
                                            No products found in database.
                                        </p>
                                        <Link
                                            href="/admin/products/new"
                                            className="text-pink-500 font-medium text-sm"
                                        >
                                            + Add your first product →
                                        </Link>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product: any) => {
                                    const imgs = product.product_images || []
                                    const primaryImg = imgs.find(
                                        (i: any) => i.is_primary
                                    ) || imgs[0]
                                    const stock = totalStock(
                                        product.product_variants || [])
                                    const category =
                                        product.categories as any

                                    return (
                                        <tr
                                            key={product.id}
                                            className="hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                                                        {primaryImg?.image_url ? (
                                                            <img
                                                                src={primaryImg.image_url}
                                                                alt={product.name}
                                                                className="absolute inset-0 w-full h-full object-cover object-top"
                                                            />
                                                        ) : (
                                                            <span className="absolute inset-0 flex items-center justify-center text-slate-300 text-xs">
                                                                No img
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 text-sm max-w-[160px] truncate">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs text-slate-400 font-mono">
                                                            /{product.slug}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 capitalize">
                                                {category?.name || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                                ₹{product.price}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {product.wholesale_min_qty > 0 ? (
                                                    <span className="text-amber-700">
                                                        ₹{product.wholesale_price}
                                                        <span className="text-xs text-slate-400 ml-1">
                                                            /{product.wholesale_min_qty}
                                                            pcs min
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">
                                                        Retail only
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`font-semibold ${stock === 0
                                                    ? 'text-red-500'
                                                    : stock < 10
                                                        ? 'text-amber-500'
                                                        : 'text-green-600'
                                                    }`}>
                                                    {stock} pcs
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.is_active
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {product.is_active
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/admin/products/${product.id}`}
                                                    className="text-pink-500 hover:text-pink-700 text-sm font-medium"
                                                >
                                                    Edit →
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
