import { createAdminClient } from '@/lib/supabase/admin'
import CatalogClient from './CatalogClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CatalogPage() {
    try {
        const supabase = createAdminClient()

        const { data: products, error } = await supabase
            .from('products')
            .select(`
        id, name, slug, price, wholesale_price,
        wholesale_min_qty, gender, is_active,
        short_description, compare_at_price,
        categories!category_id (
          id, name, slug
        ),
        product_images (
          id, image_url, is_primary, sort_order
        ),
        product_variants (
          id, size_label, stock_quantity, is_active
        )
      `)
            .eq('is_active', true)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Catalog fetch error:', error)
        }

        return <CatalogClient products={products || []} />
    } catch (err) {
        console.error('Catalog page error:', err)
        return <CatalogClient products={[]} />
    }
}
