import { useState, useMemo } from "react";
import { useGoogleSheet, type Product } from "@/hooks/useGoogleSheet";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import ProductCard from "@/components/ProductCard";
import ProductDetail from "@/components/ProductDetail";
import CategoryFilter, { type FilterKey } from "@/components/CategoryFilter";
import VVIPLoginDialog from "@/components/VVIPLoginDialog";
import { RefreshCw, Search, SlidersHorizontal, Megaphone, X, LogIn, LogOut, Crown, ShieldCheck } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS8ZAxsN3ZCSa2VxpmMNpCPDjEubNVYJKkier6mZ_3NYnOr-of5F3HqDBgOXAL3XbzDE9T4yWv4pk0c/pubhtml";

const DEFAULT_ANNOUNCEMENT = "ยินดีต้อนรับสู่ร้านค้าของเรา! 🎉 สินค้าใหม่อัปเดตทุกวัน";
const ANNOUNCEMENT_KEY = "shop_announcement";


const Index = () => {
  const { products, loading, error, lastUpdated, refresh } = useGoogleSheet(SHEET_URL);
  const { session, login, logout, loading: authLoading, error: authError, canSeeVVIP } = useCustomerAuth();
  const [activeFilters, setActiveFilters] = useState<Record<FilterKey, string>>({
    brand: "",
    category: "",
    serie: "",
  });
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [announcement, setAnnouncement] = useState(() => localStorage.getItem(ANNOUNCEMENT_KEY) || DEFAULT_ANNOUNCEMENT);
  const [editingAnnouncement, setEditingAnnouncement] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            📦 รายการสินค้า
          </h1>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 lg:w-64 rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Filter popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 max-h-[70vh] overflow-y-auto" align="end">
                <p className="text-sm font-semibold text-foreground mb-3">ตัวกรอง</p>
                <CategoryFilter
                  products={products}
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                />
              </PopoverContent>
            </Popover>

            {/* VVIP Login */}
            {session ? (
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-xs font-bold text-amber-600">
                  <Crown className="h-4 w-4" />
                  <span className="hidden sm:inline">{session.id}</span>
                  <span className="sm:hidden">VVIP</span>
                </span>
                <button
                  onClick={logout}
                  className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  title="ออกจากระบบ"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                title="เข้าสู่ระบบ VVIP"
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">VVIP</span>
              </button>
            )}

            {lastUpdated && (
              <span className="hidden text-xs text-muted-foreground lg:block">
                {lastUpdated.toLocaleTimeString("th-TH")}
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

        {/* Mobile search */}
        <div className="mx-auto max-w-7xl px-4 pb-3 sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </header>

      {/* Announcement Banner */}
      {showAnnouncement && (
        <div className="border-b border-border bg-primary/5">
          <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary shrink-0" />
            {editingAnnouncement ? (
              <input
                autoFocus
                type="text"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                onBlur={() => { setEditingAnnouncement(false); localStorage.setItem(ANNOUNCEMENT_KEY, announcement); }}
                onKeyDown={(e) => { if (e.key === "Enter") { setEditingAnnouncement(false); localStorage.setItem(ANNOUNCEMENT_KEY, announcement); } }}
                className="flex-1 bg-transparent text-sm text-foreground border-b border-primary/30 focus:outline-none focus:border-primary py-0.5"
              />
            ) : (
              <div
                className="flex-1 overflow-hidden cursor-pointer"
                onClick={() => setEditingAnnouncement(true)}
                title="คลิกเพื่อแก้ไขข้อความ"
              >
                <p className="text-sm text-foreground whitespace-nowrap overflow-x-auto scrollbar-none">
                  {announcement}
                </p>
              </div>
            )}
            <button onClick={() => setShowAnnouncement(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-5">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
            {error}
          </div>
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
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
                canSeeVVIP={canSeeVVIP}
              />
            ))}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          สินค้าทั้งหมด {products.length} รายการ
        </p>
      </main>

      <ProductDetail
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        canSeeVVIP={canSeeVVIP}
      />

      <VVIPLoginDialog
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={login}
        loading={authLoading}
        error={authError}
      />
    </div>
  );
};

export default Index;
