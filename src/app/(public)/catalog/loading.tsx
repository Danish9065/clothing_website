export default function CatalogLoading() {
    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb Skeleton */}
                <div className="w-32 h-4 bg-slate-200 rounded animate-pulse mb-8"></div>

                {/* Header Skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="w-48 h-8 bg-slate-200 rounded animate-pulse"></div>
                    <div className="w-36 h-10 bg-slate-200 rounded-xl animate-pulse"></div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Sidebar Skeleton */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-8">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i}>
                                    <div className="w-24 h-5 bg-slate-200 rounded animate-pulse mb-4"></div>
                                    <div className="space-y-3">
                                        {Array.from({ length: 3 }).map((_, j) => (
                                            <div key={j} className="flex gap-3">
                                                <div className="w-5 h-5 bg-slate-200 rounded animate-pulse"></div>
                                                <div className="w-20 h-4 bg-slate-200 rounded animate-pulse"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Grid Skeleton */}
                    <div className="flex-1 w-full">
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="group bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col h-full">
                                    <div className="relative w-full overflow-hidden rounded-xl bg-slate-200 animate-pulse aspect-[4/5] mb-4">
                                    </div>
                                    <div className="mt-auto space-y-3">
                                        <div className="w-2/3 h-4 bg-slate-200 rounded animate-pulse"></div>
                                        <div className="w-1/2 h-5 bg-slate-200 rounded animate-pulse"></div>
                                        <div className="w-full h-10 bg-slate-200 rounded-xl animate-pulse mt-2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
