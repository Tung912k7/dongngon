import React, { memo } from "react";

interface GridBackgroundProps {
  opacity?: number;
  size?: number;
}

export const GridBackground = memo(function GridBackground({
  opacity = 0.1,
  size = 40,
}: GridBackgroundProps) {
  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        opacity,
      }}
      aria-hidden="true"
    />
  );
});

export default GridBackground;
