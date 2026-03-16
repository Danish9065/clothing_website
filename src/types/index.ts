export interface Profile {
    id: string;
    full_name: string | null;
    phone: string | null;
    business_name: string | null;
    role: 'customer' | 'admin';
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    hero_image_url: string | null;
    display_order: number;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    short_description: string | null;
    description: string | null;
    category_id: string | null;
    gender: 'boys' | 'girls' | 'child' | 'unisex';
    age_min_months: number | null;
    age_max_months: number | null;
    price: number;
    compare_at_price: number | null;
    wholesale_price: number | null;
    wholesale_min_qty: number;
    is_active: boolean;
    is_featured: boolean;
    is_new_arrival: boolean;
    tags: string[];
    category?: Category;
    images?: ProductImage[];
    variants?: ProductVariant[];

    // Frontend helpers from Phase 1
    categoryLabel?: string;
    primaryImage?: string | null;
}

export interface ProductVariant {
    id: string;
    product_id: string;
    size_label: string;
    sku: string | null;
    stock_quantity: number;
    is_active: boolean;
}

export interface ProductImage {
    id: string;
    product_id: string;
    image_url: string;
    alt_text: string | null;
    is_primary: boolean;
    sort_order: number;
    cloudinary_public_id: string | null;
}

export interface CartItem {
    variantId: string;
    productId: string;
    productName: string;
    sizeLabel: string;
    price: number;
    compareAtPrice?: number;
    imageUrl: string;
    quantity: number;
    wholesaleMinQty: number;
    retailPrice: number;
    wholesalePrice: number | null;
    isWholesale: boolean;
    maxStock: number;
}

export interface Order {
    id: string;
    user_id: string | null;
    email: string;
    business_name: string | null;
    total_amount: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    shipping_address: ShippingAddress;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    variant_id: string;
    quantity: number;
    price: number;
    is_wholesale: boolean;
    wholesale_min_qty_snapshot: number;
}

export interface ShippingAddress {
    full_name: string;
    business_name?: string;
    phone_number: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}
