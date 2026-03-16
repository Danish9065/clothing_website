import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiSuccess, apiError } from "@/lib/api-utils";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return apiError("UNAUTHORIZED", "You must be logged in", 401);
        }

        const { data: order, error } = await supabase
            .from("orders")
            .select(`
        *,
        shipping_address:addresses(*),
        items:order_items(
          *,
          product:products(*),
          variant:product_variants(*)
        )
      `)
            .eq("id", params.id)
            .eq("profile_id", user.id)
            .single();

        if (error || !order) {
            return apiError("NOT_FOUND", "Order not found", 404);
        }

        return apiSuccess(order);
    } catch (err) {
        console.error(err);
        return apiError("SERVER_ERROR", "Internal Server Error", 500);
    }
}
