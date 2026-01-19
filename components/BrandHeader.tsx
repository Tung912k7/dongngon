import Image from "next/image";

/**
 * BrandHeader Component
 */
const BrandHeader = () => {
  return (
    <header className="relative w-full h-auto flex items-center justify-center bg-white">
      <h1
        className={`
          flex items-center justify-center
          font-serif
          font-bold
          tracking-[0.05em]
          leading-none
          text-slate-900
          select-none
          whitespace-nowrap
        `}
        style={{
          fontSize: "clamp(2.5rem, 8vw, 9rem)",
          fontFeatureSettings: '"kern" 1, "liga" 1, "ccmp" 1, "locl" 1',
        }}
        lang="vi"
      >
        <span>Đ</span>
        <span className="relative inline-block">
          Ô
          <span 
            className="absolute top-[-0.4em] right-[0.1em] text-[0.8em]"
            style={{ transform: "rotate(-10deg)" }}
          >
            `
          </span>
        </span>
        <span>NG NGÔN</span>
      </h1>
    </header>
  );
};

export default BrandHeader;
