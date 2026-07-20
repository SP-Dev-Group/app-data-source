import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PageMeta from "@/components/PageMeta";

export default function AzureMenu() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 gap-4 relative">
      <div className="absolute top-8 left-6">
        <Button variant="ghost" onClick={() => navigate("/menu")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="absolute top-8 right-6">
        <PageMeta
          page="AzureMenu.jsx"
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
        Azure Menu
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate("/azuresql")}>
          Azure SQL Database
        </Button>
        <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" onClick={() => navigate("/azurecosmosdb")}>
          Cosmos DB
        </Button>
        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={() => navigate("/azureblobstorage")}>
          Blob Storage
        </Button>
        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" onClick={() => navigate("/azurefunctions")}>
          Azure Functions
        </Button>
      </motion.div>
    </div>
  );
}