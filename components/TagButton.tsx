"use client";

import { useState } from "react";

export const TagButton = ({ 
  children, 
  onClick, 
  className = "" 
}: { 
  children: React.ReactNode; 
  onClick?: (e: React.MouseEvent) => void; 
  className?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`border border-black rounded-full px-4 py-2 text-center text-sm overflow-hidden text-ellipsis whitespace-nowrap transition-colors cursor-pointer tag tracking-tight ${className}`}
      style={{
        backgroundColor: isHovered ? "black" : "white",
        color: isHovered ? "white" : "black",
      }}
    >
      {children}
    </span>
  );
};
