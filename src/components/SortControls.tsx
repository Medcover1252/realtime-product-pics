import { ArrowUpDown } from "lucide-react";

export type SortOption = "" | "price-asc" | "price-desc" | "qty-desc" | "qty-asc";

interface Props {
  value: SortOption;
  onChange: (v: SortOption) => void;
}

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: "", label: "เรียงปกติ" },
  { value: "price-asc", label: "ราคา ↑" },
  { value: "price-desc", label: "ราคา ↓" },
  { value: "qty-desc", label: "จำนวน ↓" },
  { value: "qty-asc", label: "จำนวน ↑" },
];

const SortControls = ({ value, onChange }: Props) => (
  <div className="flex items-center gap-1.5 flex-wrap">
    <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
    {OPTIONS.map((o) => (
      <button
        key={o.value}
        onClick={() => onChange(o.value)}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          value === o.value
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-secondary text-secondary-foreground hover:bg-accent"
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

export default SortControls;
