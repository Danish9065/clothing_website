import { createAdminClient } from "@/lib/supabase/admin";
import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
    const adminSupabase = createAdminClient();
    const { data: categories } = await adminSupabase.from("categories").select("id, name, slug").order("display_order", { ascending: true });

    return (
        <div>
            <div className="mb-6">
                <Link href="/admin/products" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Products
                </Link>
            </div>
            <ProductForm categories={categories || []} />
        </div>
    );
}
