import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, FileText } from "lucide-react";
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
}: Props) => {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-lg">🛒 ตะกร้าสินค้า</SheetTitle>
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

          {items.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">ยังไม่มีสินค้าในตะกร้า</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const unitPrice = Number(item.product.price) || 0;
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
                      <p className="text-sm font-bold text-primary">
                        ฿{unitPrice.toLocaleString()} × {item.quantity} = ฿{(unitPrice * item.quantity).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="rounded-full border border-border p-1 hover:bg-muted transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="rounded-full border border-border p-1 hover:bg-muted transition-colors"
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
