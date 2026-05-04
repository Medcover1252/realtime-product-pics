import { useState, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, FileText, Crown, Pencil, Check } from "lucide-react";
import type { CartItem } from "@/hooks/useCart";

interface Props {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  customerName: string;
  onCustomerNameChange: (name: string) => void;
  onUpdateQuantity: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  totalAmount: number;
  onGenerateOrder: () => void;
  canSeeVVIP?: boolean;
  useVVIPPrice?: boolean;
  onToggleVVIPPrice?: (v: boolean) => void;
  customPrices?: Record<string, number>;
  onUpdateCustomPrice?: (productId: string, price: number) => void;
  onClearCustomPrice?: (productId: string) => void;
  getItemPrice?: (item: CartItem) => number;
}

const CartDrawer = ({
  open,
  onClose,
  items,
  customerName,
  onCustomerNameChange,
  onUpdateQuantity,
  onRemoveItem,
  totalAmount,
  onGenerateOrder,
  canSeeVVIP,
  useVVIPPrice,
  onToggleVVIPPrice,
  customPrices = {},
  onUpdateCustomPrice,
  onClearCustomPrice,
  getItemPrice,
}: Props) => {
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState("");

  const startEditPrice = (productId: string, currentPrice: number) => {
    setEditingPriceId(productId);
    setEditPriceValue(String(currentPrice));
  };

  const confirmEditPrice = (productId: string) => {
    const val = Number(editPriceValue);
    if (!isNaN(val) && val >= 0 && onUpdateCustomPrice) {
      onUpdateCustomPrice(productId, val);
    }
    setEditingPriceId(null);
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-lg">🛒 ตะกร้าสินค้า</SheetTitle>
          {items.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {items.length} รายการ · รวม {totalQuantity} ชิ้น
            </p>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Customer name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">ชื่อลูกค้า</label>
            <Input
              placeholder="กรอกชื่อลูกค้า..."
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
            />
          </div>

          {/* VVIP price toggle */}
          {canSeeVVIP && onToggleVVIPPrice && (
            <button
              onClick={() => onToggleVVIPPrice(!useVVIPPrice)}
              className={`flex items-center gap-2 w-full rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                useVVIPPrice
                  ? "border-amber-500/50 bg-amber-500/15 text-amber-600"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <Crown className="h-4 w-4" />
              <span>คำนวณราคา VVIP</span>
              <span className={`ml-auto text-xs rounded-full px-2 py-0.5 ${
                useVVIPPrice ? "bg-amber-500/20 text-amber-600" : "bg-muted text-muted-foreground"
              }`}>
                {useVVIPPrice ? "เปิด" : "ปิด"}
              </span>
            </button>
          )}

          {items.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">ยังไม่มีสินค้าในตะกร้า</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const unitPrice = getItemPrice ? getItemPrice(item) : (Number(item.product.price) || 0);
                const hasCustomPrice = customPrices[item.product.id] !== undefined;
                const isEditing = editingPriceId === item.product.id;

                return (
                  <div
                    key={item.product.id}
                    className="flex gap-3 rounded-lg border border-border p-3 bg-card"
                  >
                    {item.product.imageUrl && (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.combined}
                        className="h-14 w-14 rounded-md object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-semibold leading-tight line-clamp-2 text-card-foreground">
                        {item.product.combined || item.product.nickname || item.product.barcode}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">{item.product.barcode}</p>

                      {/* Price display / edit */}
                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">฿</span>
                            <input
                              autoFocus
                              type="number"
                              value={editPriceValue}
                              onChange={(e) => setEditPriceValue(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") confirmEditPrice(item.product.id); }}
                              className="w-20 rounded border border-primary/30 bg-background px-1.5 py-0.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button
                              onClick={() => confirmEditPrice(item.product.id)}
                              className="rounded-full p-0.5 text-primary hover:bg-primary/10"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className={`text-sm font-bold ${hasCustomPrice ? "text-orange-500" : useVVIPPrice ? "text-amber-500" : "text-primary"}`}>
                              ฿{unitPrice.toLocaleString()} × {item.quantity} = ฿{(unitPrice * item.quantity).toLocaleString()}
                            </p>
                            {canSeeVVIP && (
                              <button
                                onClick={() => startEditPrice(item.product.id, unitPrice)}
                                className="rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                                title="แก้ไขราคา"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      {hasCustomPrice && (
                        <button
                          onClick={() => onClearCustomPrice?.(item.product.id)}
                          className="text-[10px] text-orange-500 hover:underline"
                        >
                          รีเซ็ตราคา
                        </button>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="rounded-full bg-rose-500 text-white p-1 hover:bg-rose-600 active:bg-rose-700 transition-colors shadow-sm"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val > 0) onUpdateQuantity(item.product.id, val);
                          }}
                          className="text-sm font-bold w-12 text-center text-foreground bg-muted rounded px-1 py-0.5 border border-border focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="rounded-full bg-emerald-500 text-white p-1 hover:bg-emerald-600 active:bg-emerald-700 transition-colors shadow-sm"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="ml-auto rounded-full p-1 text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">ยอดรวม</span>
            <span className="text-xl font-bold text-primary">฿{totalAmount.toLocaleString()}</span>
          </div>
          <Button
            className="w-full"
            size="lg"
            disabled={items.length === 0 || !customerName.trim()}
            onClick={onGenerateOrder}
          >
            <FileText className="h-4 w-4 mr-2" />
            สร้างใบสั่งซื้อ
          </Button>
          {items.length > 0 && !customerName.trim() && (
            <p className="text-xs text-destructive text-center">กรุณากรอกชื่อลูกค้า</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
