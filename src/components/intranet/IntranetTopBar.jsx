import { useState, useRef, useEffect } from "react";
import { Menu as MenuIcon, UserCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function IntranetTopBar({ onToggleSidebar }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => base44.auth.logout("/");

  return (
    <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-3 bg-blue-700 text-white border-b border-blue-800 shadow-sm">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="text-white hover:bg-blue-600 hover:text-white"
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
        <span className="font-semibold tracking-tight">Intranet</span>
      </div>

      <div className="relative" ref={ref}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen((o) => !o)}
          className="text-white hover:bg-blue-600 hover:text-white rounded-full"
        >
          <UserCircle className="h-6 w-6" />
        </Button>
        {open && (
          <div className="absolute right-0 mt-2 w-44 rounded-md border border-blue-100 bg-white shadow-lg overflow-hidden">
            <button
              onClick={handleLogout}
              className="flex items-center w-full gap-2 px-4 py-2.5 text-sm text-left text-slate-700 hover:bg-blue-50 hover:text-blue-700"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}