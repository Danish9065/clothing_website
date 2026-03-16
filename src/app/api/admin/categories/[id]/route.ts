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

        const { data: category, error } = await supabase
            .from("categories")
            .select("*")
            .eq("id", params.id)
            .single();

        if (error || !category) return apiError("NOT_FOUND", "Category not found", 404);

        return apiSuccess(category);
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

        const { data: category, error } = await supabase
            .from("categories")
            .update(body)
            .eq("id", params.id)
            .select()
            .single();

        if (error) return apiError("DB_ERROR", error.message, 500);

        return apiSuccess(category);
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

        // Reject if category has products
        const { count, error: countError } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("category_id", params.id);

        if (countError) return apiError("DB_ERROR", countError.message, 500);

        if (count && count > 0) {
            return apiError("CATEGORY_HAS_PRODUCTS", "Cannot delete category with associated products.", 400);
        }

        const { error } = await supabase
            .from("categories")
            .delete()
            .eq("id", params.id);

        if (error) return apiError("DB_ERROR", error.message, 500);

        return apiSuccess({ success: true, message: "Category deleted" });
    } catch (err) {
        console.error(err);
        return apiError("SERVER_ERROR", "Internal Server Error", 500);
    }
}
