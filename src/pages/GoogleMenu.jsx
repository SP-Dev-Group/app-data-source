import { motion } from "framer-motion";
import PageMeta from "@/components/PageMeta";
import SecurityAlerts from "@/components/SecurityAlerts";

export default function GoogleMenu() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 gap-4 relative">
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