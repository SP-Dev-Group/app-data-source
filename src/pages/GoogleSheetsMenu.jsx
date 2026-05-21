import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function GoogleSheetsMenu() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 gap-4 relative">
      <div className="absolute top-8 left-6">
        <Button variant="ghost" onClick={() => navigate("/googlemenu")} className="flex items-center gap-2">
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
        Google Sheets Menu
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate("/googlesheetsmanualsheetid")}>
          Manual Entry Sheet ID URL
        </Button>
        <Button className="w-full bg-green-700 hover:bg-green-800 text-white" onClick={() => navigate("/googlesheetshardcodeid")}>
          Hard-coded Sheet ID
        </Button>
      </motion.div>
    </div>
  );
}