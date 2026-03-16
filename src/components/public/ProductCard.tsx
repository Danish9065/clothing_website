import { Plus } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
    const { addToCart } = useCart();

    // Get primary image or first image
    const primaryImage = (product as any).product_images?.find(
        (img: any) => img.is_primary
    ) || (product as any).product_images?.[0];

    const imageUrl = primaryImage?.image_url || null;

    return (
        <article
            data-category={product.gender}
            className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
            <div className="relative w-full aspect-[3/4] overflow-hidden bg-slate-100 rounded-t-2xl">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
                        <span className="text-5xl">👗</span>
                        <span className="text-xs text-slate-400 mt-2">No image</span>
                    </div>
                )}

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        if (product.variants && product.variants.length > 0) {
                            const firstVariant = product.variants[0];
                            addToCart({
                                variantId: firstVariant.id,
                                productId: product.id,
                                productName: product.name,
                                sizeLabel: firstVariant.size_label,
                                price: product.price,
                                compareAtPrice: product.compare_at_price || undefined,
                                imageUrl: imageUrl || "",
                                quantity: product.wholesale_min_qty > 0 ? product.wholesale_min_qty : 1,
                                wholesaleMinQty: product.wholesale_min_qty,
                                retailPrice: product.price,
                                wholesalePrice: product.wholesale_price,
                                isWholesale: product.wholesale_min_qty > 0,
                                maxStock: firstVariant.stock_quantity
                            });
                        } else {
                            addToCart({
                                variantId: product.id, // Fallback for phase 1
                                productId: product.id,
                                productName: product.name,
                                sizeLabel: "Default", // Fallback
                                price: product.price,
                                compareAtPrice: product.compare_at_price || undefined,
                                imageUrl: imageUrl || "",
                                quantity: product.wholesale_min_qty > 0 ? product.wholesale_min_qty : 1,
                                wholesaleMinQty: product.wholesale_min_qty,
                                retailPrice: product.price,
                                wholesalePrice: product.wholesale_price,
                                isWholesale: product.wholesale_min_qty > 0,
                                maxStock: 999 // Fallback
                            });
                        }
                    }}
                    className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg hover:bg-brand-500 hover:text-white transition-colors z-10"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            <div className="p-5">
                <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                    {product.categoryLabel}
                </div>
                <h3 className="mt-1 font-bold text-slate-900 line-clamp-1">{product.name}</h3>

                <div className="flex flex-col mt-2">
                    {!product.wholesale_min_qty || product.wholesale_min_qty === 0 ? (
                        <>
                            <p className="text-lg font-bold text-slate-900">
                                ₹{product.price}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                                Retail Price
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-slate-500 line-through">
                                Retail ₹{product.price}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-lg font-bold text-slate-900">
                                    ₹{product.wholesale_price}
                                </p>
                                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-medium">
                                    Min. {product.wholesale_min_qty}pcs
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium mt-1">
                                Wholesale Pack
                            </p>
                        </>
                    )}
                </div>
            </div>
        </article>
    );
}
