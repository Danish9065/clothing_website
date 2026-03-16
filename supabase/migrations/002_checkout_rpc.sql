-- decrement_stock RPC function for order checkout
CREATE OR REPLACE FUNCTION decrement_stock(
  variant_id UUID, 
  amount INT
) RETURNS void AS $$
  UPDATE product_variants 
  SET stock_quantity = stock_quantity - amount
  WHERE id = variant_id 
  AND stock_quantity >= amount;
$$ LANGUAGE sql;
