"use client";

import type { ReactNode } from "react";

import { motion, useReducedMotion } from "motion/react";

export function Float({
  children,
  className,
  delay = 0,
  distance = 8,
  duration = 7,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  duration?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{ y: [0, -distance, 0] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
