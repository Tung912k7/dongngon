"use client";

import Image from "next/image";
import { Lora } from "next/font/google";

const lora = Lora({
  subsets: ["latin", "vietnamese"],
  weight: "700",
  display: "swap",
});

/**
 * BrandHeader Component
 * 
 * Replaces the "Ô" letters with the brush logo while keeping the diacritical marks above.
 */
const BrandHeader = () => {
  return (
    <header className="relative w-full h-[200px] md:h-[300px] flex items-center justify-center bg-white">
      <h1
        className={`
          ${lora.className}
          flex items-center justify-center
          font-bold
          tracking-[0.05em]
          leading-none
          text-slate-900
          select-none
          whitespace-nowrap
        `}
        style={{
          fontSize: "clamp(2.5rem, 8vw, 9rem)"
        }}
      >
        {/* Đ */}
        <span>Đ</span>
        
        {/* Ồ - Logo with accent marks above */}
        <span className="relative inline-flex items-center justify-center mx-[-0.05em]">
          {/* The accent marks: ̂ and ̀ → combined as ̂̀ or just use the combining characters */}
          <span 
            className="absolute text-[0.5em] leading-none"
            style={{ top: "-0.1em" }}
          >
            ̂̀
          </span>
          {/* The logo replacing the O */}
          <Image
            src="/brush-stroke.png"
            alt="Ô"
            width={80}
            height={80}
            className="inline-block object-contain"
            style={{ 
              width: "0.85em", 
              height: "0.85em",
              marginTop: "0.1em"
            }}
          />
        </span>
        
        {/* NG NG */}
        <span>NG NG</span>
        
        {/* Ô - Logo with circumflex above */}
        <span className="relative inline-flex items-center justify-center mx-[-0.05em]">
          {/* The circumflex accent ̂ */}
          <span 
            className="absolute text-[0.5em] leading-none"
            style={{ top: "-0.1em", left: "0.60em" }}
          >
            ̂
          </span>
          {/* The logo replacing the O */}
          <Image
            src="/brush-stroke.png"
            alt="Ô"
            width={80}
            height={80}
            className="inline-block object-contain"
            style={{ 
              width: "0.85em", 
              height: "0.85em",
              marginTop: "0.1em"
            }}
          />
        </span>
        
        {/* N */}
        <span>N</span>
      </h1>
    </header>
  );
};

export default BrandHeader;
