import { useState, useMemo, useCallback } from "react";
import { useGoogleSheet, type Product } from "@/hooks/useGoogleSheet";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import ProductCard from "@/components/ProductCard";
import ProductDetail from "@/components/ProductDetail";
import CartDrawer from "@/components/CartDrawer";
import OrderSummary from "@/components/OrderSummary";
import CategoryFilter, { type FilterKey } from "@/components/CategoryFilter";
import SortControls, { type SortOption } from "@/components/SortControls";
import VVIPLoginDialog from "@/components/VVIPLoginDialog";
import { RefreshCw, Search, SlidersHorizontal, Megaphone, X, LogIn, LogOut, Crown, ArrowDownCircle, ShoppingCart } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS8ZAxsN3ZCSa2VxpmMNpCPDjEubNVYJKkier6mZ_3NYnOr-of5F3HqDBgOXAL3XbzDE9T4yWv4pk0c/pubhtml";

const DEFAULT_ANNOUNCEMENT = "ยินดีต้อนรับสู่ร้านค้าของเรา! 🎉 สินค้าใหม่อัปเดตทุกวัน";
const ANNOUNCEMENT_KEY = "shop_announcement";


const Index = () => {
  const { products, loading, error, lastUpdated, refresh } = useGoogleSheet(SHEET_URL);
  const { session, login, logout, loading: authLoading, error: authError, canSeeVVIP, isAdmin } = useCustomerAuth();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const cart = useCart();
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
  const [sort, setSort] = useState<SortOption>("");
  const [showCart, setShowCart] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [activeTab, setActiveTab] = useState<"available" | "outofstock">("available");

  const handlePullRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const { containerRef, pullDistance, refreshing: pullRefreshing, threshold: pullThreshold } = usePullToRefresh({
    onRefresh: handlePullRefresh,
  });

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  const filtered = useMemo(() => {
    const list = products.filter((p) => {
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
    if (sort === "price-asc") list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    else if (sort === "price-desc") list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    else if (sort === "qty-desc") list.sort((a, b) => (Number(b.quantity) || 0) - (Number(a.quantity) || 0));
    else if (sort === "qty-asc") list.sort((a, b) => (Number(a.quantity) || 0) - (Number(b.quantity) || 0));
    // Sort favorites to top
    list.sort((a, b) => {
      const aFav = favorites.has(a.id) ? 1 : 0;
      const bFav = favorites.has(b.id) ? 1 : 0;
      return bFav - aFav;
    });
    return list;
  }, [products, activeFilters, search, sort, favorites]);

  const availableProducts = useMemo(() => filtered.filter((p) => Number(p.quantity) > 0), [filtered]);
  const outOfStockProducts = useMemo(() => filtered.filter((p) => !p.quantity || Number(p.quantity) === 0), [filtered]);
  const displayProducts = activeTab === "available" ? availableProducts : outOfStockProducts;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleFilterChange = (key: FilterKey, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      {/* Pull-to-refresh indicator (mobile) */}
      {(pullDistance > 0 || pullRefreshing) && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all duration-200 sm:hidden"
          style={{ height: pullRefreshing ? 48 : pullDistance * 0.6 }}
        >
          <div className={`flex items-center gap-2 text-sm text-primary ${pullRefreshing ? "animate-pulse" : ""}`}>
            <ArrowDownCircle
              className={`h-5 w-5 transition-transform duration-200 ${pullDistance >= pullThreshold ? "rotate-180" : ""} ${pullRefreshing ? "animate-spin" : ""}`}
            />
            <span>{pullRefreshing ? "กำลังโหลด..." : pullDistance >= pullThreshold ? "ปล่อยเพื่อรีเฟรช" : "ดึงลงเพื่อรีเฟรช"}</span>
          </div>
        </div>
      )}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 backdrop-blur-md shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <h1 className="text-xl font-bold text-white sm:text-2xl tracking-tight">
            ✨ รายการสินค้า
          </h1>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาสินค้า..แบรนด์/ประเภทได้เล๊ยย.."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-80 lg:w-64 rounded-lg border border-white/15 bg-white/10 pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Filter popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative rounded-lg border border-white/15 p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
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

            {/* Cart button in header */}
            <button
              onClick={() => setShowCart(true)}
              className="relative rounded-lg border border-white/15 p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              title="ตะกร้าสินค้า"
            >
              <ShoppingCart className="h-4 w-4" />
              {cart.items.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {cart.items.length}
                </span>
              )}
            </button>

            {/* VVIP Login */}
            {session ? (
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-400">
                  <Crown className="h-4 w-4" />
                  <span className="hidden sm:inline">{session.id}</span>
                  <span className="sm:hidden">VVIP</span>
                </span>
                <button
                  onClick={logout}
                  className="rounded-lg border border-white/15 p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                  title="ออกจากระบบ"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/15 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/25"
                title="เข้าสู่ระบบ"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">เข้าสู่ระบบ</span>
              </button>
            )}

            {lastUpdated && (
              <span className="hidden text-xs text-gray-400 lg:block">
                {lastUpdated.toLocaleTimeString("th-TH")}
              </span>
            )}
            <button
              onClick={handleRefresh}
              className="rounded-lg border border-white/15 p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              title="รีเฟรช"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="mx-auto max-w-7xl px-4 pb-3 sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาสินค้า..แบรนด์/ประเภทได้เล๊ยย.."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-white/10 pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
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
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "available" | "outofstock")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="available" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">รายการสินค้า Updated</TabsTrigger>
            <TabsTrigger value="outofstock" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">สินค้าหมด</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Sort controls */}
        <SortControls value={sort} onChange={setSort} />
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
        ) : displayProducts.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            {activeTab === "available" ? "ไม่พบสินค้า" : "ไม่มีสินค้าหมด"}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
                canSeeVVIP={canSeeVVIP}
                isAdmin={isAdmin}
                isFavorite={isFavorite(product.id)}
                onToggleFavorite={toggleFavorite}
                onAddToCart={() => cart.addItem(product)}
              />
            ))}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          สินค้าทั้งหมด {displayProducts.length} รายการ
          {activeTab === "outofstock" && " (สินค้าหมด)"}
        </p>
      </main>

      <ProductDetail
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        canSeeVVIP={canSeeVVIP}
      />

      <CartDrawer
        open={showCart}
        onClose={() => setShowCart(false)}
        items={cart.items}
        customerName={cart.customerName}
        onCustomerNameChange={cart.setCustomerName}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeItem}
        totalAmount={cart.totalAmount}
        onGenerateOrder={() => {
          setShowCart(false);
          setShowOrder(true);
        }}
        canSeeVVIP={canSeeVVIP}
        useVVIPPrice={cart.useVVIPPrice}
        onToggleVVIPPrice={cart.setUseVVIPPrice}
        customPrices={cart.customPrices}
        onUpdateCustomPrice={cart.updateCustomPrice}
        onClearCustomPrice={cart.clearCustomPrice}
        getItemPrice={cart.getItemPrice}
      />

      <OrderSummary
        open={showOrder}
        onClose={() => setShowOrder(false)}
        items={cart.items}
        customerName={cart.customerName}
        totalAmount={cart.totalAmount}
        onClearCart={cart.clearCart}
        getItemPrice={cart.getItemPrice}
      />

      <VVIPLoginDialog
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={login}
        loading={authLoading}
        error={authError}
      />

      {/* Floating cart button */}
      {cart.items.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-xl px-4 py-3 hover:bg-primary/90 active:scale-95 transition-all"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="text-sm font-bold">{cart.items.length} รายการ</span>
        </button>
      )}
    </div>
  );
};

export default Index;