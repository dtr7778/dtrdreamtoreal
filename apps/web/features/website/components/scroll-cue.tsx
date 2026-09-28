"use client";

import { ChevronsDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export function ScrollCue() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 lg:block">
      {reduce ? (
        <ChevronsDown
          aria-hidden="true"
          className="size-5 text-muted-foreground"
        />
      ) : (
        <motion.div
          animate={{ y: [0, 6, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronsDown
            aria-hidden="true"
            className="size-5 text-muted-foreground"
          />
        </motion.div>
      )}
    </div>
  );
}
