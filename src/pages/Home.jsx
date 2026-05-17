import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import LoginModal from "@/components/LoginModal";

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 relative">
      <div className="absolute top-4 right-6">
        <Button variant="outline" onClick={() => setLoginOpen(true)}>Login</Button>
      </div>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground text-center"
      >
        App Data Master
      </motion.h1>
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}