/**
 * BrandHeader Component
 */
const BrandHeader = () => {
  return (
    <header className="relative w-full h-auto flex items-center justify-center bg-white">
      <h1
        id="tour-brand"
        className="flex items-center justify-center tracking-[0.08em] leading-none text-black select-none whitespace-nowrap"
        style={{
          fontFamily: "var(--font-quicksand), sans-serif",
          fontSize: "clamp(3rem, 12vw, 8rem)",
          fontWeight: 400,
          fontFeatureSettings: '"kern" 1, "liga" 1, "ccmp" 1, "locl" 1',
        }}
        lang="vi"
      >
        ĐỒNG NGÔN
      </h1>
    </header>
  );
};

export default BrandHeader;
