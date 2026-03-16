/* eslint-disable @typescript-eslint/no-explicit-any */
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
        const status = searchParams.get("status");
        const dateFrom = searchParams.get("date_from");
        const dateTo = searchParams.get("date_to");
        const search = searchParams.get("search");

        let query = supabase
            .from("orders")
            .select(`
        *,
        profile:profiles(full_name, email, phone, business_name),
        items:order_items(count)
      `, { count: "exact" })
            .order("created_at", { ascending: false });

        if (status) query = query.eq("status", status);
        if (dateFrom) query = query.gte("created_at", dateFrom);
        if (dateTo) query = query.lte("created_at", dateTo);

        if (search) {
            // Supabase RPC or complex join needed for deep filtering; using ilike on relations works in some cases
            // For simplicity here, we filter on profiles if needed, or stick to native fields if not
            query = query.textSearch('profile.full_name', search, { type: 'websearch' }); // Approximation
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data: orders, error, count } = await query;

        if (error) return apiError("DB_ERROR", "Failed to fetch orders", 500);

        // Format items count properly as Supabase returns it as an array with count
        const formattedOrders = (orders || []).map((o: any) => ({
            ...o,
            items_count: o.items?.[0]?.count || 0,
            items: undefined
        }));

        return apiSuccess(formattedOrders, { total: count || 0, page, limit });
    } catch (err) {
        console.error(err);
        return apiError("SERVER_ERROR", "Internal Server Error", 500);
    }
}
