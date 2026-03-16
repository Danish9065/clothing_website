/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
export function apiSuccess(data: any, meta?: { total?: number, page?: number, limit?: number }) {
    return Response.json({ data, ...(meta && Object.keys(meta).length > 0 ? { meta } : {}) });
}

export function apiError(code: string, message: string, status: number = 400) {
    return Response.json({ error: { code, message } }, { status });
}

export async function requireAdmin(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: apiError("UNAUTHORIZED", "Unauthorized", 401), user: null };

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const jwtRole = user.app_metadata?.role;

    if (profile?.role !== "admin" && jwtRole !== "admin") return { error: apiError("FORBIDDEN", "Forbidden", 403), user: null };

    return { error: null, user };
}
