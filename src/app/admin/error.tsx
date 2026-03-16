"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Admin Route Error:", error);
    }, [error]);

    return (
        <div className="min-h-[50vh] flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Dashboard Error</h2>
                <p className="text-slate-500 text-sm mb-6">
                    The admin panel encountered an unexpected issue. Please try refreshing the data.
                </p>
                <button
                    onClick={() => reset()}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-sm"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Retry Request
                </button>
            </div>
        </div>
    );
}
