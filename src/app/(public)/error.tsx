"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function PublicError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Public Route Error:", error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 bg-slate-50">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Something went wrong!</h2>
                <p className="text-slate-500 mb-8">
                    We're sorry, but we encountered an unexpected error while loading this page.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition shadow-sm"
                    >
                        Try again
                    </button>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition shadow-xl"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
