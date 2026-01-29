import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Feed from "../../../components/Feed";
import Editor from "../../../components/Editor";
import VoteButton from "../../../components/VoteButton";

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

  if (!work) {
    notFound();
  }

  // Permission Check: If work is private, only owner can view
  if (work.privacy === "Private" && (!user || user.id !== work.created_by)) {
    notFound();
  }

  // Calculate unique contributors from the already fetched contributions
  const uniqueContributors = new Set(contributions?.map(c => c.user_id) || []).size;
  const isCompleted = work.status === "completed";

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
                initialCount={voteCount || 0} 
                isCompleted={isCompleted} 
                contributorCount={uniqueContributors}
            />
        </div>
        
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div className="text-gray-500">
            Quy tắc: <span className="font-bold text-black">{renderRuleText(work.limit_type)}</span>
          </div>
          <div className="text-gray-500">
            Hình thức: <span className="font-bold text-black">{work.sub_category}</span>
          </div>
          <div className="text-gray-500">
            Trạng thái:{" "}
            <span
              className={
                isCompleted ? "text-red-600 font-bold" : "text-green-600 font-bold"
              }
            >
              {isCompleted ? "Đã hoàn thành" : "Đang viết"}
            </span>
          </div>
        </div>
      </header>

      {/* Real-time Feed */}
      <section className="flex-grow mb-12">
        <Feed initialContributions={contributions || []} workId={work.id} />
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
