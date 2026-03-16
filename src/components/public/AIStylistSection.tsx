export function AIStylistSection() {
    return (
        <section id="ai-stylist" className="bg-white py-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-50 text-brand-600 font-semibold text-xs mb-6">
                    Coming Soon
                </div>

                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    AI Fashion Stylist
                </h2>

                <p className="text-slate-600 mb-8 max-w-xl">
                    Get AI-powered outfit recommendations for your customers. Tell us age, occasion, and budget — we suggest the perfect combination.
                </p>

                <div className="flex w-full max-w-md items-center gap-2">
                    <input
                        type="text"
                        placeholder="e.g. 5yo boy party wear under ₹2000"
                        disabled
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:bg-slate-50"
                    />
                    <button
                        disabled
                        className="group relative bg-slate-900 text-white rounded-xl px-6 py-3 font-semibold disabled:opacity-50 transition-colors"
                    >
                        Get Suggestions
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-3 rounded whitespace-nowrap">
                            Coming Soon
                        </span>
                    </button>
                </div>
            </div>
        </section>
    );
}
