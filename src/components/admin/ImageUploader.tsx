"use client";

import { useState } from "react";
import { UploadCloud, X, Star } from "lucide-react";
import { ProductImage } from "@/types";
import { uploadToCloudinary } from "@/lib/cloudinary";
import Image from "next/image";

interface ImageUploaderProps {
    productId: string;
    existingImages: ProductImage[];
    onUploadComplete: () => void;
}

export function ImageUploader({
    productId,
    existingImages,
    onUploadComplete,
}: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await processFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            await processFiles(Array.from(e.target.files));
        }
    };

    const processFiles = async (files: File[]) => {
        setIsUploading(true);
        try {
            for (const file of files) {
                // Upload to Cloudinary
                const { secure_url, public_id } = await uploadToCloudinary(
                    file,
                    `products/${productId}`
                );

                // Save reference to Supabase via our API endpoint
                await fetch(`/api/admin/products/${productId}/images`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        image_url: secure_url,
                        cloudinary_public_id: public_id,
                    }),
                });
            }
            onUploadComplete();
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload image. Check console for details.");
        } finally {
            setIsUploading(false);
        }
    };

    const deleteImage = async (imageId: string) => {
        if (!confirm("Are you sure you want to delete this image?")) return;
        try {
            await fetch(`/api/admin/images/${imageId}`, {
                method: "DELETE",
            });
            onUploadComplete();
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const setPrimary = async (imageId: string) => {
        try {
            await fetch(`/api/admin/images/${imageId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_primary: true }),
            });
            onUploadComplete();
        } catch (error) {
            console.error("Set primary error:", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Upload Dropzone */}
            <div
                className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl transition-colors ${dragActive
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                    } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleChange}
                    disabled={isUploading}
                />
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                    {isUploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-3" />
                    ) : (
                        <UploadCloud className="w-10 h-10 mb-3 text-slate-400" />
                    )}
                    <p className="mb-2 text-sm font-semibold">
                        {isUploading ? "Uploading..." : "Click or drag images to upload"}
                    </p>
                    <p className="text-xs">PNG, JPG, WEBP up to 5MB</p>
                </div>
            </div>

            {/* Existing Images Grid */}
            {existingImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {existingImages.map((img) => (
                        <div
                            key={img.id}
                            className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200"
                        >
                            <Image
                                src={img.image_url}
                                alt={img.alt_text || "Product image"}
                                fill
                                className="object-cover"
                            />

                            {/* Badges */}
                            {img.is_primary && (
                                <div className="absolute top-2 left-2 bg-brand-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1 z-10">
                                    <Star className="w-3 h-3 fill-current" />
                                    Primary
                                </div>
                            )}

                            {/* Hover Actions */}
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => deleteImage(img.id)}
                                        className="p-1.5 bg-white text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                {!img.is_primary && (
                                    <button
                                        onClick={() => setPrimary(img.id)}
                                        className="w-full py-2 bg-white text-slate-900 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                                    >
                                        Set as Primary
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
