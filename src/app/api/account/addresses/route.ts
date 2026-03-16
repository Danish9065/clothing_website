import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiSuccess, apiError } from "@/lib/api-utils";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return apiError("UNAUTHORIZED", "You must be logged in", 401);
        }

        const { data: addresses, error } = await supabase
            .from("addresses")
            .select("*")
            .eq("profile_id", user.id)
            .order("is_default", { ascending: false })
            .order("created_at", { ascending: false });

        if (error) {
            return apiError("DB_ERROR", "Failed to fetch addresses", 500);
        }

        return apiSuccess(addresses);
    } catch (err) {
        console.error(err);
        return apiError("SERVER_ERROR", "Internal Server Error", 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return apiError("UNAUTHORIZED", "You must be logged in", 401);
        }

        const body = await request.json();

        const { data: address, error } = await supabase
            .from("addresses")
            .insert({
                ...body,
                profile_id: user.id
            })
            .select()
            .single();

        if (error) {
            return apiError("DB_ERROR", "Failed to create address", 500);
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
