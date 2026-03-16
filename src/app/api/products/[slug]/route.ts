/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiSuccess, apiError } from "@/lib/api-utils";

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const supabase = await createClient();
        const { slug } = params;

        const { data: product, error } = await supabase
            .from("products")
            .select(`
        *,
        category:categories(name, slug),
        images:product_images(*),
        variants:product_variants(*)
      `)
            .eq("slug", slug)
            .eq("is_active", true)
            .single();

        if (error || !product) {
            return apiError("NOT_FOUND", "Product not found", 404);
        }

        // Process images
        product.images = product.images?.sort((img1: any, img2: any) =>
            Number(img2.is_primary) - Number(img1.is_primary) ||
            new Date(img1.created_at).getTime() - new Date(img2.created_at).getTime()
        ) || [];

        // Filter active variants only
        product.variants = product.variants?.filter((v: any) => v.is_active) || [];

        // Fetch related products (same gender)
        const { data: relatedProducts } = await supabase
            .from("products")
            .select(`
        *,
        images:product_images(*)
      `)
            .eq("gender", product.gender)
            .eq("is_active", true)
            .neq("id", product.id)
            .limit(4);

        const formattedRelated = (relatedProducts || []).map((rp) => {
            const primaryImage = rp.images?.find((img: any) => img.is_primary) || rp.images?.[0];
            return {
                ...rp,
                primaryImage: primaryImage?.image_url || null,
                images: undefined,
            };
        });

        return apiSuccess({
            ...product,
            relatedProducts: formattedRelated,
        });
    } catch (err) {
        console.error(err);
        return apiError("SERVER_ERROR", "Internal server error", 500);
    }
}
