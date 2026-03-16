import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiSuccess, apiError, requireAdmin } from "@/lib/api-utils";

export async function GET() {
    try {
        const authSupabase = await createClient();
        const { error: authError } = await requireAdmin(authSupabase);
        if (authError) return authError;

        const supabase = createAdminClient();

        const { data: categories, error } = await supabase
            .from("categories")
            .select("*")
            .order("display_order", { ascending: true })
            .order("name", { ascending: true });

        if (error) return apiError("DB_ERROR", "Failed to fetch categories", 500);

        return apiSuccess(categories);
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

        const { data: category, error } = await supabase
            .from("categories")
            .upsert(
                {
                    name: body.name,
                    slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    description: body.description || null,
                    display_order: Number(body.display_order) || 0,
                },
                {
                    onConflict: 'slug',
                    ignoreDuplicates: false
                }
            )
            .select()
            .single();

        if (error) return apiError("DB_ERROR", error.message, 500);

        return apiSuccess(category);
    } catch (err) {
        console.error(err);
        return apiError("SERVER_ERROR", "Internal Server Error", 500);
    }
}
