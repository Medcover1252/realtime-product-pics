import { useMemo } from "react";
import type { Product } from "@/hooks/useGoogleSheet";

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

interface Props {
  products: Product[];
  activeFilters: Record<FilterKey, string>;
  onFilterChange: (key: FilterKey, value: string) => void;
}

const CategoryFilter = ({ products, activeFilters, onFilterChange }: Props) => {
  const options = useMemo(() => {
    const result: Record<FilterKey, string[]> = { brand: [], category: [], serie: [] };
    for (const f of FILTERS) {
      const vals = new Set(products.map((p) => p[f.key]).filter(Boolean));
      result[f.key] = Array.from(vals).sort();
    }
    return result;
  }, [products]);

  return (
    <div className="space-y-3">
      {FILTERS.map((f) => {
        const vals = options[f.key];
        if (vals.length < 2) return null;
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
              {vals.map((v) => (
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
          </div>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
export type { FilterKey };
