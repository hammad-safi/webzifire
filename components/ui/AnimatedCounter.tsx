"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });
  const [displayValue, setDisplayValue] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 90,
  });

  useEffect(() => {
    if (inView && !hasAnimated) {
      setDisplayValue(0);
      motionValue.set(0);
      const timer = setTimeout(() => {
        motionValue.set(value);
        setHasAnimated(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [inView, value, motionValue, hasAnimated]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (hasAnimated) {
        setDisplayValue(Math.round(latest));
      }
    });
    return () => unsubscribe();
  }, [springValue, hasAnimated]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
