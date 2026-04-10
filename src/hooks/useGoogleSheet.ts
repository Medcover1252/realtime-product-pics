import { useState, useEffect, useCallback } from "react";

export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  category: string;
}

const REFRESH_INTERVAL = 30_000; // 30 seconds

export function useGoogleSheet(sheetUrl: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const extractSheetId = (url: string): string | null => {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url; // fallback: treat as raw ID
  };

  const fetchData = useCallback(async () => {
    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      setError("ไม่สามารถอ่าน Sheet ID ได้");
      setLoading(false);
      return;
    }

    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
      const res = await fetch(csvUrl);
      const text = await res.text();

      // Google returns JSONP-like response, strip prefix/suffix
      const jsonText = text.replace(/^.*\(/, "").replace(/\);?$/, "");
      const json = JSON.parse(jsonText);

      const rows = json.table.rows as { c: ({ v: string | number | null } | null)[] }[];
      const cols = json.table.cols as { label: string }[];

      // Map column labels to indices
      const colMap: Record<string, number> = {};
      cols.forEach((col, i) => {
        const label = (col.label || "").trim().toLowerCase();
        colMap[label] = i;
      });

      // Support Thai or English column names
      const nameIdx = colMap["ชื่อ"] ?? colMap["ชื่อสินค้า"] ?? colMap["name"] ?? 0;
      const priceIdx = colMap["ราคา"] ?? colMap["price"] ?? 1;
      const imageIdx = colMap["รูป"] ?? colMap["รูปภาพ"] ?? colMap["image"] ?? 2;
      const descIdx = colMap["รายละเอียด"] ?? colMap["description"] ?? 3;
      const catIdx = colMap["หมวดหมู่"] ?? colMap["category"] ?? 4;

      const items: Product[] = rows.map((row, i) => {
        const cell = (idx: number) => {
          const c = row.c?.[idx];
          return c?.v != null ? String(c.v) : "";
        };
        return {
          id: String(i),
          name: cell(nameIdx),
          price: cell(priceIdx),
          image: cell(imageIdx),
          description: cell(descIdx),
          category: cell(catIdx),
        };
      }).filter((p) => p.name); // skip empty rows

      setProducts(items);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError("ไม่สามารถโหลดข้อมูลจาก Google Sheet ได้ — ตรวจสอบว่า Sheet เปิดเป็นสาธารณะแล้ว");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [sheetUrl]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { products, loading, error, lastUpdated, refresh: fetchData };
}
