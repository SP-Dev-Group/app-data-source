import { motion } from "framer-motion";
import PageMeta from "@/components/PageMeta";

export default function GoogleSheetsMenu() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 gap-4 relative">
      <div className="absolute top-8 right-6 flex flex-col gap-2">
        <PageMeta
          page="GoogleSheetsMenu.jsx"
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
        Google Sheets Menu
      </motion.h1>
    </div>
  );
}