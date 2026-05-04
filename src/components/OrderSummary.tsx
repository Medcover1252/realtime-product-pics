import { useRef, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Image as ImageIcon, Loader2 } from "lucide-react";
import type { CartItem } from "@/hooks/useCart";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Props {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  customerName: string;
  totalAmount: number;
  onClearCart: () => void;
  getItemPrice?: (item: CartItem) => number;
}

// Convert image URL to base64 to avoid CORS issues with html2canvas
const toBase64 = (url: string): Promise<string> =>
  new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d")!.drawImage(img, 0, 0);
      resolve(c.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => resolve("");
    img.src = url;
  });

const OrderSummary = ({ open, onClose, items, customerName, totalAmount, onClearCart, getItemPrice }: Props) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState<"pdf" | "png" | null>(null);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});

  // Pre-convert all product images to base64 when dialog opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const convert = async () => {
      const cache: Record<string, string> = {};
      await Promise.all(
        items.map(async (item) => {
          if (item.product.imageUrl) {
            cache[item.product.id] = await toBase64(item.product.imageUrl);
          }
        })
      );
      if (!cancelled) setImageCache(cache);
    };
    convert();
    return () => { cancelled = true; };
  }, [open, items]);

  const orderDate = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const captureCanvas = async () => {
    if (!printRef.current) return null;
    return html2canvas(printRef.current, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
  };

  const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleSavePDF = async () => {
    setSaving("pdf");
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const imgData = canvas.toDataURL("image/jpeg", 0.85);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

      if (isMobile()) {
        const pdfBlob = pdf.output("blob");
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ใบสั่งซื้อ_${customerName}_${Date.now()}.pdf`;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      } else {
        pdf.save(`ใบสั่งซื้อ_${customerName}_${Date.now()}.pdf`);
      }
    } finally {
      setSaving(null);
    }
  };

  const handleSavePNG = async () => {
    setSaving("png");
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;

      if (isMobile() && navigator.share) {
        try {
          const file = new File([blob], `ใบสั่งซื้อ_${customerName}.png`, { type: "image/png" });
          await navigator.share({ files: [file], title: "ใบสั่งซื้อ", text: `ใบสั่งซื้อ - ${customerName}` });
          return;
        } catch { /* fall through */ }
      }

      const url = URL.createObjectURL(blob);
      if (isMobile()) {
        const w = window.open();
        if (w) {
          w.document.write(`
            <html>
              <head><title>ใบสั่งซื้อ</title><meta name="viewport" content="width=device-width,initial-scale=1"></head>
              <body style="margin:0;display:flex;justify-content:center;align-items:start;background:#f5f5f5;min-height:100vh">
                <div style="text-align:center;padding:16px;width:100%">
                  <p style="font-size:14px;color:#666;margin-bottom:12px">📱 กดค้างที่รูปเพื่อบันทึกลง Gallery</p>
                  <img src="${url}" style="max-width:100%;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15)" />
                </div>
              </body>
            </html>
          `);
        } else {
          const a = document.createElement("a");
          a.href = url;
          a.download = `ใบสั่งซื้อ_${customerName}_${Date.now()}.png`;
          a.target = "_blank";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = `ใบสั่งซื้อ_${customerName}_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
    } finally {
      setSaving(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📋 ใบสั่งซื้อ</DialogTitle>
        </DialogHeader>

        {/* Printable area */}
        <div ref={printRef} className="bg-white text-gray-900 p-6 rounded-lg space-y-4">
          <div className="text-center border-b border-gray-300 pb-3">
            <h2 className="text-xl font-bold">ใบสั่งซื้อสินค้า</h2>
            <p className="text-sm text-gray-500 mt-1">{orderDate}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-semibold">ชื่อลูกค้า:</span> {customerName}
            </p>
          </div>

          {/* Items list with images */}
          <div className="space-y-3">
            {items.map((item, idx) => {
              const unitPrice = getItemPrice ? getItemPrice(item) : (Number(item.product.price) || 0);
              const lineTotal = unitPrice * item.quantity;
              const imgSrc = imageCache[item.product.id] || item.product.imageUrl;
              return (
                <div key={item.product.id} className="flex gap-3 border-b border-gray-200 pb-3">
                  <div className="text-xs text-gray-400 pt-1 w-5 shrink-0">{idx + 1}.</div>
                  {imgSrc && (
                    <img
                      src={imgSrc}
                      alt={item.product.combined}
                      className="h-14 w-14 rounded-md object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">
                      {item.product.combined || item.product.nickname || item.product.barcode}
                    </p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{item.product.barcode}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        ฿{unitPrice.toLocaleString()} × {item.quantity}
                      </span>
                      <span className="text-sm font-bold">฿{lineTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
            <span className="text-base font-bold">ยอดรวมทั้งสิ้น</span>
            <span className="text-xl font-bold text-rose-600">฿{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Export buttons */}
        <div className="flex gap-3 pt-2">
          <Button onClick={handleSavePDF} className="flex-1" variant="default" disabled={!!saving}>
            {saving === "pdf" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            บันทึก PDF
          </Button>
          <Button onClick={handleSavePNG} className="flex-1" variant="outline" disabled={!!saving}>
            {saving === "png" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ImageIcon className="h-4 w-4 mr-2" />}
            บันทึก PNG
          </Button>
        </div>
        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={() => {
            onClearCart();
            onClose();
          }}
        >
          ล้างตะกร้า & ปิด
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default OrderSummary;
