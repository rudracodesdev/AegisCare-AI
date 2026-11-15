"use client";

import { motion } from "framer-motion";
import React from "react";

interface PopOutProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function PopOutElement({ children, delay = 0, className = "" }: PopOutProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.55,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}