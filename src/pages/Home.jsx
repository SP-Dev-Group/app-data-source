import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground text-center"
      >
        App to App Data
      </motion.h1>
    </div>
  );
}