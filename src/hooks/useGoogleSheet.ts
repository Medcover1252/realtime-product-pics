import { useState, useEffect, useCallback } from "react";

export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  category: string;
}

const REFRESH_INTERVAL = 30_000;

function buildCsvUrl(url: string): string {
  // Published URL: /d/e/2PACX-.../pubhtml → use pub?output=csv
  if (url.includes("/pubhtml")) {
    return url.replace(/\/pubhtml.*$/, "/pub?output=csv&gid=0");
  }
  if (url.includes("/pub")) {
    return url.replace(/\/pub.*$/, "/pub?output=csv&gid=0");
  }
  // Edit URL: /d/SHEET_ID/... → use export?format=csv
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match) {
    return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv&gid=0`;
  }
  // Fallback: treat as raw ID
  return `https://docs.google.com/spreadsheets/d/${url}/export?format=csv&gid=0`;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(current.trim());
        current = "";
      } else if (ch === "\n" || (ch === "\r" && text[i + 1] === "\n")) {
        row.push(current.trim());
        current = "";
        if (ch === "\r") i++;
        rows.push(row);
        row = [];
      } else {
        current += ch;
      }
    }
  }
  if (current || row.length) {
    row.push(current.trim());
    rows.push(row);
  }
  return rows;
}

export function useGoogleSheet(sheetUrl: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const csvUrl = buildCsvUrl(sheetUrl);
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const rows = parseCsv(text);

      if (rows.length < 2) {
        setProducts([]);
        setLastUpdated(new Date());
        setError(null);
        setLoading(false);
        return;
      }

      // Map header row to indices
      const headers = rows[0].map((h) => h.toLowerCase().trim());
      const colMap: Record<string, number> = {};
      headers.forEach((h, i) => { colMap[h] = i; });

      const nameIdx = colMap["ชื่อ"] ?? colMap["ชื่อสินค้า"] ?? colMap["name"] ?? 0;
      const priceIdx = colMap["ราคา"] ?? colMap["price"] ?? 1;
      const imageIdx = colMap["รูป"] ?? colMap["รูปภาพ"] ?? colMap["image"] ?? 2;
      const descIdx = colMap["รายละเอียด"] ?? colMap["description"] ?? 3;
      const catIdx = colMap["หมวดหมู่"] ?? colMap["category"] ?? 4;

      const items: Product[] = rows.slice(1).map((row, i) => ({
        id: String(i),
        name: row[nameIdx] || "",
        price: row[priceIdx] || "",
        image: row[imageIdx] || "",
        description: row[descIdx] || "",
        category: row[catIdx] || "",
      })).filter((p) => p.name);

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
