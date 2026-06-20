import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import PageMeta from "@/components/PageMeta";

export default function Menu() {
  const navigate = useNavigate();

  const handleLogout = () => {
    base44.auth.logout("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 gap-4 relative">
      <div className="absolute top-0 left-0 right-0 h-[15px] bg-black flex items-center">
        <div className="h-full w-full bg-blue-400"></div>
      </div>
      <div className="absolute top-8 left-6">
        <div className="bg-black rounded-lg px-4 py-2">
          <span className="text-blue-400 font-medium">Data Master</span>
        </div>
      </div>
      <div className="absolute top-8 right-6 flex flex-col gap-2">
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
        <PageMeta
          page="Menu.jsx"
          functions={[]}
          automations={[]}
          entities={[]}
        />
      </div>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-light tracking-tight text-foreground mb-6"
      >
        Menu
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col gap-4 w-full max-w-md"
      >
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            <Button className="w-full bg-violet-500 hover:bg-violet-600 text-white" onClick={() => navigate("/sourcerecordstoreplicateemplate")}>
              Source Records to Replica Template
            </Button>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={() => navigate("/datasourcetoreplicasandallocators")}>
              Source to Replica Allocator Internal
            </Button>
            <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white" onClick={() => navigate("/datasourcetoreplicasandallocatorsexternal")}>
              Source to Replica & Source Records to Replica
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            <Button className="w-full bg-red-500 hover:bg-red-600 text-white" onClick={() => navigate("/googlemenu")}>
              Google Menu
            </Button>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate("/azuremenu")}>
              Azure Menu
            </Button>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate("/base44menu")}>
              Base44 Menu
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}