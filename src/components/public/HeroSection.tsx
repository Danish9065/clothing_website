import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection({ heroMediaUrl }: { heroMediaUrl?: string | null }) {

    return (
        <section className="relative overflow-hidden bg-white py-16 lg:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column */}
                    <div className="flex flex-col items-start gap-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-600 font-semibold text-sm">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                            </span>
                            New Collection 2026
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] text-slate-900">
                            Elevate Your{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
                                Kids Shop
                            </span>
                            {" "}Inventory
                        </h1>

                        <p className="text-lg text-slate-600 max-w-lg">
                            Wholesale premium quality kids wear designed for comfort and style. Minimum order quantities apply for B2B buyers.
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            <Link
                                href="/catalog"
                                className="inline-flex items-center gap-2 bg-slate-900 text-white rounded-2xl px-8 py-4 font-semibold hover:bg-slate-800 transition-colors"
                            >
                                Browse Catalog
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="#about"
                                className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-900 rounded-2xl px-8 py-4 font-semibold hover:bg-slate-50 transition-colors"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="relative w-full">
                        <div className="relative w-full aspect-[4/3] lg:aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">

                            {/* VIDEO support */}
                            {heroMediaUrl && (
                                heroMediaUrl.includes('.mp4') ||
                                heroMediaUrl.includes('.webm') ||
                                heroMediaUrl.includes('.mov')
                            ) ? (
                                <video
                                    src={heroMediaUrl}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : heroMediaUrl && heroMediaUrl.includes('.gif') ? (
                                /* GIF support */
                                <img
                                    src={heroMediaUrl}
                                    alt="Hero"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : heroMediaUrl ? (
                                /* Regular image — FULLY COVERS container */
                                <img
                                    src={heroMediaUrl}
                                    alt="Little Mumbai Choice Kids Wear"
                                    className="absolute inset-0 w-full h-full object-cover object-center"
                                />
                            ) : (
                                /* Placeholder when no media */
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-7xl mb-4">👗</div>
                                    <p className="text-slate-500 text-sm font-medium">
                                        Premium Kids Wear
                                    </p>
                                    <p className="text-slate-400 text-xs mt-1">
                                        Add hero image/video from Admin → Settings
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Wholesale Ready badge */}
                        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 text-sm font-bold">✓</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">
                                    Wholesale Ready
                                </p>
                                <p className="text-xs text-slate-400">
                                    In Stock Now
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
