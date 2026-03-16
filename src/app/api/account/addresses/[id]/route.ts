import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiSuccess, apiError } from "@/lib/api-utils";

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return apiError("UNAUTHORIZED", "You must be logged in", 401);
        }

        const body = await request.json();

        const { data: address, error } = await supabase
            .from("addresses")
            .update(body)
            .eq("id", params.id)
            .eq("profile_id", user.id)
            .select()
            .single();

        if (error) {
            return apiError("DB_ERROR", "Failed to update address", 500);
        }

        // If marked as default, unset others
        if (address.is_default) {
            await supabase
                .from("addresses")
                .update({ is_default: false })
                .eq("profile_id", user.id)
                .neq("id", address.id);
        }

        return apiSuccess(address);
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
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return apiError("UNAUTHORIZED", "You must be logged in", 401);
        }

        const { error } = await supabase
            .from("addresses")
            .delete()
            .eq("id", params.id)
            .eq("profile_id", user.id);

        if (error) {
            return apiError("DB_ERROR", "Failed to delete address", 500);
        }

        return apiSuccess({ success: true });
    } catch (err) {
        console.error(err);
        return apiError("SERVER_ERROR", "Internal Server Error", 500);
    }
}
