import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/public/ProductCard";
import { ImageGallery } from "@/components/public/ImageGallery";
import { ProductInfo } from "@/components/public/ProductInfo";

export const dynamic = "force-dynamic";

export const revalidate = 3600; // 1 hour ISR

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    try {
        const res = await fetch(`${siteUrl}/api/products/${params.slug}`, { cache: "no-store" });
        if (res.ok) {
            const json = await res.json();
            const product = json.data;
            if (product) {
                const primaryImage = product.images?.[0]?.url || "";
                return {
                    title: `${product.name} | Little Mumbai Choice`,
                    description: product.short_description || `Buy ${product.name} wholesale at best prices.`,
                    openGraph: {
                        images: primaryImage ? [primaryImage] : []
                    }
                };
            }
        }
    } catch (e) {
        // Ignore error in metadata generation
    }
    return {
        title: "Product Detail | Little Mumbai Choice",
    };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    let product = null;
    let relatedProducts = [];

    try {
        const res = await fetch(`${siteUrl}/api/products/${params.slug}`, { cache: "no-store" });
        if (!res.ok) {
            if (res.status === 404) return notFound();
            throw new Error(`Failed to fetch product: ${res.statusText}`);
        }
        const json = await res.json();
        product = json.data;
        relatedProducts = product?.related_products || [];
    } catch (error) {
        console.error("Error fetching product page:", error);
        return notFound();
    }

    // Ensure active variants are sorted by created_at or size if needed
    // API already filters and sorts active variants

    return (
        <div className="bg-white min-h-screen pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <div className="text-sm text-slate-500 mb-8 font-medium">
                    <Link href="/" className="hover:text-brand-500 transition-colors">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/catalog" className="hover:text-brand-500 transition-colors">Catalog</Link>
                    <span className="mx-2">/</span>
                    {product.category && (
                        <>
                            <Link href={`/catalog?category=${product.category.slug}`} className="hover:text-brand-500 transition-colors">
                                {product.category.name}
                            </Link>
                            <span className="mx-2">/</span>
                        </>
                    )}
                    <span className="text-slate-900 truncate">{product.name}</span>
                </div>

                {/* Product Layout */}
                <div className="flex flex-col lg:flex-row gap-12 mb-24">
                    {/* Left Column - Image Gallery */}
                    <div className="w-full lg:w-1/2">
                        <ImageGallery images={product.images || []} />
                    </div>

                    {/* Right Column - Product Info */}
                    <div className="w-full lg:w-1/2">
                        <ProductInfo product={product} />
                    </div>
                </div>

                {/* You May Also Like Section */}
                {relatedProducts.length > 0 && (
                    <div className="border-t border-slate-100 pt-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">You May Also Like</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.slice(0, 4).map((rp: any) => (
                                <ProductCard key={rp.id} product={rp} />
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            <Link href={`/catalog?gender=${product.gender}`} className="inline-flex items-center justify-center h-12 px-8 rounded-full border-2 border-slate-200 text-slate-700 font-bold hover:border-slate-900 hover:text-slate-900 transition-all">
                                View More {product.gender}
                            </Link>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
