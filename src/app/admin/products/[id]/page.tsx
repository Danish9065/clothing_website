import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import ProductEditForm from '@/components/admin/ProductEditForm'

interface Props {
    params: { id: string }
}

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: Props) {
    const supabase = createAdminClient()

    const { data: product, error } = await supabase
        .from('products')
        .select(`
      *,
      categories!category_id (id, name),
      product_images (
        id, image_url, alt_text, 
        is_primary, sort_order,
        cloudinary_public_id
      ),
      product_variants (
        id, size_label, sku, 
        stock_quantity, is_active
      )
    `)
        .eq('id', params.id)
        .single()

    if (error || !product) {
        notFound()
    }

    const { data: categories } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('display_order')

    return (
        <div>
            <div className="mb-6">
                <a
                    href="/admin/products"
                    className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                    ← Back to Products
                </a>
            </div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Edit Product
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {product.name}
                    </p>
                </div>
            </div>
            <ProductEditForm
                product={product}
                categories={categories || []}
            />
        </div>
    )
}
