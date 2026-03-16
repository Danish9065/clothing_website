-- Rename existing columns to match new naming
ALTER TABLE products 
  RENAME COLUMN min_order_quantity TO wholesale_min_qty;

-- Add wholesale_price column (the discounted bulk price)
-- The existing 'price' column becomes the RETAIL price
ALTER TABLE products 
  ADD COLUMN wholesale_price NUMERIC(10,2);

-- For existing products: 
-- move current price to wholesale_price (it was wholesale)
-- set retail price 20% higher than current price
UPDATE products 
SET wholesale_price = price,
    price = ROUND(price * 1.20, 2)
WHERE wholesale_min_qty > 0;

-- Products with wholesale_min_qty = 0 stay retail only
-- (no wholesale_price needed)

-- Update order_items to track which mode was used
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS is_wholesale BOOLEAN 
  NOT NULL DEFAULT FALSE;

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS wholesale_min_qty_snapshot 
  INT NOT NULL DEFAULT 0;

-- Existing orders: mark as wholesale (they were wholesale)
UPDATE order_items SET is_wholesale = TRUE;
