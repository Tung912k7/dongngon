/**
 * BrandHeader Component
 */
const BrandHeader = () => {
  return (
    <header className="relative w-full h-auto flex items-center justify-center bg-white">
      <h1
        id="tour-brand"
        className="font-svn-harmony flex items-center justify-center tracking-normal leading-none text-slate-900 select-none whitespace-nowrap"
        style={{
          fontSize: "clamp(3.5rem, 15vw, 12rem)",
          textShadow: "0.5px 0.5px 0 currentcolor, -0.5px -0.5px 0 currentcolor, 0.5px -0.5px 0 currentcolor, -0.5px 0.5px 0 currentcolor",
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
