import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogIn, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onLogin: (id: string, password: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

const VVIPLoginDialog = ({ open, onClose, onLogin, loading, error }: Props) => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onLogin(id, password);
    if (ok) {
      setId("");
      setPassword("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <LogIn className="h-5 w-5 text-primary" />
            เข้าสู่ระบบ VVIP
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-foreground">ID</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="กรอก ID ของคุณ"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="กรอกรหัสผ่าน"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            เข้าสู่ระบบ
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VVIPLoginDialog;
