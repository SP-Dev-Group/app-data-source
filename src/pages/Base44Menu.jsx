import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PageMeta from "@/components/PageMeta";

export default function Base44Menu() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 gap-4 relative">
      <div className="absolute top-0 left-0 right-0 h-[15px] bg-black flex items-center">
        <div className="h-full w-full bg-indigo-600"></div>
      </div>
      <div className="absolute top-8 left-6">
        <Button variant="ghost" onClick={() => navigate("/menu")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="absolute top-8 right-6">
        <PageMeta
          page="Base44Menu.jsx"
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
        Base44 Menu
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={() => navigate("/datasourcemanual")}>
          Data Source Manual
        </Button>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate("/datasourcedaily")}>
          Data Source Daily at 2am
        </Button>
        <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate("/datasourcerefresh5min")}>
          Data Source Refresh every 5 mins
        </Button>
        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" onClick={() => navigate("/datasourcelistener")}>
          Data Source Listener
        </Button>
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => navigate("/base44entities")}>
          Entities
        </Button>
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => navigate("/base44functions")}>
          Backend Functions
        </Button>
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => navigate("/base44automations")}>
          Automations
        </Button>
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => navigate("/base44agents")}>
          AI Agents
        </Button>
        <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white" onClick={() => navigate("/staffallocation")}>
          Staff Allocation Manager
        </Button>
        <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white" onClick={() => navigate("/pushentityonly")}>
          Push Entity Only
        </Button>
      </motion.div>
    </div>
  );
}