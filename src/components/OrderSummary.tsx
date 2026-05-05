import { useEffect } from "react";
import type { CartItem } from "@/hooks/useCart";
import { saveOrderAndOpen, type OrderData } from "@/pages/OrderPage";

interface Props {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  customerName: string;
  totalAmount: number;
  onClearCart: () => void;
  getItemPrice?: (item: CartItem) => number;
}

const OrderSummary = ({ open, onClose, items, customerName, totalAmount, onClearCart, getItemPrice }: Props) => {
  useEffect(() => {
    if (!open || items.length === 0) return;

    const orderDate = new Date().toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const data: OrderData = {
      items: items.map((item) => {
        const unitPrice = getItemPrice ? getItemPrice(item) : (Number(item.product.price) || 0);
        return {
          name: item.product.combined || item.product.nickname || item.product.barcode,
          barcode: item.product.barcode,
          imageUrl: item.product.imageUrl || "",
          unitPrice,
          quantity: item.quantity,
        };
      }),
      customerName,
      totalAmount,
      date: orderDate,
    };

    saveOrderAndOpen(data);
    onClose();
  }, [open]);

  return null;
};

export default OrderSummary;
