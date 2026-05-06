import { useEffect, useState, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, FileText, Crown, Download, Loader2 } from "lucide-react";
import type { CartItem } from "@/hooks/useCart";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [quantityDrafts, setQuantityDrafts] = useState<Record<string, string>>({});
  const [savingPdf, setSavingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const toBase64 = (url: string): Promise<string> =>
    new Promise((resolve) => {
      const timer = window.setTimeout(() => resolve(""), 1200);
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          window.clearTimeout(timer);
          const c = document.createElement("canvas");
          c.width = img.naturalWidth;
          c.height = img.naturalHeight;
          c.getContext("2d")!.drawImage(img, 0, 0);
          resolve(c.toDataURL("image/jpeg", 0.7));
        } catch { resolve(""); }
      };
      img.onerror = () => { window.clearTimeout(timer); resolve(""); };
      img.src = url;
    });

  const handleQuickPDF = async () => {
    if (items.length === 0 || !customerName.trim()) return;
    setSavingPdf(true);
    try {
      // Build a hidden div for PDF rendering
      const container = document.createElement("div");
      container.style.cssText = "position:fixed;left:-9999px;top:0;width:420px;background:#fff;padding:24px;font-family:sans-serif;color:#111;";

      const orderDate = new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

      // Convert images to base64
      const imgCache: Record<string, string> = {};
      await Promise.all(items.map(async (item) => {
        if (item.product.imageUrl) imgCache[item.product.id] = await toBase64(item.product.imageUrl);
      }));

      let html = `<div style="text-align:center;border-bottom:1px solid #ccc;padding-bottom:12px;margin-bottom:12px;">
        <h2 style="font-size:18px;font-weight:bold;margin:0;">ใบสั่งซื้อสินค้า</h2>
        <p style="font-size:12px;color:#888;margin:4px 0 0;">${orderDate}</p>
      </div>
      <p style="font-size:13px;margin-bottom:12px;"><b>ชื่อลูกค้า:</b> ${customerName}</p>`;

      items.forEach((item, idx) => {
        const unitPrice = getItemPrice ? getItemPrice(item) : (Number(item.product.price) || 0);
        const lineTotal = unitPrice * item.quantity;
        const imgSrc = imgCache[item.product.id] || "";
        html += `<div style="display:flex;gap:8px;border-bottom:1px solid #eee;padding-bottom:8px;margin-bottom:8px;">
          <span style="font-size:11px;color:#aaa;width:16px;flex-shrink:0;">${idx + 1}.</span>
          ${imgSrc ? `<img src="${imgSrc}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;flex-shrink:0;" />` : ""}
          <div style="flex:1;min-width:0;">
            <p style="font-size:12px;font-weight:600;margin:0;line-height:1.3;">${item.product.combined || item.product.nickname || item.product.barcode}</p>
            <p style="font-size:10px;color:#aaa;margin:2px 0;font-family:monospace;">${item.product.barcode}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
              <span style="font-size:11px;color:#666;">฿${unitPrice.toLocaleString()} × ${item.quantity}</span>
              <span style="font-size:13px;font-weight:bold;">฿${lineTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>`;
      });

      html += `<div style="border-top:2px solid #ccc;padding-top:8px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:14px;font-weight:bold;">ยอดรวมทั้งสิ้น</span>
        <span style="font-size:18px;font-weight:bold;color:#e11d48;">฿${totalAmount.toLocaleString()}</span>
      </div>`;

      container.innerHTML = html;
      document.body.appendChild(container);

      const canvas = await html2canvas(container, { scale: 1.5, useCORS: true, backgroundColor: "#ffffff", logging: false });
      document.body.removeChild(container);

      const imgData = canvas.toDataURL("image/jpeg", 0.85);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

      const fileName = `ใบสั่งซื้อ_${customerName}_${Date.now()}.pdf`;
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        const blob = pdf.output("blob");
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = fileName; a.target = "_blank";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      } else {
        pdf.save(fileName);
      }
    } finally {
      setSavingPdf(false);
    }
  };

  useEffect(() => {
    setQuantityDrafts((prev) => {
      const next: Record<string, string> = {};
      items.forEach((item) => {
        next[item.product.id] = String(item.quantity);
      });
      return next;
    });
  }, [items]);

  const handlePriceChange = (productId: string, value: string) => {
    setPriceDrafts((prev) => ({ ...prev, [productId]: value }));
    const price = Number(value);
    if (value !== "" && !Number.isNaN(price) && price >= 0) {
      onUpdateCustomPrice?.(productId, price);
    }
  };

  const handleQuantityChange = (productId: string, value: string) => {
    setQuantityDrafts((prev) => ({ ...prev, [productId]: value }));
    const qty = Number(value);
    if (value !== "" && Number.isInteger(qty) && qty > 0) {
      onUpdateQuantity(productId, qty);
    }
  };

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
                const priceDraft = priceDrafts[item.product.id] ?? String(unitPrice);
                const quantityDraft = quantityDrafts[item.product.id] ?? String(item.quantity);

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

                      {/* Price input */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">ราคา/ชิ้น</label>
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-28 items-center rounded-md border border-input bg-background px-2 focus-within:ring-1 focus-within:ring-primary">
                            <span className="text-sm text-muted-foreground">฿</span>
                            <input
                              type="number"
                              min={0}
                              inputMode="decimal"
                              value={priceDraft}
                              onChange={(e) => handlePriceChange(item.product.id, e.target.value)}
                              onBlur={(e) => {
                                if (e.target.value === "") handlePriceChange(item.product.id, String(unitPrice));
                              }}
                              className="w-full bg-transparent px-1 text-sm font-bold text-foreground focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                          <p className={`text-sm font-bold ${hasCustomPrice ? "text-primary" : useVVIPPrice ? "text-primary" : "text-primary"}`}>
                            รวม ฿{(unitPrice * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {hasCustomPrice && (
                        <button
                          onClick={() => {
                            onClearCustomPrice?.(item.product.id);
                            setPriceDrafts((prev) => {
                              const next = { ...prev };
                              delete next[item.product.id];
                              return next;
                            });
                          }}
                          className="text-[10px] text-orange-500 hover:underline"
                        >
                          รีเซ็ตราคา
                        </button>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const nextQty = item.quantity - 1;
                            setQuantityDrafts((prev) => ({ ...prev, [item.product.id]: String(Math.max(1, nextQty)) }));
                            onUpdateQuantity(item.product.id, nextQty);
                          }}
                          className="rounded-full bg-rose-500 text-white p-1 hover:bg-rose-600 active:bg-rose-700 transition-colors shadow-sm"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          inputMode="numeric"
                          value={quantityDraft}
                          onChange={(e) => handleQuantityChange(item.product.id, e.target.value)}
                          onBlur={(e) => {
                            if (e.target.value === "") handleQuantityChange(item.product.id, String(item.quantity));
                          }}
                          className="text-sm font-bold w-12 text-center text-foreground bg-muted rounded px-1 py-0.5 border border-border focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => {
                            const nextQty = item.quantity + 1;
                            setQuantityDrafts((prev) => ({ ...prev, [item.product.id]: String(nextQty) }));
                            onUpdateQuantity(item.product.id, nextQty);
                          }}
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
