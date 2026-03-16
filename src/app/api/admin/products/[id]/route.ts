import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiSuccess, apiError, requireAdmin } from "@/lib/api-utils";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authSupabase = await createClient();
        const { error: authError } = await requireAdmin(authSupabase);
        if (authError) return authError;

        const supabase = createAdminClient();

        const { data: product, error } = await supabase
            .from("products")
            .select(`
        *,
        images:product_images(*),
        variants:product_variants(*)
      `)
            .eq("id", params.id)
            .single();

        if (error || !product) {
            return apiError("NOT_FOUND", "Product not found", 404);
        }

        return apiSuccess(product);
    } catch (err) {
        console.error(err);
        return apiError("SERVER_ERROR", "Internal Server Error", 500);
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authSupabase = await createClient();
        const { error: authError } = await requireAdmin(authSupabase);
        if (authError) return authError;

        const supabase = createAdminClient();

        const body = await request.json();
        const updateData: any = {
            name: body.name,
            slug: body.slug || body.name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, ''),
            short_description: body.short_description || null,
            description: body.description || null,
            category_id: body.category_id || null,
            gender: body.gender || 'unisex',
            age_min_months: body.age_min_months || null,
            age_max_months: body.age_max_months || null,
            price: Number(body.price),
            wholesale_price: body.wholesale_price
                ? Number(body.wholesale_price) : null,
            wholesale_min_qty: Number(body.wholesale_min_qty) || 0,
            compare_at_price: body.compare_at_price
                ? Number(body.compare_at_price) : null,
            is_active: body.is_active ?? true,
            is_featured: body.is_featured ?? false,
            is_new_arrival: body.is_new_arrival ?? false,
            tags: body.tags || [],
        };

        const { data: product, error } = await supabase
            .from("products")
            .update(updateData)
            .eq("id", params.id)
            .select()
            .single();

        if (error) return apiError("DB_ERROR", error.message, 500);
        return apiSuccess(product);
    } catch (err) {
        console.error(err);
        return apiError("SERVER_ERROR", "Internal Server Error", 500);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authSupabase = await createClient();
        const { error: authError } = await requireAdmin(authSupabase);
        if (authError) return authError;

        const supabase = createAdminClient();

        // Soft delete: set is_active = false
        const { error } = await supabase
            .from("products")
            .update({ is_active: false })
            .eq("id", params.id);

        if (error) return apiError("DB_ERROR", error.message, 500);
        return apiSuccess({ success: true, message: "Product soft deleted" });
    } catch (err) {
        console.error(err);
        return apiError("SERVER_ERROR", "Internal Server Error", 500);
    }
}
