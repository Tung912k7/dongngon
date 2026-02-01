import { Viewport, Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { escapeHTML, sanitizeTitle, sanitizeNickname } from "@/utils/sanitizer";
import Link from "next/link";
import Feed from "../../../components/Feed";
import Editor from "../../../components/Editor";
import VoteButton from "../../../components/VoteButton";
import WorkOwnerControls from "../../../components/WorkOwnerControls";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: work } = await supabase
    .from("works")
    .select("title, sub_category")
    .eq("id", id)
    .single();

  if (!work) return { title: "Không tìm thấy tác phẩm" };
  const sanitizedTitle = sanitizeTitle(work.title);

  return {
    title: sanitizedTitle,
    description: `Tác phẩm ${sanitizedTitle} thuộc thể loại ${work.sub_category} trên Đồng ngôn.`,
    openGraph: {
      title: `${sanitizedTitle} | Đồng ngôn`,
      description: `Đọc và đóng góp cho tác phẩm "${sanitizedTitle}" trên Đồng ngôn.`,
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
    workResponse,
    contributionsResponse,
    voteCountResponse,
    userResponse
  ] = await Promise.all([
    // 1. Fetch Work Details
    supabase
      .from("works")
      .select("id, title, status, limit_type, sub_category, privacy, created_by")
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

  const work = workResponse.data;
  if (work) {
    work.title = sanitizeTitle(work.title);
  }

  const contributions = (contributionsResponse.data || []).map((c: any) => ({
    ...c,
    author_nickname: sanitizeNickname(c.author_nickname),
    // We don't have a specific sanitizeContribution but sanitizeTitle is similar (strips tags, cleans quotes)
    // Actually sanitizeInput is for input, we'll use a version that cleans quotes.
    content: sanitizeTitle(c.content)
  }));

  const voteCount = voteCountResponse.count;
  const user = userResponse.data.user;

  if (workResponse.error) {
    console.error(`[WorkPage] Error fetching work ${id}:`, workResponse.error);
  }

  if (!work) {
    console.warn(`[WorkPage] Work not found for ID: ${id}`);
    notFound();
  }

  // Permission Check: If work is private, only owner can view
  const isPrivate = work.privacy?.toLowerCase() === "private";
  if (isPrivate && (!user || user.id !== work.created_by)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Tác phẩm riêng tư</h1>
        <p className="text-gray-500 mb-8 max-w-xs">Bạn không có quyền truy cập vào nội dung này.</p>
        <Link href="/dong-ngon" className="px-6 py-2 bg-black text-white rounded-full font-bold">
          Quay lại trang chủ
        </Link>
      </div>
    );
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
    <div className="min-h-screen max-w-2xl mx-auto p-6 flex flex-col ">
      <section className="mb-8 border-b pb-4">
        <Link
          href="/dong-ngon"
          className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block "
        >
          &larr; Quay lại
        </Link>
        <div className="flex justify-between items-start">
            <div className="flex-grow">
              <h1 className="text-3xl font-bold">{work.title}</h1>
              <WorkOwnerControls 
                workId={work.id} 
                initialTitle={work.title} 
                isOwner={!!user && user.id === work.created_by} 
              />
            </div>
            <VoteButton 
                workId={work.id} 
                initialCount={voteCount || 0} 
                isCompleted={isCompleted} 
                contributorCount={uniqueContributors}
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
      </section>

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
        <div className="sticky bottom-6">
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                <Editor 
                  workId={work.id} 
                  writingRule={work.limit_type === "sentence" ? "1 câu" : "1 kí tự"} 
                  hinhThuc={work.sub_category} 
                  user={user}
                />
            </div>
        </div>
      )}
    </div>
  );
}
