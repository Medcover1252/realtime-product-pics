import { Heart } from "lucide-react";
import type { Product } from "@/hooks/useGoogleSheet";

interface Props {
  product: Product;
  onClick: () => void;
  canSeeVVIP?: boolean;
  isAdmin?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const ProductCard = ({
  product,
  onClick,
  canSeeVVIP = false,
  isAdmin = false,
  isFavorite = false,
  onToggleFavorite,
}: Props) => {
  const formattedPrice = product.price
    ? `฿${Number(product.price).toLocaleString()}`
    : "";
  const formattedVVIP = product.priceVVIP
    ? `฿${Number(product.priceVVIP).toLocaleString()}`
    : "";

  const imgSrc = product.imageUrl || "";

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer rounded-lg border border-border/60 glass-card overflow-hidden shadow-[0_2px_16px_-4px_hsl(var(--primary)/0.10)] hover:shadow-[0_8px_30px_-6px_hsl(var(--primary)/0.18)] transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Favorite button — admin only */}
      {isAdmin && onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
          className={`absolute top-2 right-2 z-[2] rounded-full p-1.5 backdrop-blur-md transition-all duration-200 ${
            isFavorite
              ? "bg-rose-500/90 text-white shadow-lg shadow-rose-500/30 scale-110"
              : "bg-black/40 text-white/70 hover:bg-black/60 hover:text-white"
          }`}
          title={isFavorite ? "เอาออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
        >
          <Heart
            className={`h-4 w-4 transition-transform duration-200 ${isFavorite ? "fill-current" : ""}`}
          />
        </button>
      )}

      <div className="aspect-square overflow-hidden bg-muted">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.combined || product.barcode}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
            ไม่มีรูปภาพ
          </div>
        )}
      </div>
      <div className="p-3 space-y-1.5">
        {product.brand && (
          <span className="inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            {product.brand}
          </span>
        )}
        <h3 className="font-semibold text-card-foreground text-sm leading-tight line-clamp-2">
          {product.combined || product.nickname || product.barcode}
        </h3>
        {product.barcode && (
          <p className="text-muted-foreground text-xs font-mono tracking-wide">{product.barcode}</p>
        )}
        <div className="flex items-end justify-between gap-2">
          <div className="space-y-0.5">
            {formattedPrice && (
              <p className="font-bold text-primary text-lg">{formattedPrice}</p>
            )}
            {canSeeVVIP && formattedVVIP && (
              <p className="text-xs font-semibold text-amber-600">
                VVIP {formattedVVIP}
              </p>
            )}
          </div>
          {product.quantity && (
            <p className="text-right font-extrabold text-foreground text-xl tracking-tight leading-none">
              {product.quantity}
              <span className="block text-[10px] font-medium text-muted-foreground tracking-normal">จำนวน</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
