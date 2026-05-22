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
      <div className="absolute top-0 left-0 right-0 h-[15px] bg-black flex items-center">
        <div className="h-full w-full bg-red-500"></div>
      </div>
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

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <Button className="w-full bg-red-500 hover:bg-red-600 text-white" onClick={() => navigate("/googleformtemplate")}>
          Google Form Template
        </Button>
        <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate("/googlesheetsMenu")}>
          Google Sheets
        </Button>
        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate("/googlefirebase")}>
          Firebase / Firestore
        </Button>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate("/googlesql")}>
          Google Cloud SQL / BigQuery
        </Button>
      </motion.div>
    </div>
  );
}