"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/**
 * Wraps page content with a Framer Motion crossfade + slide.
 * Uses pathname as the animation key so it re-triggers on route changes.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      variants={pageVariants}
      initial="hidden"
      animate="enter"
      exit="exit"
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
