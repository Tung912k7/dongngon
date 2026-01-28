import type { Metadata } from "next";
// Font defined in globals.css
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GuideNotification from "@/components/GuideNotification";
import localFont from "next/font/local";
import { Be_Vietnam_Pro } from "next/font/google";

const ganhType = localFont({
  src: "../public/fonts/Ganh Type - Regular.ttf",
  display: "swap",
  variable: "--font-ganh",
  preload: true,
});

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["400", "500", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam",
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
  metadataBase: new URL("https://dongngon.com"), // Replace with your actual domain
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
        url: "/logo.png",
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
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.webp",
    shortcut: "/logo.webp",
    apple: "/logo.webp",
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

import { CSPostHogProvider } from "./providers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let nickname = null;
  let role = null;
  let has_seen_tour = true; // Default to true so we don't show it to unauthed or if error
  
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname, role, has_seen_tour")
      .eq("id", user.id)
      .single();
    nickname = profile?.nickname;
    role = profile?.role;
    has_seen_tour = profile?.has_seen_tour ?? false;
  }

  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://lqlobokdwcebvoitwxkt.supabase.co" />
        <link rel="dns-prefetch" href="https://lqlobokdwcebvoitwxkt.supabase.co" />
      </head>
      <body
        className={`${ganhType.variable} ${beVietnamPro.variable} antialiased min-h-screen flex flex-col`}
      >
        <CSPostHogProvider>
          <Header user={user} nickname={nickname} role={role} />
          <main className="flex-1 w-full">
            {children}
          </main>
          <Footer />
          <GuideNotification hasSeenTour={has_seen_tour} />
        </CSPostHogProvider>
      </body>
    </html>
  );
}
