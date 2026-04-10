import { useState, useMemo } from "react";
import { useGoogleSheet } from "@/hooks/useGoogleSheet";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import SheetConfig from "@/components/SheetConfig";
import { RefreshCw } from "lucide-react";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS2WfbKQyb6FdmyDiV9rt01kPUg-Fu7IPma8umPUD9ot8xx6RWeRhg8yrFK4CqH8pjR-24jkdH_n7Ve/pubhtml";

const Index = () => {
  return <CatalogView sheetUrl={SHEET_URL} />;
};

function CatalogView({ sheetUrl, onDisconnect }: { sheetUrl: string; onDisconnect: () => void }) {
  const { products, loading, error, lastUpdated, refresh } = useGoogleSheet(sheetUrl);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [products]);

  const filtered = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            📦 แคตตาล็อกสินค้า
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
            <button
              onClick={onDisconnect}
              className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-accent"
            >
              เปลี่ยน Sheet
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {categories.length > 1 && (
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        )}

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
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          อัพเดตอัตโนมัติทุก 30 วินาที • สินค้าทั้งหมด {products.length} รายการ
        </p>
      </main>
    </div>
  );
}

export default Index;
