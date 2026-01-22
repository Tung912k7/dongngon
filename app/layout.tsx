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
});

const aquus = localFont({
  src: "../public/fonts/hlt-aquus-regular.ttf",
  display: "swap",
  variable: "--font-aquus",
});

const montserrat = localFont({
  src: "../public/fonts/Montserrat.ttf",
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Đồng ngôn",
  description: "Nơi lưu trữ những áng thơ văn",

};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let nickname = null;
  let role = null;
  let hasSeenTour = true; // Default to true to avoid showing it to non-logged users inappropriately or during load
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname, role, has_seen_tour")
      .eq("id", user.id)
      .single();
    nickname = profile?.nickname;
    role = profile?.role;
    hasSeenTour = profile?.has_seen_tour;
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
        <Header user={user} nickname={nickname} role={role} hasSeenTour={hasSeenTour} />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
