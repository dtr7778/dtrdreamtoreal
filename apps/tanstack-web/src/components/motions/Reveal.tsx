import { EASE_ANIMATION } from "#/constants";
import { motion, useReducedMotion } from "motion/react";

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  hover?: boolean;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -6 } : undefined}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: EASE_ANIMATION, delay }}
    >
      {children}
    </motion.div>
  );
}
