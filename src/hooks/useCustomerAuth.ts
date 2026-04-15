import { useState, useCallback } from "react";

export interface CustomerSession {
  id: string;
  status: string;
  phone: string;
}

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1xxLM6xXxMx_HLCfZWmxRXHImMpIiphjRWguXqDgPgrM/export?format=csv&gid=1492333095";

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else current += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") { row.push(current.trim()); current = ""; }
      else if (ch === "\n" || (ch === "\r" && text[i + 1] === "\n")) {
        row.push(current.trim()); current = "";
        if (ch === "\r") i++;
        rows.push(row); row = [];
      } else current += ch;
    }
  }
  if (current || row.length) { row.push(current.trim()); rows.push(row); }
  return rows;
}

const SESSION_KEY = "vvip_session";

function loadSession(): CustomerSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function useCustomerAuth() {
  const [session, setSession] = useState<CustomerSession | null>(loadSession);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (id: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(SHEET_URL);
      if (!res.ok) throw new Error("ไม่สามารถเชื่อมต่อได้");
      const text = await res.text();
      const rows = parseCsv(text);
      // Columns: ลำดับ, ID, PASSWORD, Phone Number, Status
      const match = rows.slice(1).find(
        (r) => r[1]?.trim() === id.trim() && r[2]?.trim() === password.trim()
      );
      if (!match) {
        setError("ID หรือรหัสผ่านไม่ถูกต้อง");
        return false;
      }
      const customer: CustomerSession = {
        id: match[1]?.trim() || "",
        status: match[4]?.trim() || "",
        phone: match[3]?.trim() || "",
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(customer));
      setSession(customer);
      return true;
    } catch {
      setError("ไม่สามารถเชื่อมต่อกับระบบได้ กรุณาลองใหม่");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  const isAdmin = session?.status === "ผู้ดูแล";
  const canSeeVVIP = session?.status === "ผู้เข้าถึงทั้งหมด" || isAdmin;

  return { session, login, logout, loading, error, canSeeVVIP, isAdmin };
}
