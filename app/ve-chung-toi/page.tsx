import { Metadata } from "next";
import FullAboutContent from "@/components/about/FullAboutContent";

export const metadata: Metadata = {
  title: "Về nhà Đồng ngôn | Chúng tôi là ai?",
  description: "Đồng ngôn là gì? Chúng tôi là ai?",
  openGraph: {
    title: "Đồng ngôn ăn được không? | Hành trình và Tương lai",
    description: "Đồng ngôn là gì? Chúng tôi là ai?",
    url: "https://dongngon.vercel.app/ve-chung-toi",
    siteName: "Đồng ngôn",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Về nhà Đồng ngôn | Chúng tôi là ai?",
    description: "Đồng ngôn là gì? Chúng tôi là ai?",
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
                "@id": "https://dongngon.vercel.app/ve-chung-toi/#webpage",
                "@type": "AboutPage",
                name: "Về nhà Đồng ngôn | Chúng tôi là ai?",
                description: "Đồng ngôn là gì? Chúng tôi là ai?",
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
      <div className="min-h-screen bg-black bg-[radial-gradient(#ffffff1a_1px,transparent_1px)] [background-size:20px_20px] flex flex-col items-center pt-32 pb-40">
        <div className="w-full max-w-7xl mx-auto">
          <FullAboutContent />
        </div>
      </div>
    </>
  );
}
