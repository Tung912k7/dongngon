import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Về chúng tôi",
  description:
    "Tìm hiểu về sứ mệnh, triết lý nghệ thuật và câu chuyện phía sau Đồng ngôn — Nền tảng sáng tác văn học cộng tác theo phong cách Modern Ink.",
  openGraph: {
    title: "về chúng tôi | Đồng ngôn",
    description:
      "Tìm hiểu về sứ mệnh, triết lý nghệ thuật và câu chuyện phía sau Đồng ngôn — Nền tảng sáng tác văn học cộng tác theo phong cách Modern Ink.",
    url: "https://dongngon.vercel.app/ve-chung-toi",
    siteName: "Đồng ngôn",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "về chúng tôi | Đồng ngôn",
    description:
      "Tìm hiểu về sứ mệnh, triết lý nghệ thuật và câu chuyện phía sau Đồng ngôn — Nền tảng sáng tác văn học cộng tác theo phong cách Modern Ink.",
  },
};

export default function AboutPage() {
  return (
    <div className="bg-[#faf8f5] text-[#1c1b1a] min-h-[90dvh] pt-24 md:pt-32 pb-16 md:pb-24 px-6 md:px-16 lg:px-24 relative overflow-hidden flex flex-col items-center">
      {/* Background Micro-patterns and Ambient Glows */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="absolute right-[-10%] top-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-deep-teal/3 to-[#d4af37]/3 blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute left-[-10%] bottom-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-[#d4af37]/2 to-deep-teal/2 blur-[140px] -z-10 pointer-events-none" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "Về chúng tôi - Đồng ngôn",
            description:
              "Đồng ngôn là một không gian số tĩnh lặng dành cho những tâm hồn yêu chữ Việt, nơi những câu thơ, dòng văn được vun trồng chung bởi cộng đồng.",
            url: "https://dongngon.vercel.app/ve-chung-toi",
            isPartOf: {
              "@type": "WebSite",
              "@id": "https://dongngon.vercel.app/#website",
            },
          }),
        }}
      />

      {/* Asymmetric 12-column Layout */}
      <div className="max-w-[1280px] w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start relative z-10">
        {/* Left Column (Sticky Sidebar - Identity & Meta) */}
        <header className="lg:col-span-5 lg:sticky lg:top-32 flex flex-col items-center lg:items-start text-center lg:text-left lg:border-r lg:border-[#eae6e1] lg:pr-12">
          {/* Micro-Eyebrow Badge */}
          <div className="inline-flex items-center rounded-full px-4 py-1.5 bg-[#134e4a]/5 border border-[#134e4a]/12 text-[10px] uppercase tracking-[0.2em] font-bold text-[#134e4a] mb-6 shadow-sm">
            GIỚI THIỆU DỰ ÁN
          </div>

          <h1
            id="about-heading"
            className="text-5xl md:text-6xl lg:text-7.5xl font-ganh text-[#134e4a] tracking-tight font-bold mb-4 lowercase leading-none"
          >
            đồng ngôn
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#134e4a]/60">
            Khơi nguồn dòng chảy văn chương
          </p>

          {/* Elegant Red Seal Watermark in the sidebar */}
          <div className="border-[1.5px] border-red-700/60 p-2.5 text-red-700/60 bg-red-50/30 rounded-sm font-serif font-black text-[11px] tracking-widest leading-none uppercase rotate-6 opacity-95 select-none my-10 shadow-sm">
            <span className="whitespace-pre text-center block leading-tight px-0.5">
              ĐỒNG
              <br />
              NGÔN
            </span>
          </div>

          <div className="hidden lg:block pt-8 border-t border-[#eae6e1] w-full">
            <p className="text-[10px] text-[#1c1b1a]/40 font-mono tracking-[0.2em] uppercase">
              ĐỒNG NGÔN &copy; 2026
              <br />
              KHÔNG GIAN SÁNG TÁC TỰ DO
            </p>
          </div>
        </header>

        {/* Right Column (Narration, Philosophy, Rules) */}
        <div className="lg:col-span-7 space-y-16">
          {/* Narrative Paragraphs */}
          <section className="space-y-6 text-[#1c1b1a]/90 leading-relaxed font-sans text-[15px] md:text-[16px] max-w-[650px]">
            <p className="first-letter:text-5xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:font-bold first-letter:text-[#134e4a] first-letter:leading-none">
              Chào mừng bạn đến với <strong className="font-bold text-[#1c1b1a]">Đồng ngôn</strong>,
              một không gian số tĩnh lặng dành cho những ai trân quý và muốn gìn giữ vẻ đẹp của
              tiếng Việt thông qua lăng kính văn chương.
            </p>
            <p>
              Đồng ngôn được sinh ra từ mong muốn kết nối những tâm hồn đồng điệu qua từng con chữ.
              Nơi đây không có chỗ cho sự vội vã, ồn ào; thay vào đó là nhịp thở nhẹ nhàng của sự
              sáng tạo tự do, nơi mỗi tác giả đóng góp một phần nhỏ bé của mình để cùng nhau xây
              dựng nên những tác phẩm hoàn chỉnh.
            </p>
          </section>

          {/* Core Principles */}
          <section className="w-full space-y-6">
            <h2 className="text-2xl font-ganh font-bold text-[#1c1b1a] uppercase tracking-wide border-b border-[#eae6e1] pb-4">
              Triết lý cốt lõi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* Card 1: Zen */}
              <div className="bg-[#fcfaf8] p-6 md:p-8 rounded-2xl border border-[#eae6e1] space-y-4 hover:border-[#134e4a]/20 transition-colors shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-[#134e4a]/5 flex items-center justify-center text-[#134e4a] border border-[#134e4a]/10">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M12 2c5.523 0 10 4.477 10 10S17.523 22 12 22 2 17.523 2 12 6.477 2 12 2z" />
                      <path d="M12 22V12" />
                      <path d="M12 12c4-2 6-6 6-6s-4 2-6 6z" />
                      <path d="M12 12c-4-2-6-6-6-6s4 2 6 6z" />
                    </svg>
                  </div>
                  <h3 className="font-ganh font-bold text-[#134e4a] text-lg">Sự Tối Giản (Zen)</h3>
                  <p className="text-xs md:text-sm text-[#1c1b1a]/70 font-sans leading-relaxed">
                    Chúng tôi loại bỏ các yếu tố gây xao nhãng để bạn hoàn toàn tập trung vào trải
                    nghiệm đọc và viết, đưa ngôn từ trở lại vị thế trung tâm.
                  </p>
                </div>
              </div>

              {/* Card 2: Collaboration */}
              <div className="bg-[#fcfaf8] p-6 md:p-8 rounded-2xl border border-[#eae6e1] space-y-4 hover:border-[#d4af37]/30 transition-colors shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-[#d4af37]/5 flex items-center justify-center text-[#d4af37] border border-[#d4af37]/10">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <h3 className="font-ganh font-bold text-[#d4af37] text-lg">Tính Cộng Tác</h3>
                  <p className="text-xs md:text-sm text-[#1c1b1a]/70 font-sans leading-relaxed">
                    Mỗi câu đóng góp là một nét mực độc bản. Tác phẩm hoàn chỉnh là bản hòa ca của
                    nhiều cá tính sáng tạo khác nhau.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Writing Philosophy */}
          <section className="w-full space-y-6">
            <h2 className="text-2xl font-ganh font-bold text-[#1c1b1a] uppercase tracking-wide border-b border-[#eae6e1] pb-4">
              Tôn chỉ sáng tác
            </h2>
            <div className="w-full divide-y divide-[#eae6e1]">
              <div className="py-6 flex gap-4 md:gap-6 items-start group">
                <span className="font-serif text-4xl font-extrabold text-[#134e4a]/20 group-hover:text-[#134e4a]/40 transition-colors pr-2 leading-none">
                  01
                </span>
                <div className="space-y-1.5 flex-1">
                  <h4 className="font-ganh font-bold text-lg text-[#1c1b1a]">Tôn trọng chữ Việt</h4>
                  <p className="text-xs md:text-sm text-[#1c1b1a]/70 font-sans leading-relaxed">
                    Viết đúng chính tả, giữ gìn sự trong sáng của ngôn ngữ và trân trọng các dấu câu
                    tiếng Việt.
                  </p>
                </div>
              </div>

              <div className="py-6 flex gap-4 md:gap-6 items-start group">
                <span className="font-serif text-4xl font-extrabold text-[#134e4a]/20 group-hover:text-[#134e4a]/40 transition-colors pr-2 leading-none">
                  02
                </span>
                <div className="space-y-1.5 flex-1">
                  <h4 className="font-ganh font-bold text-lg text-[#1c1b1a]">Tính dòng chảy</h4>
                  <p className="text-xs md:text-sm text-[#1c1b1a]/70 font-sans leading-relaxed">
                    Đọc kỹ các câu viết trước đó để đảm bảo câu tiếp theo tiếp nối một cách hài hòa
                    cả về ý nghĩa và nhịp điệu.
                  </p>
                </div>
              </div>

              <div className="py-6 flex gap-4 md:gap-6 items-start group">
                <span className="font-serif text-4xl font-extrabold text-[#134e4a]/20 group-hover:text-[#134e4a]/40 transition-colors pr-2 leading-none">
                  03
                </span>
                <div className="space-y-1.5 flex-1">
                  <h4 className="font-ganh font-bold text-lg text-[#1c1b1a]">
                    Văn minh &amp; Chia sẻ
                  </h4>
                  <p className="text-xs md:text-sm text-[#1c1b1a]/70 font-sans leading-relaxed">
                    Lắng nghe phản hồi từ cộng đồng, không sử dụng từ ngữ thô tục hay nội dung mang
                    tính đả kích.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer info (Mobile fallback) */}
          <footer className="text-center pt-8 border-t border-[#eae6e1] w-full lg:hidden">
            <p className="text-[10px] text-[#1c1b1a]/40 font-mono tracking-[0.2em] uppercase">
              ĐỒNG NGÔN &copy; 2026 — KHÔNG GIAN SÁNG TÁC TỰ DO
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
