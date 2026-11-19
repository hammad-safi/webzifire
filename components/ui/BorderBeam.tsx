"use client";

import React from "react";

interface BorderBeamProps {
  className?: string;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
}

export default function BorderBeam({
  className = "",
  duration = 7,
  colorFrom = "#FF4D4D",
  colorTo = "#ffb3ae",
}: BorderBeamProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 rounded-[inherit] p-[1.5px] overflow-hidden z-20 ${className}`}
      style={{
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        maskComposite: "exclude",
        WebkitMaskComposite: "xor",
      }}
    >
      <div
        className="absolute inset-[-100%] animate-[spin_7s_linear_infinite]"
        style={{
          animationDuration: `${duration}s`,
          background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, ${colorFrom} 330deg, ${colorTo} 360deg)`,
        }}
      />
    </div>
  );
}
