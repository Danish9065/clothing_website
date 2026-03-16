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

        const { data: variants, error } = await supabase
            .from("product_variants")
            .select("*")
            .eq("product_id", params.id)
            .order("created_at", { ascending: true });

        if (error) return apiError("DB_ERROR", error.message, 500);

        return apiSuccess(variants);
    } catch (err) {
        console.error(err);
        return apiError("SERVER_ERROR", "Internal Server Error", 500);
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authSupabase = await createClient();
        const { error: authError } = await requireAdmin(authSupabase);
        if (authError) return authError;

        const supabase = createAdminClient();

        const body = await request.json();

        const { data: variant, error } = await supabase
            .from("product_variants")
            .insert({ ...body, product_id: params.id })
            .select()
            .single();

        if (error) return apiError("DB_ERROR", error.message, 500);

        return apiSuccess(variant);
    } catch (err) {
        console.error(err);
        return apiError("SERVER_ERROR", "Internal Server Error", 500);
    }
}
