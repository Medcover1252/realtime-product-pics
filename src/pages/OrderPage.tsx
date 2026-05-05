import { useMemo } from "react";
import type { CartItem } from "@/hooks/useCart";

const ORDER_STORAGE_KEY = "korea_skincare_order_summary";

export interface OrderData {
  items: { name: string; barcode: string; imageUrl: string; unitPrice: number; quantity: number }[];
  customerName: string;
  totalAmount: number;
  date: string;
}

export const saveOrderAndOpen = (data: OrderData) => {
  sessionStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(data));
  window.open("/order", "_blank");
};

const OrderPage = () => {
  const order = useMemo<OrderData | null>(() => {
    try {
      const raw = sessionStorage.getItem(ORDER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-500">
        <p>ไม่พบข้อมูลใบสั่งซื้อ</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto p-6 space-y-4">
        {/* Header */}
        <div className="text-center border-b border-gray-300 pb-3">
          <h1 className="text-xl font-bold text-gray-900">ใบสั่งซื้อสินค้า</h1>
          <p className="text-sm text-gray-500 mt-1">{order.date}</p>
        </div>

        {/* Customer */}
        <div>
          <p className="text-sm text-gray-900">
            <span className="font-semibold">ชื่อลูกค้า:</span> {order.customerName}
          </p>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {order.items.map((item, idx) => {
            const lineTotal = item.unitPrice * item.quantity;
            return (
              <div key={idx} className="flex gap-3 border-b border-gray-200 pb-3">
                <div className="text-xs text-gray-400 pt-1 w-5 shrink-0">{idx + 1}.</div>
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-14 w-14 rounded-md object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{item.barcode}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      ฿{item.unitPrice.toLocaleString()} × {item.quantity}
                    </span>
                    <span className="text-sm font-bold text-gray-900">฿{lineTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
          <span className="text-base font-bold text-gray-900">ยอดรวมทั้งสิ้น</span>
          <span className="text-xl font-bold text-rose-600">฿{order.totalAmount.toLocaleString()}</span>
        </div>

        <p className="text-center text-xs text-gray-400 pt-4">📸 แคปหน้าจอเพื่อบันทึกใบสั่งซื้อ</p>
      </div>
    </div>
  );
};

export default OrderPage;
