"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProductStatusToggle({ id, initialStatus }: { id: string; initialStatus: boolean }) {
    const [isActive, setIsActive] = useState(initialStatus);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const toggleStatus = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !isActive })
            });
            if (!res.ok) throw new Error("Failed to update status");

            setIsActive(!isActive);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Error updating status");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={toggleStatus}
            disabled={isLoading}
            className={`
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
        ${isActive ? "bg-green-500" : "bg-slate-200"}
        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
      `}
        >
            <span className="sr-only">Toggle active status</span>
            <span
                aria-hidden="true"
                className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
          transition duration-200 ease-in-out
          ${isActive ? "translate-x-5" : "translate-x-0"}
        `}
            />
        </button>
    );
}
