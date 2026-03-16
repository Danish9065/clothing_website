/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiSuccess, apiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const searchParams = request.nextUrl.searchParams;

        const page = parseInt(searchParams.get("page") || "1");
        const limit = Math.min(parseInt(searchParams.get("limit") || "24"), 48);
        const category = searchParams.get("category");
        const gender = searchParams.get("gender");
        const minPrice = searchParams.get("min_price");
        const maxPrice = searchParams.get("max_price");
        const sort = searchParams.get("sort") || "newest";
        const search = searchParams.get("search");
        const newArrival = searchParams.get("new_arrival");
        const size = searchParams.get("size"); // comma-separated

        let query = supabase
            .from("products")
            .select(`
        *,
        category:categories(name, slug),
        images:product_images(*),
        variants:product_variants(*)
      `, { count: "exact" })
            .eq("is_active", true);

        if (category) query = query.eq("categories.slug", category);
        if (gender) query = query.eq("gender", gender);
        if (minPrice) query = query.gte("price", parseFloat(minPrice));
        if (maxPrice) query = query.lte("price", parseFloat(maxPrice));
        if (search) query = query.ilike("name", `%${search}%`);
        if (newArrival === "true") query = query.eq("is_new_arrival", true);

        // Sorting
        switch (sort) {
            case "price_asc":
                query = query.order("price", { ascending: true });
                break;
            case "price_desc":
                query = query.order("price", { ascending: false });
                break;
            case "featured":
                query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
                break;
            case "newest":
            default:
                query = query.order("created_at", { ascending: false });
                break;
        }

        // Pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data: products, error, count } = await query;

        if (error) {
            console.error("Products GET Error:", error);
            return apiError("DB_ERROR", "Failed to fetch products", 500);
        }

        // Post-processing for size filter and primary image
        let filteredProducts = products || [];

        if (size) {
            const sizes = size.split(",").map((s) => s.trim().toUpperCase());
            filteredProducts = filteredProducts.filter((product) =>
                product.variants?.some(
                    (v: any) => sizes.includes(v.size_label.toUpperCase()) && v.stock_quantity > 0
                )
            );
        }

        const formattedProducts = filteredProducts.map((product) => {
            const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0];

            const availableSizes = product.variants?.map((v: any) => v.size_label) || [];
            const outOfStock = product.variants?.every((v: any) => v.stock_quantity <= 0) || false;

            return {
                ...product,
                primaryImage: primaryImage?.image_url || null,
                categoryLabel: product.category?.name,
                availableSizes,
                outOfStock,
                // remove raw relational arrays from list view
                images: undefined,
                variants: undefined,
            };
        });

        return apiSuccess(formattedProducts, {
            total: count || 0,
            page,
            limit,
        });
    } catch (err) {
        console.error(err);
        return apiError("SERVER_ERROR", "Internal Server Error", 500);
    }
}
