import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiSuccess, apiError, requireAdmin } from "@/lib/api-utils";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authSupabase = await createClient();
        const { error: authError } = await requireAdmin(authSupabase);
        if (authError) return authError;

        const supabase = createAdminClient();

        const body = await request.json();
        const { image_url, cloudinary_public_id, alt_text, sort_order, is_primary } = body;

        // If making primary, unset others first
        if (is_primary) {
            await supabase
                .from("product_images")
                .update({ is_primary: false })
                .eq("product_id", params.id);
        }

        const { data: image, error } = await supabase
            .from("product_images")
            .insert({
                product_id: params.id,
                image_url,
                cloudinary_public_id,
                alt_text,
                sort_order: sort_order || 0,
                is_primary: is_primary || false
            })
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
        const { image_id } = await request.json();

        if (!image_id) {
            return apiError("MISSING_PARAMS", "image_id is required", 400);
        }

        // Get the image record first to retrieve cloudinary_public_id
        const { data: imageRecord } = await supabase
            .from("product_images")
            .select("cloudinary_public_id, image_url")
            .eq("id", image_id)
            .single();

        // Determine public_id for Cloudinary deletion
        let publicId: string | null = imageRecord?.cloudinary_public_id || null;

        if (!publicId && imageRecord?.image_url?.includes("cloudinary.com")) {
            // Fallback: extract public_id from URL
            const match = imageRecord.image_url.match(
                /\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/
            );
            if (match?.[1]) {
                publicId = match[1];
            }
        }

        // Delete from Cloudinary
        if (publicId) {
            const appUrl =
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            try {
                await fetch(`${appUrl}/api/admin/cloudinary-delete`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ public_id: publicId }),
                });
            } catch (e) {
                console.error("Cloudinary delete failed:", e);
            }
        }

        // Delete from Supabase
        const { error } = await supabase
            .from("product_images")
            .delete()
            .eq("id", image_id);

        if (error) return apiError("DB_ERROR", error.message, 400);

        return apiSuccess({ success: true });
    } catch (err) {
        console.error(err);
        return apiError("SERVER_ERROR", "Internal Server Error", 500);
    }
}
