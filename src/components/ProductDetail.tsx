import type { Product } from "@/hooks/useGoogleSheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  canSeeVVIP?: boolean;
}

const ProductDetail = ({ product, open, onClose, canSeeVVIP = false }: Props) => {
  if (!product) return null;

  const imgSrc = product.imageUrl || "";
  const formattedPrice = product.price
    ? `฿${Number(product.price).toLocaleString()}`
    : "";
  const formattedVVIP = product.priceVVIP
    ? `฿${Number(product.priceVVIP).toLocaleString()}`
    : "";

  const details = [
    { label: "บาร์โค้ด", value: product.barcode },
    { label: "บาร์โค้ดกล่อง", value: product.barcodeBox },
    { label: "Brand", value: product.brand },
    { label: "หมวด", value: product.category },
    { label: "Serie รุ่น", value: product.serie },
    { label: "ชื่อเรียก", value: product.nickname },
    { label: "วันหมดอายุ", value: product.expiryDate },
    { label: "จำนวนลัง", value: product.boxCount },
    { label: "จำนวน", value: product.quantity },
    { label: "ราคา", value: formattedPrice },
    ...(canSeeVVIP && formattedVVIP ? [{ label: "ราคา VVIP", value: formattedVVIP }] : []),
  ].filter((d) => d.value);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {product.combined || product.nickname || product.barcode}
          </DialogTitle>
        </DialogHeader>

        {imgSrc && (
          <a href={imgSrc} target="_blank" rel="noopener noreferrer" className="block w-full overflow-hidden rounded-lg bg-muted cursor-zoom-in">
            <img
              src={imgSrc}
              alt={product.combined || product.barcode}
              className="w-full max-h-[400px] object-contain"
            />
          </a>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {details.map((d) => (
            <div key={d.label} className="rounded-lg bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground">{d.label}</p>
              <p className="font-medium text-foreground text-sm mt-0.5">{d.value}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetail;
