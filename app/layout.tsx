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

  return (
    <html lang="vi">
      <body
        className={`${ariaPro.variable} ${aquus.variable} antialiased font-sans min-h-screen flex flex-col`}
      >
        <Header user={user} />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
