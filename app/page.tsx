import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đồng ngôn",
  description: "Suỵt",
};

import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Work } from "@/types/database";
import { formatDate } from "@/utils/date";

import FadeIn from "@/components/FadeIn";
import BrandHeader from "@/components/BrandHeader";
import Image from "next/image";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  
  // Fetch User
  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;
  
  if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      profile = data;
  }

  
  // Fetch My Private Works
  let myPrivateWorks: Pick<Work, 'id' | 'title' | 'created_at'>[] = [];
  if (user) {
      const { data } = await supabase
        .from("works")
        .select("id, title, created_at")
        .eq("created_by", user.id)
        .eq("license", "private")
        .order("created_at", { ascending: false });
      if (data) myPrivateWorks = data;
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        
        {/* Hero Section - Centered using Flexbox */}
        {/* Hero Section - Flexible Flexbox Layout */}
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-20 pb-32">
          <BrandHeader />
          
          {/* Intro Card */}
          <div className="w-full max-w-xl bg-white rounded-[2rem] border-2 border-black p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 transition-all hover:shadow-2xl">
            {/* Logo */}
            <div className="flex shrink-0 items-center justify-center">
              <Image
                src="/logo.png"
                alt="Đồng ngôn"
                width={200}
                height={200}
                className="object-contain w-24 h-24 sm:w-36 sm:h-36"
                priority
              />
            </div>

            {/* Divider Line */}
            <div className="hidden sm:block w-[3px] h-24 bg-black shrink-0 self-center"></div>
            <div className="block sm:hidden w-24 h-[3px] bg-black shrink-0 self-center"></div>
            
            {/* Text */}
            <div className="flex-grow">
              <p className="text-gray-700 text-sm sm:text-base font-medium leading-relaxed font-be-vietnam text-center sm:text-left">
                Không gian tĩnh lặng
              </p>
            </div>
          </div>
        </div>

  

        
        {myPrivateWorks.length > 0 && (
          <FadeIn>
            <section className="space-y-6 mt-12 border-t pt-8">
              <h2 className="text-xl font-semibold text-gray-700">
                Tác phẩm riêng tư (Chỉ mình bạn thấy)
              </h2>
              <div className="grid gap-6">
                  {myPrivateWorks.map((work) => (
                    <Link
                      key={work.id}
                      href={`/work/${work.id}`}
                      className="block p-6 rounded-lg border border-dashed border-gray-300 hover:border-gray-400 transition-colors bg-gray-50"
                    >
                      <h3 className="text-2xl mb-2 text-gray-700">{work.title} 🔒</h3>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>ID: #{work.id.slice(0, 8)}</span>
                        <span>{formatDate(work.created_at)}</span>
                      </div>
                    </Link>
                  ))}
              </div>
            </section>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
