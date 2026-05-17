import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Menu() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 gap-4">
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
        <Button variant="outline" className="w-full" onClick={() => navigate("/datamaster")}>
          Data Master
        </Button>
        <Button variant="outline" className="w-full" onClick={() => navigate("/datamasterlistener")}>
          Data Master Listener
        </Button>
      </motion.div>
    </div>
  );
}