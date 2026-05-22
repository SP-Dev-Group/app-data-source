import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Image, Music, Video } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const TABS = [
  { id: "images", label: "Images", icon: Image },
  { id: "audio",  label: "Audio",  icon: Music },
  { id: "video",  label: "Video",  icon: Video },
];

export default function GoogleObjectStorage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("images");

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <div className="absolute top-0 left-0 right-0 h-[15px] bg-black">
        <div className="h-full w-full bg-purple-500"></div>
      </div>
      <div className="absolute top-8 left-6">
        <Button variant="ghost" onClick={() => navigate("/googlemenu")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Google Menu
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 px-6 py-12 overflow-y-auto">
          <div className="max-w-3xl mx-auto pt-12">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-light tracking-tight text-foreground mb-8 text-center"
            >
              Object Storage
            </motion.h1>

            {/* Tabs */}
            <div className="flex border-b border-border mb-6">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                      isActive
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-card border rounded-lg p-8 text-center text-muted-foreground"
            >
              <p className="text-sm">No {activeTab} yet. Upload functionality coming soon.</p>
            </motion.div>
          </div>
        </div>

        <div className="w-56 border-l border-border bg-muted/20 p-4 flex flex-col gap-2 overflow-y-auto">
          <PageMeta
            page="GoogleObjectStorage.jsx"
            functions={[]}
            automations={[]}
            entities={[]}
          />
        </div>
      </div>
    </div>
  );
}