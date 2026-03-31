import { Metadata } from "next";
import AboutUsContent from "@/components/about/AboutContent";

export const metadata: Metadata = {
  title: "Về chúng tôi | Đồng ngôn",
  description:
    "Đồng ngôn — nền tảng sáng tác văn học cộng đồng, nơi nhiều người cùng viết nên một tác phẩm. Tìm hiểu về sứ mệnh, tầm nhìn và đội ngũ đứng sau Đồng ngôn.",
  openGraph: {
    title: "Về chúng tôi | Đồng ngôn",
    description:
      "Câu chuyện đằng sau Đồng ngôn — nền tảng sáng tác văn học cộng đồng nơi chữ chồng lên chữ, hồn chất lên hồn, sinh nghệ thuật.",
    url: "https://dongngon.vercel.app/ve-chung-toi",
    siteName: "Đồng ngôn",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Về chúng tôi | Đồng ngôn",
    description:
      "Khám phá câu chuyện, sứ mệnh và giá trị cốt lõi của Đồng ngôn.",
  },
};

export default function AboutUsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "AboutPage",
                name: "Về chúng tôi — Đồng ngôn",
                description:
                  "Tìm hiểu về sứ mệnh, tầm nhìn và đội ngũ đứng sau nền tảng sáng tác văn học cộng đồng Đồng ngôn.",
                url: "https://dongngon.vercel.app/ve-chung-toi",
                inLanguage: "vi",
                isPartOf: {
                  "@type": "WebSite",
                  "@id": "https://dongngon.vercel.app/#website",
                },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Trang chủ",
                    item: "https://dongngon.vercel.app",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Về chúng tôi",
                    item: "https://dongngon.vercel.app/ve-chung-toi",
                  },
                ],
              },
            ],
          }),
        }}
      />
      <div className="min-h-screen bg-black bg-[radial-gradient(#ffffff1a_1px,transparent_1px)] [background-size:20px_20px] flex items-center justify-center py-20">
        <div className="w-full max-w-7xl mx-auto">
          <AboutUsContent />
        </div>
      </div>
    </>
  );
}
