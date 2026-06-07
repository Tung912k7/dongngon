"use client";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] bg-[radial-gradient(#e2dfd9_1px,transparent_1px)] [background-size:20px_20px] flex flex-col items-center justify-center overflow-hidden">
      {/* Content Container */}
      <div className="w-full max-w-[1440px] relative z-10 px-8 py-12">
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
