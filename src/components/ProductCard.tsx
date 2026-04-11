import type { Product } from "@/hooks/useGoogleSheet";

interface Props {
  product: Product;
  onClick: () => void;
}

const ProductCard = ({ product, onClick }: Props) => {
  const formattedPrice = product.price
    ? `฿${Number(product.price).toLocaleString()}`
    : "";

  const imgSrc = product.imageUrl || "";

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-lg border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
    >
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
        {product.category && (
          <p className="text-muted-foreground text-xs">{product.category}</p>
        )}
        {formattedPrice && (
          <p className="font-bold text-primary text-lg">
            {formattedPrice}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
