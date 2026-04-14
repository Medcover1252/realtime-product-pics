import { ArrowUpDown, TrendingUp, TrendingDown, Package } from "lucide-react";

export type SortOption = "" | "price-asc" | "price-desc" | "qty-desc" | "qty-asc";

interface Props {
  value: SortOption;
  onChange: (v: SortOption) => void;
}

const OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: "", label: "ทั้งหมด", icon: <ArrowUpDown className="h-3.5 w-3.5" /> },
  { value: "price-asc", label: "ราคาต่ำ → สูง", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { value: "price-desc", label: "ราคาสูง → ต่ำ", icon: <TrendingDown className="h-3.5 w-3.5" /> },
  { value: "qty-desc", label: "จำนวนมาก → น้อย", icon: <Package className="h-3.5 w-3.5" /> },
  { value: "qty-asc", label: "จำนวนน้อย → มาก", icon: <Package className="h-3.5 w-3.5" /> },
];

const SortControls = ({ value, onChange }: Props) => (
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-xs font-semibold text-muted-foreground mr-0.5">เรียงตาม</span>
    {OPTIONS.map((o) => (
      <button
        key={o.value}
        onClick={() => onChange(o.value)}
        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
          value === o.value
            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.03]"
            : "bg-secondary text-secondary-foreground hover:bg-accent hover:shadow-sm"
        }`}
      >
        {o.icon}
        {o.label}
      </button>
    ))}
  </div>
);

export default SortControls;
