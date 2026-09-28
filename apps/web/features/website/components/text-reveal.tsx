"use client";

import type { ElementType, ReactNode } from "react";

import { motion, useReducedMotion, type Variants } from "motion/react";

import { cn } from "@workspace/ui/lib/utils";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type RevealBy = "char" | "word" | "line";

const motionTags = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  p: motion.p,
  span: motion.span,
  div: motion.div,
} as const;

type MotionTag = keyof typeof motionTags;

const unitVariants: Variants = {
  hidden: { opacity: 0, y: "0.6em" },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const lineVariants: Variants = {
  hidden: { y: "115%" },
  visible: { y: "0%", transition: { duration: 0.7, ease: EASE } },
};

function renderWords(text: string): ReactNode {
  return text.split(/(\s+)/).map((token, index) => {
    if (token.trim() === "") {
      return <span key={`space-${index}`}>{token}</span>;
    }
    return (
      <motion.span
        key={`word-${index}`}
        aria-hidden="true"
        variants={unitVariants}
        className="inline-block"
      >
        {token}
      </motion.span>
    );
  });
}

function renderChars(text: string): ReactNode {
  return text.split(/(\s+)/).map((token, index) => {
    if (token.trim() === "") {
      return <span key={`space-${index}`}>{token}</span>;
    }
    return (
      <span
        key={`word-${index}`}
        className="inline-block whitespace-nowrap"
        aria-hidden="true"
      >
        {Array.from(token).map((char, charIndex) => (
          <motion.span
            key={`char-${index}-${charIndex}`}
            variants={unitVariants}
            className="inline-block"
          >
            {char}
          </motion.span>
        ))}
      </span>
    );
  });
}

function renderLines(text: string): ReactNode {
  return text.split("\n").map((line, index) => (
    <span key={`line-${index}`} className="block overflow-hidden pb-[0.1em]">
      <motion.span
        aria-hidden="true"
        variants={lineVariants}
        className="block will-change-transform"
      >
        {line === "" ? "\u00A0" : line}
      </motion.span>
    </span>
  ));
}

export function TextReveal({
  children,
  as = "p",
  by = "word",
  delay = 0,
  stagger,
  once = true,
  className,
}: {
  children: string;
  as?: MotionTag;
  by?: RevealBy;
  delay?: number;
  stagger?: number;
  once?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce || !children) {
    const StaticTag = as as ElementType;
    return <StaticTag className={className}>{children}</StaticTag>;
  }

  const MotionTag = motionTags[as];

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay,
        staggerChildren:
          stagger ?? (by === "char" ? 0.025 : by === "word" ? 0.06 : 0.1),
      },
    },
  };

  return (
    <MotionTag
      className={cn(className)}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-40px" }}
      aria-label={children}
    >
      {by === "line"
        ? renderLines(children)
        : by === "char"
          ? renderChars(children)
          : renderWords(children)}
    </MotionTag>
  );
}
