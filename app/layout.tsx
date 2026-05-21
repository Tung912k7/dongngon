import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ClientGlobalWrappers } from "@/components/ClientGlobalWrappers";
import { CSPostHogProvider } from "./providers";
import { Be_Vietnam_Pro, Quicksand } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "sonner";

const quicksand = Quicksand({
  subsets: ["latin", "vietnamese"],
  weight: ["500"],
  variable: "--font-quicksand",
  display: "swap",
  preload: false,
});

const ganhType = localFont({
  src: "../public/fonts/Ganh Type - Regular.woff2",
  display: "swap",
  variable: "--font-ganh-next",
  preload: true,
});

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["400", "500", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam-next",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Đồng ngôn | Ngẫu hứng, Kho tàng văn học, Văn thơ, Cùng nhau sáng tạo",
    template: "%s | Đồng ngôn",
  },
  description:
    "Cùng nhau xây dựng và khám phá kho tàng văn học độc đáo và sáng tạo tại Đồng ngôn, với cơ chế nối câu kì quái cùng nhiều điều thú vị đang chờ bạn khám phá...",
  keywords: [
    "sáng tác thơ văn",
    "văn học cộng đồng",
    "viết lách",
    "ngẫu hứng",
    "đồng ngôn",
    "sáng tạo",
    "kho tàng",
    "sự tự do",
    "văn chương",
  ],
  authors: [{ name: "Đồng ngôn" }],
  creator: "Đồng ngôn",
  publisher: "Đồng ngôn",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://dongngon.vercel.app"),
  alternates: {
    languages: {
      "vi-VN": "/",
    },
  },
  openGraph: {
    title: "Đồng ngôn - Sao còn chưa bấm vào...?",
    description:
      "Cùng nhau xây dựng và khám phá kho tàng văn học độc đáo và sáng tạo tại Đồng ngôn, với cơ chế nối câu kì quái cùng nhiều điều thú vị đang chờ bạn khám phá...",
    url: "https://dongngon.vercel.app",
    siteName: "Đồng ngôn",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Đồng ngôn - Sao còn chưa bấm vào...?",
    description:
      "Cùng nhau xây dựng và khám phá kho tàng văn học độc đáo và sáng tạo tại Đồng ngôn, với cơ chế nối câu kì quái cùng nhiều điều thú vị đang chờ bạn khám phá...",
  },
  icons: {
    icon: "/webp/logo.webp",
    shortcut: "/webp/logo.webp",
    apple: "/webp/logo.webp",
  },
  verification: {
    google: "ka9n2768UYd1YIxNC96kuOCvTBP6MfVqmUyFHRxSOvw",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth relative" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://lqlobokdwcebvoitwxkt.supabase.co" />
        <link rel="dns-prefetch" href="https://lqlobokdwcebvoitwxkt.supabase.co" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://dongngon.vercel.app/#website",
                  url: "https://dongngon.vercel.app",
                  name: "Đồng ngôn",
                  alternateName: "Đồng ngôn",
                  description:
                    "Cùng nhau xây dựng và khám phá kho tàng văn học độc đáo và sáng tạo tại Đồng ngôn, với cơ chế nối câu kì quái cùng nhiều điều thú vị đang chờ bạn khám phá...",
                  inLanguage: "vi",
                  publisher: { "@id": "https://dongngon.vercel.app/#organization" },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate: "https://dongngon.vercel.app/kho-tang?query={search_term}",
                    },
                    "query-input": "required name=search_term",
                  },
                },
                {
                  "@type": "Organization",
                  "@id": "https://dongngon.vercel.app/#organization",
                  name: "Đồng ngôn",
                  url: "https://dongngon.vercel.app",
                  logo: {
                    "@type": "ImageObject",
                    "@id": "https://dongngon.vercel.app/#logo",
                    url: "https://dongngon.vercel.app/webp/logo.webp",
                    contentUrl: "https://dongngon.vercel.app/webp/logo.webp",
                    caption: "Đồng ngôn",
                    inLanguage: "vi",
                    width: "800",
                    height: "600",
                  },
                  image: { "@id": "https://dongngon.vercel.app/#logo" },
                  description:
                    "Nền tảng sáng tác văn học cộng đồng — nơi nhiều người cùng viết nên một tác phẩm.",
                  foundingDate: "2026",
                },
                {
                  "@type": "WebPage",
                  "@id": "https://dongngon.vercel.app/#webpage",
                  url: "https://dongngon.vercel.app",
                  name: "Đồng ngôn | Ngẫu hứng, Kho tàng văn học, Văn thơ, Cùng nhau sáng tạo",
                  isPartOf: { "@id": "https://dongngon.vercel.app/#website" },
                  about: { "@id": "https://dongngon.vercel.app/#organization" },
                  description:
                    "Cùng nhau xây dựng và khám phá kho tàng văn học độc đáo và sáng tạo tại Đồng ngôn, với cơ chế nối câu kì quái cùng nhiều điều thú vị đang chờ bạn khám phá...",
                  inLanguage: "vi",
                },
                {
                  "@type": "BreadcrumbList",
                  "@id": "https://dongngon.vercel.app/#breadcrumb",
                  itemListElement: [
                    {
                      "@type": "ListItem",
                      position: 1,
                      name: "Trang chủ",
                      item: "https://dongngon.vercel.app",
                    },
                  ],
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${ganhType.variable} ${beVietnamPro.variable} ${quicksand.variable} antialiased min-h-screen flex flex-col overflow-x-hidden relative`}
      >
        <CSPostHogProvider>
          <Toaster position="top-right" expand={false} richColors closeButton />
          <ClientGlobalWrappers>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-white focus:text-black focus:font-bold focus:border-2 focus:border-black focus:m-4 focus:rounded-[4px]"
            >
              Chuyển đến nội dung chính
            </a>
            <Header />
            <main id="main-content" className="flex-1 w-full">
              {children}
            </main>
            <Footer />
          </ClientGlobalWrappers>
        </CSPostHogProvider>
      </body>
    </html>
  );
}
