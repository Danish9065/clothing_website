"use client";

import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";

export function ReorderButton({ orderItems }: { orderItems: any[] }) {
    const { addToCart } = useCart();

    const handleReorder = () => {
        orderItems.forEach((item: any) => {
            // Re-map order_items back to CartItem shape
            addToCart({
                variantId: item.variant_id,
                productId: item.product_id,
                productName: item.product?.name || "Product", // Requires join with products
                sizeLabel: item.variant?.size || "Size",      // Requires join with variants
                price: item.unit_price || item.price_at_time || 0,
                retailPrice: item.unit_price || item.price_at_time || 0,
                wholesalePrice: null,
                compareAtPrice: 0,
                imageUrl: "/placeholder.jpg", // Or actual image
                quantity: item.quantity,
                wholesaleMinQty: 0, // Will be overridden or clamped by cart validation later
                maxStock: 9999,      // Overridden during validation
                isWholesale: false,
            });
        });
        alert("Items added to cart! Please review quantities before checkout.");
    };

    return (
        <button
            onClick={handleReorder}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-sm"
        >
            <ShoppingBag className="w-4 h-4" />
            Reorder Items
        </button>
    );
}
