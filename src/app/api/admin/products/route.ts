import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiSuccess, apiError, requireAdmin } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
    try {
        const authSupabase = await createClient();
        const { error: authError } = await requireAdmin(authSupabase);
        if (authError) return authError;

        const supabase = createAdminClient();

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search");

        let query = supabase
            .from("products")
            .select("*, category:categories(name)", { count: "exact" })
            .order("created_at", { ascending: false });

        if (search) query = query.ilike("name", `%${search}%`);

        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data: products, error, count } = await query;

        if (error) return apiError("DB_ERROR", "Failed to fetch products", 500);

        return apiSuccess(products, { total: count || 0, page, limit });
    } catch (err) {
        console.error(err);
        return apiError("SERVER_ERROR", "Internal Server Error", 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const authSupabase = await createClient();
        const { error: authError } = await requireAdmin(authSupabase);
        if (authError) return authError;

        const supabase = createAdminClient();

        const body = await request.json();

        const insertData: any = {
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
            .insert(insertData)
            .select()
            .single();

        if (error) return apiError("DB_ERROR", error.message, 500);

        return apiSuccess(product);
    } catch (err) {
        console.error(err);
        return apiError("SERVER_ERROR", "Internal Server Error", 500);
    }
}
