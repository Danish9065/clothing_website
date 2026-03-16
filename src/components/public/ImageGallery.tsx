"use client";

import { useState } from "react";
import Image from "next/image";

export function ImageGallery({ images }: { images: any[] }) {
    const defaultImage = images?.length > 0 ? images[0].image_url : "/placeholder.jpg";
    const [mainImage, setMainImage] = useState(defaultImage);

    return (
        <div className="flex flex-col gap-4">
            <div className="aspect-[3/4] relative rounded-2xl overflow-hidden bg-slate-100">
                <Image
                    src={mainImage}
                    alt="Product image"
                    fill
                    className="object-cover object-top"
                    priority
                />
            </div>

            {images && images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setMainImage(img.image_url)}
                            className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${mainImage === img.image_url ? 'border-brand-500 shadow-md' : 'border-transparent hover:border-slate-300'
                                }`}
                        >
                            <Image
                                src={img.image_url}
                                alt={`Thumbnail ${i + 1}`}
                                fill
                                className="object-cover object-top"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
