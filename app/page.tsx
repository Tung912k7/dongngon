import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Work } from "@/types/database";
import WorkFilter from "@/components/WorkFilter";
import NicknameForm from "@/components/NicknameForm";

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

  let query = supabase
    .from("works")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (resolvedParams.category_type) {
    query = query.eq("category_type", resolvedParams.category_type as string);
  }

  if (resolvedParams.period) {
    query = query.eq("period", resolvedParams.period as string);
  }
  
  // Default to public/active works
  // If we want to support private mode, we should filter by license or a new field. 
  // For now, let's assume 'license' != 'private'
  query = query.neq("license", "private");

  const { data: works } = await query;
  
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
    <main className="min-h-screen max-w-2xl mx-auto p-6 font-sans">
      <header className="mb-12 text-center pt-10">
        <h1 className="text-4xl font-bold mb-4">Đồng Ngôn</h1>
        <p className="text-gray-500 italic">
          "Nơi những câu chuyện được viết tiếp..."
        </p>
      </header>
      
      {user && (
          <div className="flex justify-center">
             <NicknameForm initialNickname={profile?.nickname} />
          </div>
      )}

      <section className="space-y-6">
        <div className="flex justify-between items-center border-b pb-2 border-gray-100 mb-4">
            <h2 className="text-xl font-semibold">
            Tác phẩm đang viết
            </h2>
        </div>
        
        <WorkFilter />
        
        <div className="grid gap-6">
          {works && works.length > 0 ? (
            works.map((work: Work) => (
              <Link
                key={work.id}
                href={`/work/${work.id}`}
                className="block p-6 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors bg-white shadow-sm hover:shadow-md"
              >
                <h3 className="text-2xl font-sans mb-2">{work.title}</h3>
                <div className="flex justify-between text-sm text-gray-400 font-sans">
                  <span>ID: #{work.id.slice(0, 8)}</span>
                  <span>{new Date(work.created_at).toLocaleDateString("vi-VN")}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-10 text-gray-400 italic">
              Chưa có tác phẩm nào phù hợp.
            </div>
          )}
        </div>
      </section>
      
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
                    <h3 className="text-2xl font-sans mb-2 text-gray-700">{work.title} 🔒</h3>
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
  );
}
