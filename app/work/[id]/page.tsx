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

  // Fetch Work Details
  const { data: work } = await supabase
    .from("works")
    .select("*")
    .eq("id", id)
    .single();

  if (!work) {
    notFound();
  }

  // Fetch Contributions
  const { data: contributions } = await supabase
    .from("contributions")
    .select("*")
    .eq("work_id", id)
    .order("created_at", { ascending: true });

  // Fetch Vote Count
  const { count: voteCount } = await supabase
    .from("finish_votes")
    .select("*", { count: "exact", head: true })
    .eq("work_id", id);

  // Fetch Unique Contributors Count
  const { data: contributorsData } = await supabase
    .from("contributions")
    .select("user_id")
    .eq("work_id", id);
  
  const uniqueContributors = new Set(contributorsData?.map(c => c.user_id) || []).size;
    
  const isCompleted = work.status === "completed";

  return (
    <main className="min-h-screen max-w-2xl mx-auto p-6 flex flex-col font-montserrat">
      <header className="mb-8 border-b pb-4">
        <Link
          href="/dong-ngon"
          className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block font-montserrat"
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
        
        <div className="text-sm text-gray-500 mt-2 font-montserrat">
          Trạng thái:{" "}
          <span
            className={
              isCompleted ? "text-red-600 font-bold" : "text-green-600"
            }
          >
            {isCompleted ? "Đã hoàn thành" : "Đang viết"}
          </span>
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
                />
            </div>
        </footer>
      )}
    </main>
  );
}
