import { createAdminClient } from '@/lib/supabase/admin'
import CategoriesClient from './CategoriesClient'

export default async function AdminCategoriesPage() {
    const supabase = createAdminClient()

    const { data: categories } = await supabase
        .from('categories')
        .select(`
      id, name, slug, description, display_order,
      products (id)
    `)
        .order('display_order', { ascending: true })

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Categories
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {categories?.length || 0} categories
                    </p>
                </div>
            </div>
            <CategoriesClient initialCategories={categories || []} />
        </div>
    )
}
