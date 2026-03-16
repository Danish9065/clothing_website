"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useTransition } from "react";

export function OrderListFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const search = formData.get("search") as string;

        const params = new URLSearchParams(searchParams.toString());
        if (search) params.set("search", search);
        else params.delete("search");

        params.set("page", "1");
        startTransition(() => {
            router.push(`?${params.toString()}`);
        });
    };

    const handleFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") params.set(key, value);
        else params.delete(key);

        params.set("page", "1");
        startTransition(() => {
            router.push(`?${params.toString()}`);
        });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    name="search"
                    defaultValue={searchParams.get("search") || ""}
                    placeholder="Search by Order ID or Business Name..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                />
            </form>

            <div className="flex gap-4">
                <select
                    onChange={(e) => handleFilter("status", e.target.value)}
                    defaultValue={searchParams.get("status") || "all"}
                    className="bg-white px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-slate-700"
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                <input
                    type="date"
                    onChange={(e) => handleFilter("date", e.target.value)}
                    defaultValue={searchParams.get("date") || ""}
                    className="bg-white px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-slate-700"
                />
            </div>
        </div>
    );
}
