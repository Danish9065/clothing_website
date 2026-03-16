/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiSuccess, apiError } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return apiError("UNAUTHORIZED", "You must be logged in to checkout", 401);
        }

        const body = await request.json();
        const { cartItems, shippingAddress, email, businessName, notes } = body;

        if (!cartItems || cartItems.length === 0) {
            return apiError("EMPTY_CART", "Cart is empty");
        }

        let totalAmount = 0;
        const validatedItems = [];

        // 1. Validate all cart items (stock, active, min qty)
        for (const item of cartItems) {
            const { variantId, quantity, isWholesale } = item;

            const { data: variant, error: varError } = await supabase
                .from("product_variants")
                .select("*, product:products(*)")
                .eq("id", variantId)
                .single();

            if (varError || !variant || !variant.product) {
                return apiError("INVALID_ITEM", `Item ${variantId} is invalid`);
            }

            const product = variant.product as any;

            if (!product.is_active || !variant.is_active) {
                return apiError("ITEM_UNAVAILABLE", `${product.name} is no longer available`);
            }
            if (isWholesale) {
                if (!product.wholesale_price) {
                    return apiError("NO_WHOLESALE_PRICE", `Wholesale price not configured for ${product.name}`);
                }
                if (quantity < product.wholesale_min_qty) {
                    return apiError("BELOW_MIN_WHOLESALE_QTY", `${product.name} requires min wholesale order of ${product.wholesale_min_qty}`);
                }
                if (quantity % product.wholesale_min_qty !== 0) {
                    return apiError("INVALID_WHOLESALE_QTY_MULTIPLE", `${product.name} wholesale quantity must be in multiples of ${product.wholesale_min_qty}`);
                }
            } else {
                if (quantity < 1) {
                    return apiError("MIN_QTY", `${product.name} requires min order of 1`);
                }
            }
            if (quantity > variant.stock_quantity) {
                return apiError("OUT_OF_STOCK", `Only ${variant.stock_quantity} remaining for ${product.name}`);
            }

            // Calculate total from DB price (never trust client)
            const unitPrice = isWholesale ? product.wholesale_price : product.price;
            const itemTotal = unitPrice * quantity;
            totalAmount += itemTotal;

            validatedItems.push({
                variant_id: variant.id,
                product_id: product.id,
                quantity,
                unit_price: unitPrice,
                total_price: itemTotal,
                is_wholesale: isWholesale || false,
                wholesale_min_qty_snapshot: product.wholesale_min_qty || 0
            });
        }

        // 2. Insert Shipping Address if provided
        let addressId = shippingAddress?.id;
        if (!addressId && shippingAddress) {
            const { data: addr, error: addrError } = await supabase
                .from("addresses")
                .insert({
                    profile_id: user.id,
                    address_line1: shippingAddress.addressLine1,
                    address_line2: shippingAddress.addressLine2,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    postal_code: shippingAddress.postalCode,
                    country: shippingAddress.country || "India",
                    is_default: true,
                })
                .select()
                .single();

            if (!addrError && addr) {
                addressId = addr.id;
            }
        }

        // 3. Create Order
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                profile_id: user.id,
                total_amount: totalAmount,
                status: "pending",
                payment_status: "paid", // Simulated payment
                shipping_address_id: addressId,
                notes: notes || null,
                // email, businessName are implicitly linked via profile, but could be logged if needed
            })
            .select()
            .single();

        if (orderError || !order) {
            console.error(orderError);
            return apiError("ORDER_CREATE_FAILED", "Failed to create order", 500);
        }

        // 4. Create Order Items
        const orderItemsToInsert = validatedItems.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            is_wholesale: item.is_wholesale,
            wholesale_min_qty_snapshot: item.wholesale_min_qty_snapshot
        }));

        const { error: itemsError } = await supabase
            .from("order_items")
            .insert(orderItemsToInsert);

        if (itemsError) {
            console.error(itemsError);
            return apiError("ORDER_ITEMS_FAILED", "Failed to confirm order items", 500);
        }

        // 5. Decrement Stock via RPC
        for (const item of validatedItems) {
            const { error: rpcError } = await supabase.rpc("decrement_stock", {
                variant_id: item.variant_id,
                amount: item.quantity
            });
            if (rpcError) console.error("RPC Error decrementing stock:", rpcError);
        }

        // 6. TODO: WhatsApp Notification Integration

        return apiSuccess({
            orderId: order.id,
            totalAmount: order.total_amount,
            status: order.status
        });

    } catch (err: any) {
        console.error("Checkout route error:", err);
        return apiError("SERVER_ERROR", "Internal Server Error", 500);
    }
}
