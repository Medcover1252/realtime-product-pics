import { useState } from "react";

interface Props {
  onSubmit: (url: string) => void;
}

const SheetConfig = ({ onSubmit }: Props) => {
  const [url, setUrl] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6 rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            📦 แคตตาล็อกสินค้า
          </h1>
          <p className="text-muted-foreground text-sm">
            วาง URL ของ Google Sheet เพื่อเริ่มแสดงสินค้า
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="https://docs.google.com/spreadsheets/d/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => url.trim() && onSubmit(url.trim())}
            disabled={!url.trim()}
            className="w-full rounded-lg bg-primary px-4 py-3 font-heading font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            เชื่อมต่อ
          </button>
        </div>

        <div className="rounded-lg bg-accent p-4 text-xs text-accent-foreground space-y-1">
          <p className="font-semibold">📋 โครงสร้าง Sheet ที่รองรับ:</p>
          <p>คอลัมน์: <strong>ชื่อ, ราคา, รูป, รายละเอียด, หมวดหมู่</strong></p>
          <p>⚠️ ต้องเปิดแชร์ Sheet เป็น "ทุกคนที่มีลิงก์"</p>
        </div>
      </div>
    </div>
  );
};

export default SheetConfig;
