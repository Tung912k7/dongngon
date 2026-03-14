import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ClientGlobalWrappers } from "@/components/ClientGlobalWrappers";
import { CSPostHogProvider } from "./providers";
import { Be_Vietnam_Pro, Quicksand } from "next/font/google";
import localFont from "next/font/local";

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
    default: "Đồng ngôn - Nơi lưu trữ những áng thơ văn",
    template: "%s | Đồng ngôn",
  },
  description: "Không gian tĩnh lặng để lưu trữ, chia sẻ và cảm nhận những áng thơ văn, câu nói hay và cảm xúc đong đầy.",
  keywords: ["thơ văn", "ngẫu hứng", "sáng tác", "văn học", "lưu trữ", "đồng ngôn", "tâm hồn"],
  authors: [{ name: "Đồng ngôn" }],
  creator: "Đồng ngôn",
  publisher: "Đồng ngôn",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://dongngon.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Đồng ngôn",
    description: "Nơi lưu trữ những áng thơ văn và cảm xúc.",
    url: "https://dongngon.com",
    siteName: "Đồng ngôn",
    images: [
      {
        url: "/webp%20file/logo.webp",
        width: 800,
        height: 600,
        alt: "Đồng ngôn Logo",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Đồng ngôn",
    description: "Nơi lưu trữ những áng thơ văn và cảm xúc.",
    images: ["/webp%20file/logo.webp"],
  },
  icons: {
    icon: "/webp%20file/logo.webp",
    shortcut: "/webp%20file/logo.webp",
    apple: "/webp%20file/logo.webp",
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
    <html lang="vi" suppressHydrationWarning className="scroll-smooth">
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
                  "@id": "https://dongngon.com/#website",
                  "url": "https://dongngon.com",
                  "name": "Đồng ngôn",
                  "description": "Không gian tĩnh lặng để lưu trữ, chia sẻ và cảm nhận những áng thơ văn, câu nói hay và cảm xúc đong đầy.",
                  "inLanguage": "vi",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://dongngon.com/kho-tang?query={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "Organization",
                  "@id": "https://dongngon.com/#organization",
                  "name": "Đồng ngôn",
                  "url": "https://dongngon.com",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://dongngon.com/webp%20file/logo.webp"
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body
        className={`${ganhType.variable} ${beVietnamPro.variable} ${quicksand.variable} antialiased min-h-screen flex flex-col overflow-x-hidden`}
      >
        <CSPostHogProvider>
          <ClientGlobalWrappers>
            <Header />
            <main className="flex-1 w-full">
              {children}
            </main>
            <Footer />
          </ClientGlobalWrappers>
        </CSPostHogProvider>
      </body>
    </html>
  );
}
