import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SecurityAlerts from "@/components/SecurityAlerts";
import PageMeta from "@/components/PageMeta";

export default function GoogleMenu() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 gap-4 relative">
      <div className="absolute top-8 left-6">
        <Button variant="ghost" onClick={() => navigate("/menu")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-light tracking-tight text-foreground mb-6"
      >
        Google Menu
      </motion.h1>
      <div className="absolute top-8 right-6">
        <PageMeta
          page="GoogleMenu.jsx"
          functions={[]}
          automations={[]}
          entities={[
            { name: "SecurityAlert", type: "base44" }
          ]}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="w-full max-w-sm mb-2"
      >
        <SecurityAlerts service="Firebase" compact />
      </motion.div>

    </div>
  );
}