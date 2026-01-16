import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Work } from "@/types/database";
import NicknameForm from "@/components/NicknameForm";
import Header from "@/components/Header";
import FadeIn from "@/components/FadeIn";
import BrandHeader from "@/components/BrandHeader";

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
  let myPrivateWorks: Work[] = [];
  if (user) {
      const { data } = await supabase
        .from("works")
        .select("*")
        .eq("created_by", user.id)
        .eq("license", "private")
        .order("created_at", { ascending: false });
      if (data) myPrivateWorks = data;
  }

  return (
    <div className="min-h-screen bg-white font-serif text-black">
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Hero Section */}
        <FadeIn>
          <div className="flex flex-col items-center justify-center pt-6 sm:pt-10 pb-12 sm:pb-20">
            <BrandHeader />
            <p className="text-2xl sm:text-3xl md:text-5xl font-serif font-normal tracking-wide mt-1 text-center">[Slogan]</p>
          </div>
        </FadeIn>

        {user && (
            <div className="flex justify-center mb-10">
               <NicknameForm initialNickname={profile?.nickname} />
            </div>
        )}
  

        
        {myPrivateWorks.length > 0 && (
            <section className="space-y-6 mt-12 border-t pt-8">
              <h2 className="text-xl font-semibold text-gray-700">
                Tác phẩm riêng tư (Chỉ mình bạn thấy)
              </h2>
              <div className="grid gap-6">
                  {myPrivateWorks.map((work: Work) => (
                    <Link
                      key={work.id}
                      href={`/work/${work.id}`}
                      className="block p-6 rounded-lg border border-dashed border-gray-300 hover:border-gray-400 transition-colors bg-gray-50"
                    >
                      <h3 className="text-2xl font-serif mb-2 text-gray-700">{work.title} 🔒</h3>
                      <div className="flex justify-between text-sm text-gray-400 font-sans">
                        <span>ID: #{work.id.slice(0, 8)}</span>
                        <span>{new Date(work.created_at).toLocaleDateString("vi-VN")}</span>
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
