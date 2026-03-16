"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, AlertCircle, ShoppingBag } from "lucide-react";

const registerSchema = z.object({
    full_name: z.string().min(2, "Full name is required"),
    business_name: z.string().min(2, "Business/Shop name is required"),
    phone: z.string().min(10, "Valid phone number is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectParams = searchParams.get("redirect") || "/account";

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema)
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        setError("");

        const supabase = createClient();
        const { error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    full_name: data.full_name,
                    phone: data.phone,
                    business_name: data.business_name,
                }
            }
        });

        setIsLoading(false);

        if (authError) {
            setError(authError.message);
            return;
        }

        router.push(redirectParams);
        router.refresh();
    };

    // Success state UI removed as standard pattern is to redirect immediately upon success
    return (
        <div className="bg-slate-50 min-h-screen py-24 px-4 flex justify-center items-center">
            <div className="bg-white max-w-xl w-full rounded-3xl shadow-xl p-8 sm:p-10 border border-slate-100">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-8 h-8 text-brand-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Wholesale Registration</h1>
                    <p className="text-slate-500">Create an account to view and manage B2B orders.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex gap-2 items-start">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
                            <input
                                {...register("full_name")}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none transition"
                            />
                            {errors.full_name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.full_name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number *</label>
                            <input
                                {...register("phone")}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none transition"
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Business/Shop Name *</label>
                        <input
                            {...register("business_name")}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none transition"
                            placeholder="e.g. Trendy Kids Collections"
                        />
                        {errors.business_name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.business_name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email Address *</label>
                        <input
                            {...register("email")}
                            type="email"
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none transition"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Password *</label>
                        <input
                            {...register("password")}
                            type="password"
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none transition"
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
                                Create Account <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center mt-10 text-slate-600 font-medium">
                    Already have an account?{" "}
                    <Link href={`/login?redirect=${encodeURIComponent(redirectParams)}`} className="text-brand-600 hover:text-brand-700 font-bold hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
