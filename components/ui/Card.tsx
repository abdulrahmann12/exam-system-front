"use client";

import { type ReactNode, type HTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface CardProps extends HTMLMotionProps<"div"> {
  padding?: "none" | "sm" | "md" | "lg";
  /** Disable hover lift animation */
  noHover?: boolean;
  children?: ReactNode;
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({ className = "", padding = "md", noHover, children, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={noHover ? undefined : { y: -2, boxShadow: "0 8px 25px -5px rgba(0,0,0,0.1)" }}
      transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
      className={`rounded-xl border border-border bg-card text-card-foreground shadow-sm ${paddingMap[padding]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-lg font-semibold text-card-foreground ${className}`} {...props}>
      {children}
    </h3>
  );
}
