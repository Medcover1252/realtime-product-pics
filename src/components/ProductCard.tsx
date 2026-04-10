import type { Product } from "@/hooks/useGoogleSheet";

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  const formattedPrice = product.price
    ? `฿${Number(product.price).toLocaleString()}`
    : "";

  return (
    <div className="group rounded-lg border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="aspect-square overflow-hidden bg-muted">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
            ไม่มีรูปภาพ
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        {product.category && (
          <span className="inline-block rounded-full bg-badge px-2.5 py-0.5 text-xs font-medium text-badge-foreground">
            {product.category}
          </span>
        )}
        <h3 className="font-heading font-semibold text-card-foreground text-lg leading-tight line-clamp-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-muted-foreground text-sm line-clamp-2">
            {product.description}
          </p>
        )}
        {formattedPrice && (
          <p className="font-heading font-bold text-primary text-xl">
            {formattedPrice}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
