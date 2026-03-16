"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, ShoppingBag, MessageCircle } from "lucide-react";

export function ProductInfo({ product }: { product: any }) {
    const { addToCart } = useCart();

    // Find first active variant with stock, or default to first
    const activeVariants = product.variants?.filter((v: any) => v.is_active) || [];
    const initialVariant = activeVariants.find((v: any) => v.stock_quantity > 0) || activeVariants[0];

    const [selectedVariant, setSelectedVariant] = useState(initialVariant);
    const [isWholesale, setIsWholesale] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const increment = () => {
        if (!selectedVariant) return;
        const step = isWholesale ? product.wholesale_min_qty : 1;
        if (quantity + step <= selectedVariant.stock_quantity) {
            setQuantity((q: number) => q + step);
        }
    };

    const decrement = () => {
        const step = isWholesale ? product.wholesale_min_qty : 1;
        if (quantity - step >= step) {
            setQuantity((q: number) => q - step);
        }
    };

    const handleAddToCart = () => {
        if (!selectedVariant || selectedVariant.stock_quantity === 0) return;

        addToCart({
            variantId: selectedVariant.id,
            productId: product.id,
            productName: product.name,
            sizeLabel: selectedVariant.size,
            price: product.price,
            compareAtPrice: product.compare_at_price,
            imageUrl: product.images?.[0]?.image_url || "/placeholder.jpg",
            quantity,
            wholesaleMinQty: product.wholesale_min_qty,
            retailPrice: product.price,
            wholesalePrice: product.wholesale_price,
            isWholesale,
            maxStock: selectedVariant.stock_quantity,
        });
        alert("Added to cart!");
    };

    const handleWhatsApp = () => {
        const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919310708172";
        const text = `Hi, I want to order ${product.name} (Size: ${selectedVariant?.size || 'N/A'}, Qty: ${quantity})`;
        window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, "_blank");
    };

    const [activeTab, setActiveTab] = useState<"description" | "size" | "shipping">("description");

    return (
        <div className="flex flex-col h-full">
            {/* Category Badge */}
            {product.category && (
                <span className="inline-block px-3 py-1 bg-brand-50 text-brand-700 text-sm font-medium rounded-full w-fit mb-4">
                    {product.category.name}
                </span>
            )}

            {/* Product Title & Price */}
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">{product.name}</h1>

            <div className="flex items-center gap-3 mb-6">
                <p className="text-2xl font-bold text-slate-900">
                    ₹{product.price}
                    <span className="text-base text-slate-500 font-medium ml-2">Retail</span>
                </p>
                {product.compare_at_price && product.compare_at_price > product.price && (
                    <>
                        <span className="text-lg text-slate-400 line-through">₹{product.compare_at_price}</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-sm font-bold rounded">
                            {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                        </span>
                    </>
                )}
            </div>

            {/* Wholesale Info/Toggle */}
            {product.wholesale_min_qty > 0 && (
                <div className="mb-8 border border-amber-200 bg-amber-50 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-amber-800">
                        <ShoppingBag className="w-5 h-5 text-amber-600" />
                        <span className="font-medium">
                            Wholesale available: Min. {product.wholesale_min_qty} pcs
                        </span>
                    </div>

                    <button
                        onClick={() => {
                            const nextIsWholesale = !isWholesale;
                            setIsWholesale(nextIsWholesale);
                            setQuantity(nextIsWholesale ? product.wholesale_min_qty : 1);
                        }}
                        className={`w-full h-12 rounded-lg font-bold flex items-center justify-center transition-colors ${isWholesale
                            ? "bg-brand-500 text-white shadow"
                            : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        {isWholesale ? "Wholesale Pricing Active" : "Enable Wholesale Pricing"} (₹{product.wholesale_price}/pc)
                    </button>
                </div>
            )}

            {/* Size Selector */}
            <div className="mb-8">
                <div className="flex justify-between items-end mb-3">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Select Size</h3>
                    {selectedVariant && (
                        <span className={`text-sm font-medium ${selectedVariant.stock_quantity > 0 ? "text-green-600" : "text-red-500"}`}>
                            {selectedVariant.stock_quantity > 0 ? `${selectedVariant.stock_quantity} in stock` : "Out of stock"}
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap gap-3">
                    {activeVariants.map((variant: any) => {
                        const isOutOfStock = variant.stock_quantity === 0;
                        const isSelected = selectedVariant?.id === variant.id;

                        return (
                            <button
                                key={variant.id}
                                onClick={() => {
                                    setSelectedVariant(variant);
                                    setQuantity(isWholesale ? product.wholesale_min_qty : 1); // reset qty on size change
                                }}
                                disabled={isOutOfStock}
                                className={`
                  h-12 px-6 rounded-xl font-medium border-2 transition-all
                  ${isSelected ? "border-slate-900 bg-slate-900 text-white shadow-md" : "border-slate-200 text-slate-700 hover:border-slate-400"}
                  ${isOutOfStock ? "opacity-50 line-through cursor-not-allowed bg-slate-50" : ""}
                `}
                            >
                                {variant.size}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center border-2 border-slate-200 rounded-xl bg-white overflow-hidden h-14">
                        <button
                            onClick={decrement}
                            disabled={quantity <= (isWholesale ? product.wholesale_min_qty : 1) || !selectedVariant || selectedVariant.stock_quantity === 0}
                            className="w-14 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-50 disabled:bg-slate-50 transition-colors"
                        >
                            <Minus className="w-5 h-5" />
                        </button>
                        <div className="w-16 h-full flex items-center justify-center font-bold text-slate-900 border-x-2 border-slate-200">
                            {quantity}
                        </div>
                        <button
                            onClick={increment}
                            disabled={!selectedVariant || quantity + (isWholesale ? product.wholesale_min_qty : 1) > selectedVariant.stock_quantity}
                            className="w-14 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-50 disabled:bg-slate-50 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    {isWholesale ? (
                        <p className="text-sm text-slate-500 flex-1">
                            Must be ordered in multiples of {product.wholesale_min_qty}
                        </p>
                    ) : (
                        <p className="text-sm text-slate-500 flex-1">
                            Single piece retail pricing
                        </p>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
                    className="flex-1 flex items-center justify-center gap-2 h-14 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ShoppingBag className="w-5 h-5" />
                    Add to Cart
                </button>
                <button
                    onClick={handleWhatsApp}
                    className="flex-1 flex items-center justify-center gap-2 h-14 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#1ebe5d] transition-colors shadow-lg"
                >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    Order via WhatsApp
                </button>
            </div>

            {/* Tabs */}
            <div className="border-t border-slate-200 pt-8 mt-auto">
                <div className="flex gap-8 mb-6 border-b border-slate-100">
                    {(["description", "size", "shipping"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === tab ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            {tab === "description" ? "Description" : tab === "size" ? "Size Guide" : "Shipping Info"}
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 rounded-t-full"></span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="text-slate-600 leading-relaxed text-sm">
                    {activeTab === "description" && (
                        <div className="prose prose-sm prose-slate max-w-none">
                            <p>{product.description || "No description available."}</p>
                        </div>
                    )}
                    {activeTab === "size" && (
                        <div>
                            <p className="mb-2">Our garments are true to size. Please refer to standard Indian sizing for kids.</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>0-12 Months: Infant</li>
                                <li>1-5 Years: Toddler / Kids</li>
                                <li>6-12 Years: Boys & Girls</li>
                            </ul>
                        </div>
                    )}
                    {activeTab === "shipping" && (
                        <div>
                            <p className="mb-2 font-medium text-slate-900">Wholesale Shipping Policy</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>We deliver all over India.</li>
                                <li>Dispatch within 24-48 hours of order confirmation.</li>
                                <li>Standard delivery takes 4-7 business days.</li>
                                <li>Transport details will be shared on WhatsApp.</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
