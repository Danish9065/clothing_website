import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiSuccess, apiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return apiError("UNAUTHORIZED", "You must be logged in", 401);
        }

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data: orders, error, count } = await supabase
            .from("orders")
            .select("*, items:order_items(*, product:products(name), variant:product_variants(*))", { count: "exact" })
            .eq("profile_id", user.id)
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) {
            return apiError("DB_ERROR", "Failed to fetch orders", 500);
        }

        return apiSuccess(orders, {
            total: count || 0,
            page,
            limit,
        });
    } catch (err) {
        console.error(err);
        return apiError("SERVER_ERROR", "Internal Server Error", 500);
    }
}
