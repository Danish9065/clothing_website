/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiSuccess, apiError } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const { items } = body;

        if (!items || !Array.isArray(items)) {
            return apiError("INVALID_PAYLOAD", "Items array is required");
        }

        const validatedItems = await Promise.all(
            items.map(async (item: any) => {
                const { variantId, quantity } = item;
                let is_available = true;
                let error_message = null;

                const { data: variant, error } = await supabase
                    .from("product_variants")
                    .select("*, product:products(*)")
                    .eq("id", variantId)
                    .single();

                if (error || !variant || !variant.product) {
                    is_available = false;
                    error_message = "Variant or product not found";
                    return { variantId, quantity, is_available, error_message };
                }

                const product = variant.product as any;

                if (!product.is_active || !variant.is_active) {
                    is_available = false;
                    error_message = "Product or variant is no longer active";
                } else if (quantity < product.min_order_quantity) {
                    is_available = false;
                    error_message = `Minimum order quantity is ${product.min_order_quantity}`;
                } else if (quantity > variant.stock_quantity) {
                    is_available = false;
                    error_message = `Only ${variant.stock_quantity} remaining in stock`;
                } else if (quantity % product.min_order_quantity !== 0) {
                    is_available = false;
                    error_message = `Quantity must be a multiple of ${product.min_order_quantity}`;
                }

                return {
                    variantId,
                    quantity,
                    is_available,
                    error_message,
                    price: product.price,
                    stock_quantity: variant.stock_quantity,
                    min_order_quantity: product.min_order_quantity,
                };
            })
        );

        return apiSuccess({ items: validatedItems });
    } catch (err: any) {
        console.error("Cart validate error:", err);
        return apiError("SERVER_ERROR", "Internal server error", 500);
    }
}
