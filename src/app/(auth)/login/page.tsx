"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, AlertCircle } from "lucide-react";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectParams = searchParams.get("redirect") || "/account";

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (formData: LoginFormValues) => {
        setIsLoading(true);
        setError("");

        try {
            const supabase = createClient();

            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error || !data?.user) {
                setError(error?.message || 'Login failed');
                setIsLoading(false);
                return;
            }

            const userId = data.user.id;
            const jwtRole = data.user.app_metadata?.role;

            if (jwtRole === 'admin') {
                window.location.href = '/admin';
                return;
            }

            // Fallback: check profiles table
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .maybeSingle();

            if (profile?.role === 'admin') {
                window.location.href = '/admin';
            } else {
                window.location.href = '/account';
            }
        } catch (err) {
            setError('Something went wrong. Try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen py-24 px-4 flex justify-center items-center">
            <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-8 sm:p-10 border border-slate-100">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
                    <p className="text-slate-500">Sign in to manage your wholesale orders.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex gap-2 items-start">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                        <input
                            {...register("email")}
                            type="email"
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                            placeholder="you@company.com"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                        <input
                            {...register("password")}
                            type="password"
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-slate-900 text-white h-14 rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-lg disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                Sign In <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center mt-10 text-slate-600 font-medium">
                    New to Little Mumbai Choice?{" "}
                    <Link href={`/register?redirect=${encodeURIComponent(redirectParams)}`} className="text-brand-600 hover:text-brand-700 font-bold hover:underline">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
}
