"use client";

import React, { memo, useState } from "react";

export const TagButton = memo(
  ({
    children,
    onClick,
    className = "",
  }: {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
  }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <span
        onClick={onClick}
        className={`
        border-2 border-black bg-white text-black
        rounded-lg px-4 py-1.5 
        text-center text-[11px] font-black uppercase tracking-wider
        overflow-hidden text-ellipsis whitespace-nowrap 
        transition-all duration-200 cursor-pointer 
        hover:bg-black hover:text-white hover:-translate-y-0.5
        active:translate-y-0
        ${className}
      `}
      >
        {children}
      </span>
    );
  }
);
TagButton.displayName = "TagButton";
