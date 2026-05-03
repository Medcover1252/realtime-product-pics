import { useState, useCallback } from "react";
import type { Product } from "@/hooks/useGoogleSheet";

export interface CartItem {
  product: Product;
  quantity: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [useVVIPPrice, setUseVVIPPrice] = useState(false);
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});

  const addItem = useCallback((product: Product, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + qty };
        return updated;
      }
      return [...prev, { product, quantity: qty }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
      setCustomPrices((prev) => { const n = { ...prev }; delete n[productId]; return n; });
    } else {
      setItems((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
      );
    }
  }, []);

  const updateCustomPrice = useCallback((productId: string, price: number) => {
    setCustomPrices((prev) => ({ ...prev, [productId]: price }));
  }, []);

  const clearCustomPrice = useCallback((productId: string) => {
    setCustomPrices((prev) => { const n = { ...prev }; delete n[productId]; return n; });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
    setCustomPrices((prev) => { const n = { ...prev }; delete n[productId]; return n; });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCustomerName("");
    setCustomPrices({});
    setUseVVIPPrice(false);
  }, []);

  const getItemPrice = useCallback((item: CartItem) => {
    if (customPrices[item.product.id] !== undefined) return customPrices[item.product.id];
    if (useVVIPPrice && item.product.priceVVIP) return Number(item.product.priceVVIP) || 0;
    return Number(item.product.price) || 0;
  }, [customPrices, useVVIPPrice]);

  const totalAmount = items.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    customerName,
    setCustomerName,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalAmount,
    totalItems,
    useVVIPPrice,
    setUseVVIPPrice,
    customPrices,
    updateCustomPrice,
    clearCustomPrice,
    getItemPrice,
  };
}
