export type Product = {
    id: string;
    name: string;
    slug: string;
    gender: string;
    price: number;
    compare_at_price?: number | null;
    min_order_quantity: number;
    primaryImage?: string | null;
    categoryLabel?: string;
    is_featured?: boolean;
};
