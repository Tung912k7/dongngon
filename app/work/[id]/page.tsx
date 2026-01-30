import { Viewport, Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Feed from "../../../components/Feed";
import Editor from "../../../components/Editor";
import VoteButton from "../../../components/VoteButton";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: work } = await supabase
    .from("works")
    .select("title, sub_category")
    .eq("id", id)
    .single();

  if (!work) return { title: "Không tìm thấy tác phẩm" };

  return {
    title: work.title,
    description: `Tác phẩm ${work.title} thuộc thể loại ${work.sub_category} trên Đồng ngôn.`,
    openGraph: {
      title: `${work.title} | Đồng ngôn`,
      description: `Đọc và đóng góp cho tác phẩm "${work.title}" trên Đổng ngôn.`,
      type: "article",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function WorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Parallelize all data fetching
  const [
    { data: work },
    { data: contributions },
    { count: voteCount },
    { data: { user } }
  ] = await Promise.all([
    // 1. Fetch Work Details
    supabase
      .from("works")
      .select("id, title, status, limit_type, sub_category, privacy, created_by, contributor_count, vote_count")
      .eq("id", id)
      .single(),
    
    // 2. Fetch Contributions
    supabase
      .from("contributions")
      .select("id, content, user_id, work_id, created_at, author_nickname")
      .eq("work_id", id)
      .order("created_at", { ascending: true }),

    // 3. Fetch Vote Count
    supabase
      .from("finish_votes")
      .select("*", { count: "exact", head: true })
      .eq("work_id", id),

    // 4. Fetch Current User
    supabase.auth.getUser()
  ]);

  if (!work) {
    notFound();
  }

  // Permission Check: If work is private, only owner can view
  if (work.privacy === "Private" && (!user || user.id !== work.created_by)) {
    notFound();
  }

  // Calculate unique contributors from the already fetched contributions
  const uniqueContributors = new Set(contributions?.map((c: any) => c.user_id) || []).size;
  const isCompleted = work.status === "finished";

  const renderRuleText = (limitType: string) => {
    switch (limitType) {
      case 'character':
        return '1 kí tự';
      case 'sentence':
        return '1 câu';
      default:
        return 'Không giới hạn';
    }
  };

  return (
    <main className="min-h-screen max-w-2xl mx-auto p-6 flex flex-col ">
      <header className="mb-8 border-b pb-4">
        <Link
          href="/dong-ngon"
          className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block "
        >
          &larr; Quay lại
        </Link>
        <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold">{work.title}</h1>
            <VoteButton 
                workId={work.id} 
                initialCount={work.vote_count || 0} 
                isCompleted={isCompleted} 
                contributorCount={work.contributor_count || 0}
            />
        </div>
        
        <div className="mt-6 flex flex-wrap items-center gap-x-10 gap-y-3">
          {/* Trang thai */}
          <div className="flex items-center text-[10px] whitespace-nowrap">
            <span className="font-bold text-gray-400 uppercase tracking-[0.1em] mr-1.5">TRẠNG THÁI:</span>
            <span className={`font-black uppercase tracking-tight ${isCompleted ? "text-red-600" : "text-green-600"}`}>
              {isCompleted ? "HOÀN THÀNH" : "ĐANG VIẾT"}
            </span>
          </div>
        </div>
      </header>

      {/* Real-time Feed */}
      <section className="flex-grow mb-12">
        <Feed 
          initialContributions={contributions || []} 
          workId={work.id} 
          limitType={work.limit_type}
        />
      </section>

      {/* Editor - Sticky at bottom */}
      {!isCompleted && (
        <footer className="sticky bottom-6">
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                <Editor 
                  workId={work.id} 
                  writingRule={work.limit_type === "sentence" ? "1 câu" : "1 kí tự"} 
                  hinhThuc={work.sub_category} 
                  user={user}
                />
            </div>
        </footer>
      )}
    </main>
  );
}
