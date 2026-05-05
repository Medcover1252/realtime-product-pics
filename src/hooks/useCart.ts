import { useState, useEffect, useCallback } from "react";
import type { Product } from "@/hooks/useGoogleSheet";

export interface CartItem {
  product: Product;
  quantity: number;
}

const CART_STORAGE_KEY = "korea_skincare_cart_v1";

interface StoredCart {
  items?: CartItem[];
  customerName?: string;
  useVVIPPrice?: boolean;
  customPrices?: Record<string, number>;
}

const loadStoredCart = (): StoredCart => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export function useCart() {
  const [storedCart] = useState(loadStoredCart);
  const [items, setItems] = useState<CartItem[]>(() => storedCart.items || []);
  const [customerName, setCustomerName] = useState(() => storedCart.customerName || "");
  const [useVVIPPrice, setUseVVIPPrice] = useState(() => storedCart.useVVIPPrice || false);
  const [customPrices, setCustomPrices] = useState<Record<string, number>>(() => storedCart.customPrices || {});

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ items, customerName, useVVIPPrice, customPrices })
      );
    } catch {
      // Ignore storage failures such as private browsing quota limits.
    }
  }, [items, customerName, useVVIPPrice, customPrices]);

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
