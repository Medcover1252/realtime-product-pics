import { useState, useMemo } from "react";
import { useGoogleSheet, type Product } from "@/hooks/useGoogleSheet";
import ProductCard from "@/components/ProductCard";
import ProductDetail from "@/components/ProductDetail";
import CategoryFilter, { type FilterKey } from "@/components/CategoryFilter";
import { RefreshCw, Search } from "lucide-react";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS8ZAxsN3ZCSa2VxpmMNpCPDjEubNVYJKkier6mZ_3NYnOr-of5F3HqDBgOXAL3XbzDE9T4yWv4pk0c/pubhtml";

const Index = () => {
  const { products, loading, error, lastUpdated, refresh } = useGoogleSheet(SHEET_URL);
  const [activeFilters, setActiveFilters] = useState<Record<FilterKey, string>>({
    brand: "",
    category: "",
    serie: "",
  });
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (activeFilters.brand && p.brand !== activeFilters.brand) return false;
      if (activeFilters.category && p.category !== activeFilters.category) return false;
      if (activeFilters.serie && p.serie !== activeFilters.serie) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${p.barcode} ${p.barcodeBox} ${p.brand} ${p.category} ${p.combined} ${p.nickname}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [products, activeFilters, search]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleFilterChange = (key: FilterKey, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-2xl font-bold text-foreground">
            📦 รายการสินค้า
          </h1>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="hidden text-xs text-muted-foreground sm:block">
                อัพเดตล่าสุด: {lastUpdated.toLocaleTimeString("th-TH")}
              </span>
            )}
            <button
              onClick={handleRefresh}
              className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              title="รีเฟรช"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-5">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="ค้นหาสินค้า... (บาร์โค้ด, ชื่อ, Brand)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Filters */}
        <CategoryFilter
          products={products}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
        />

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border border-border bg-card">
                <div className="aspect-square bg-muted" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-16 rounded bg-muted" />
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-5 w-1/3 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            ไม่พบสินค้า
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          อัพเดตอัตโนมัติทุก 30 วินาที • สินค้าทั้งหมด {products.length} รายการ
        </p>
      </main>

      <ProductDetail
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

export default Index;
