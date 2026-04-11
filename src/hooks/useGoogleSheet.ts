import { useState, useEffect, useCallback } from "react";

export interface Product {
  id: string;
  barcode: string;
  barcodeBox: string;
  brand: string;
  category: string;
  serie: string;
  nickname: string;
  combined: string;
  image: string;
  imageUrl: string;
  expiryDate: string;
  boxCount: string;
  imageCol: string;
  price: string;
}

const REFRESH_INTERVAL = 30_000;

function buildCsvUrl(url: string): string {
  if (url.includes("/pubhtml")) {
    return url.replace(/\/pubhtml.*$/, "/pub?output=csv&gid=1123294632");
  }
  if (url.includes("/pub")) {
    return url.replace(/\/pub.*$/, "/pub?output=csv&gid=1123294632");
  }
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match) {
    return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv&gid=1123294632`;
  }
  return `https://docs.google.com/spreadsheets/d/${url}/export?format=csv&gid=1123294632`;
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

      // Headers: บาร์โค้ด,บาร์โค้ดกล่อง,Brand,หมวด,Serie รุ่น,ชื่อเรียก,รวม,รูป,URL ของรูป,วันหมดอายุ,จำนวนลัง,Image,ราคา
      const items: Product[] = rows.slice(1).map((row, i) => ({
        id: String(i),
        barcode: row[0] || "",
        barcodeBox: row[1] || "",
        brand: row[2] || "",
        category: row[3] || "",
        serie: row[4] || "",
        nickname: row[5] || "",
        combined: row[6] || "",
        image: row[7] || "",
        imageUrl: row[8] || "",
        expiryDate: row[9] || "",
        boxCount: row[10] || "",
        imageCol: row[11] || "",
        price: row[12] || "",
      })).filter((p) => p.barcode || p.combined);

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
