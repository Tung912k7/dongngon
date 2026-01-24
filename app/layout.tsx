import type { Metadata } from "next";
// Font defined in globals.css
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import localFont from "next/font/local";

const ariaPro = localFont({
  src: "../public/fonts/Aria Pro.ttf",
  display: "swap",
  variable: "--font-aria",
  preload: true,
});

const aquus = localFont({
  src: "../public/fonts/hlt-aquus-regular.ttf",
  display: "swap",
  variable: "--font-aquus",
  preload: true,
});

const montserrat = localFont({
  src: "../public/fonts/Montserrat.ttf",
  display: "swap",
  variable: "--font-montserrat",
  preload: true,
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
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname, role")
      .eq("id", user.id)
      .single();
    nickname = profile?.nickname;
    role = profile?.role;
  }

  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://lqlobokdwcebvoitwxkt.supabase.co" />
        <link rel="dns-prefetch" href="https://lqlobokdwcebvoitwxkt.supabase.co" />
      </head>
      <body
        className={`${ariaPro.variable} ${aquus.variable} ${montserrat.variable} antialiased font-sans min-h-screen flex flex-col`}
      >
        <CSPostHogProvider>
          <Header user={user} nickname={nickname} role={role} />
          <main className="flex-1 w-full">
            {children}
          </main>
          <Footer />
        </CSPostHogProvider>
      </body>
    </html>
  );
}
