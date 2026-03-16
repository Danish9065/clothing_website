import { HeroSection } from "@/components/public/HeroSection";
import { CatalogSection } from "@/components/public/CatalogSection";
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  const supabase = createAdminClient()

  // Fetch hero media setting (new key first, fallback to old key)
  const { data: heroSetting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'hero_media_url')
    .single()

  // Fallback to old key for backward compatibility
  const { data: oldSetting } = !heroSetting?.value
    ? await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'hero_image_url')
        .single()
    : { data: null }

  const heroMediaUrl = heroSetting?.value || oldSetting?.value || null

  const { data: products } = await supabase
    .from('products')
    .select(`
      id, name, slug, price, wholesale_price,
      wholesale_min_qty, gender, is_active,
      short_description, compare_at_price,
      categories!category_id (id, name, slug),
      product_images (
        id, image_url, is_primary, sort_order
      ),
      product_variants (
        id, size_label, stock_quantity, is_active
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <>
      <HeroSection heroMediaUrl={heroMediaUrl} />
      <CatalogSection products={products as any || []} />
    </>
  );
}
