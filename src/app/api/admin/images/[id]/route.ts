import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiSuccess, apiError, requireAdmin } from "@/lib/api-utils";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

        // If making primary, unset others for the same product
        if (body.is_primary) {
            // Need product_id first
            const { data: currentImage } = await supabase
                .from("product_images")
                .select("product_id")
                .eq("id", params.id)
                .single();

            if (currentImage) {
                await supabase
                    .from("product_images")
                    .update({ is_primary: false })
                    .eq("product_id", currentImage.product_id);
            }
        }

        const { data: image, error } = await supabase
            .from("product_images")
            .update(body)
            .eq("id", params.id)
            .select()
            .single();

        if (error) return apiError("DB_ERROR", error.message, 500);

        return apiSuccess(image);
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

        // Fetch image details first for Cloudinary cleanup
        const { data: image, error: fetchError } = await supabase
            .from("product_images")
            .select("*")
            .eq("id", params.id)
            .single();

        if (fetchError || !image) return apiError("NOT_FOUND", "Image not found", 404);

        if (image.cloudinary_public_id) {
            try {
                await cloudinary.uploader.destroy(image.cloudinary_public_id);
            } catch (cloudErr) {
                console.error("Cloudinary deletion failed:", cloudErr);
                // non-fatal, proceed to DB
            }
        }

        const { error: deleteError } = await supabase
            .from("product_images")
            .delete()
            .eq("id", params.id);

        if (deleteError) return apiError("DB_ERROR", deleteError.message, 500);

        return apiSuccess({ success: true, message: "Image deleted" });
    } catch (err) {
        console.error(err);
        return apiError("SERVER_ERROR", "Internal Server Error", 500);
    }
}
