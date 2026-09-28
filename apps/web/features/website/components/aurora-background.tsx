"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@workspace/ui/lib/utils";

const orbs = [
  {
    className: "left-[-12%] top-[-30%] size-[36rem] bg-primary/25",
    duration: 18,
  },
  {
    className: "right-[-12%] top-[5%] size-[30rem] bg-chart-2/20",
    duration: 22,
  },
  {
    className: "left-[25%] bottom-[-35%] size-[32rem] bg-chart-3/20",
    duration: 26,
  },
];

export function AuroraBackground({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className
      )}
    >
      {orbs.map((orb, index) =>
        reduce ? (
          <div
            key={orb.className}
            className={cn(
              "absolute rounded-full blur-3xl will-change-transform",
              orb.className
            )}
          />
        ) : (
          <motion.div
            key={orb.className}
            className={cn(
              "absolute rounded-full blur-3xl will-change-transform",
              orb.className
            )}
            animate={{
              x: [0, 28, -18, 0],
              y: [0, -22, 18, 0],
              scale: [1, 1.08, 0.95, 1],
            }}
            transition={{
              duration: orb.duration + index * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )
      )}
    </div>
  );
}
