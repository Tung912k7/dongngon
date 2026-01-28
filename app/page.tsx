import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Work } from "@/types/database";
import { formatDate } from "@/utils/date";
import NicknameForm from "@/components/NicknameForm";
import Header from "@/components/Header";
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
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Hero Section */}
        <FadeIn>
          <div className="flex flex-col items-center justify-center pt-8 sm:pt-16 pb-12 sm:pb-20">
            <BrandHeader />
            <div className="mt-4 mb-10">
               <div className="relative w-[150px] h-[150px] md:w-[220px] md:h-[220px] animate-fade-in">
        <Image
          src="/logo.webp"
          alt="Đồng Ngôn Logo"
          fill
          sizes="(max-width: 768px) 150px, 220px"
          className="object-contain"
          priority
        />
      </div>
            </div>
            <p className="text-2xl sm:text-3xl md:text-5xl font-normal tracking-wide text-center">[Slogan]</p>
          </div>
        </FadeIn>

  

        
        {myPrivateWorks.length > 0 && (
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
        )}
      </main>
    </div>
  );
}
