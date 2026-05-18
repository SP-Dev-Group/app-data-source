import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function Menu() {
  const navigate = useNavigate();

  const handleLogout = () => {
    base44.auth.logout("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 gap-4 relative">
      <div className="absolute top-0 left-0 right-0 h-[15px] bg-black flex items-center">
        <div className="h-full w-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-30"></div>
      </div>
      <div className="absolute top-4 left-6">
        <div className="bg-black rounded-lg px-4 py-2">
          <span className="text-blue-400 font-medium">Data Master</span>
        </div>
      </div>
      <div className="absolute top-4 right-6">
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
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
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <Button variant="outline" className="w-full" onClick={() => navigate("/datamasterdaily")}>
          Data Master Daily
        </Button>
        <Button variant="outline" className="w-full" onClick={() => navigate("/datamasterlistener")}>
          Data Master Listener
        </Button>
        <Button variant="outline" className="w-full" onClick={() => navigate("/datasourcelistener2")}>
          Data Source Listener 2
        </Button>
      </motion.div>
    </div>
  );
}