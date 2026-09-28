"use client";

import { useState } from "react";

import { ArrowUp } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";

import { Button } from "@workspace/ui/components/button";

export function BackToTop() {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    setShow(value > 600);
  });

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-e-6 bottom-6 z-40"
        >
          <Button
            size="icon-lg"
            aria-label="Back to top"
            className="size-11 rounded-full shadow-lg"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <ArrowUp aria-hidden="true" />
          </Button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
