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
        <Header user={user} nickname={nickname} role={role} />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
