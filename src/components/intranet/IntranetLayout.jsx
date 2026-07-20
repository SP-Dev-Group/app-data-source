import { useState } from "react";
import { Outlet } from "react-router-dom";
import IntranetTopBar from "./IntranetTopBar";
import IntranetSidebar from "./IntranetSidebar";

export default function IntranetLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <IntranetTopBar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className="flex flex-1 min-h-0">
        {sidebarOpen && <IntranetSidebar />}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}