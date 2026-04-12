import { useMemo, useState } from "react";
import type { Product } from "@/hooks/useGoogleSheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp } from "lucide-react";

type FilterKey = "brand" | "category" | "serie";

interface FilterDef {
  key: FilterKey;
  label: string;
}

const FILTERS: FilterDef[] = [
  { key: "brand", label: "Brand" },
  { key: "category", label: "หมวด" },
  { key: "serie", label: "Serie" },
];

const COLLAPSED_LIMIT = 6;

interface Props {
  products: Product[];
  activeFilters: Record<FilterKey, string>;
  onFilterChange: (key: FilterKey, value: string) => void;
}

const CategoryFilter = ({ products, activeFilters, onFilterChange }: Props) => {
  const [expanded, setExpanded] = useState<Record<FilterKey, boolean>>({
    brand: false,
    category: false,
    serie: false,
  });

  const options = useMemo(() => {
    const result: Record<FilterKey, string[]> = { brand: [], category: [], serie: [] };
    for (const f of FILTERS) {
      const vals = new Set(products.map((p) => p[f.key]).filter(Boolean));
      result[f.key] = Array.from(vals).sort();
    }
    return result;
  }, [products]);

  return (
    <ScrollArea className="max-h-[60vh]">
      <div className="space-y-3 pr-2">
        {FILTERS.map((f) => {
          const vals = options[f.key];
          if (vals.length < 2) return null;
          const isExpanded = expanded[f.key];
          const showToggle = vals.length > COLLAPSED_LIMIT;
          const displayVals = showToggle && !isExpanded ? vals.slice(0, COLLAPSED_LIMIT) : vals;

          return (
            <div key={f.key}>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">{f.label}</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => onFilterChange(f.key, "")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeFilters[f.key] === ""
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  ทั้งหมด
                </button>
                {displayVals.map((v) => (
                  <button
                    key={v}
                    onClick={() => onFilterChange(f.key, v)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      activeFilters[f.key] === v
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-accent"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              {showToggle && (
                <button
                  onClick={() => setExpanded((prev) => ({ ...prev, [f.key]: !isExpanded }))}
                  className="mt-1 flex items-center gap-0.5 text-xs text-primary hover:underline"
                >
                  {isExpanded ? (
                    <>ย่อ <ChevronUp className="h-3 w-3" /></>
                  ) : (
                    <>เพิ่มเติม ({vals.length - COLLAPSED_LIMIT}) <ChevronDown className="h-3 w-3" /></>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default CategoryFilter;
export type { FilterKey };
