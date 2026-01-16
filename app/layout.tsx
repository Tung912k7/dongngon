import type { Metadata } from "next";
// Font defined in globals.css
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
        className="antialiased font-serif min-h-screen flex flex-col"
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
