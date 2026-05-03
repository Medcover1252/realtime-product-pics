import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Image as ImageIcon } from "lucide-react";
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
}

const OrderSummary = ({ open, onClose, items, customerName, totalAmount, onClearCart }: Props) => {
  const printRef = useRef<HTMLDivElement>(null);
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
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
  };

  const handleSavePDF = async () => {
    const canvas = await captureCanvas();
    if (!canvas) return;
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`ใบสั่งซื้อ_${customerName}_${Date.now()}.pdf`);
  };

  const handleSavePNG = async () => {
    const canvas = await captureCanvas();
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `ใบสั่งซื้อ_${customerName}_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
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

          {/* Items table */}
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 pr-2">#</th>
                <th className="text-left py-2 pr-2">สินค้า / บาร์โค้ด</th>
                <th className="text-right py-2 pr-2">ราคา</th>
                <th className="text-center py-2 pr-2">จำนวน</th>
                <th className="text-right py-2">รวม</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const unitPrice = Number(item.product.price) || 0;
                const lineTotal = unitPrice * item.quantity;
                return (
                  <tr key={item.product.id} className="border-b border-gray-200">
                    <td className="py-2 pr-2 text-gray-500">{idx + 1}</td>
                    <td className="py-2 pr-2">
                      <p className="font-medium leading-tight">
                        {item.product.combined || item.product.nickname || item.product.barcode}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">{item.product.barcode}</p>
                    </td>
                    <td className="py-2 pr-2 text-right whitespace-nowrap">฿{unitPrice.toLocaleString()}</td>
                    <td className="py-2 pr-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right font-semibold whitespace-nowrap">฿{lineTotal.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Total */}
          <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
            <span className="text-base font-bold">ยอดรวมทั้งสิ้น</span>
            <span className="text-xl font-bold text-rose-600">฿{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Export buttons */}
        <div className="flex gap-3 pt-2">
          <Button onClick={handleSavePDF} className="flex-1" variant="default">
            <Download className="h-4 w-4 mr-2" />
            บันทึก PDF
          </Button>
          <Button onClick={handleSavePNG} className="flex-1" variant="outline">
            <ImageIcon className="h-4 w-4 mr-2" />
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
