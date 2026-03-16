import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <SearchX className="w-10 h-10" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-2">404</h2>
                <h3 className="text-xl font-bold text-slate-700 mb-4">Page not found</h3>
                <p className="text-slate-500 mb-8">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <Link
                    href="/catalog"
                    className="inline-flex px-8 py-4 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 transition shadow-xl"
                >
                    Back to Catalog
                </Link>
            </div>
        </div>
    );
}
