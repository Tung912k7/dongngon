import { Viewport, Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { sanitizeTitle, sanitizeNickname } from "@/utils/sanitizer";
import { Contribution } from "@/types/database";
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
    .select("title, sub_category, description")
    .eq("id", id)
    .single();

  if (!work) return { title: "Không tìm thấy tác phẩm" };
  const sanitizedTitle = sanitizeTitle(work.title);

  return {
    title: sanitizedTitle,
    description: work.description || `Tác phẩm ${sanitizedTitle} thuộc thể loại ${work.sub_category} trên Đồng ngôn.`,
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
      .select("id, title, status, limit_type, sub_category, privacy, created_by, age_rating, author_nickname, description")
      .eq("id", id)
      .single(),
    
    // 2. Fetch Contributions
    supabase
      .from("contributions")
      .select("id, content, user_id, work_id, created_at, author_nickname, new_line")
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

  const user = userResponse.data.user;

  // 5. Fetch User Profile
  let profile = null;
  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("birthday")
      .eq("id", user.id)
      .single();
    profile = profileData;
  }

  const work = workResponse.data;
  // No need to re-sanitize what's already sanitized in the DB or handled by React
  if (work) {
    // work.title is already cleaned on save
  }

  const contributions: Contribution[] = (contributionsResponse.data || []).map((c: Contribution) => ({
    ...c,
    author_nickname: c.author_nickname,
    content: c.content
  }));

  const voteCount = voteCountResponse.count;

  if (workResponse.error) {
    console.error(`[WorkPage] Error fetching work ${id}:`, workResponse.error.code, workResponse.error.message);
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
        <Link href="/kho-tang" className="px-6 py-2 bg-black text-white rounded-full font-bold">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  // Age Restriction Check
  const ageRating = work.age_rating;
  if (ageRating && ageRating.toLowerCase() !== "all") {
    if (!user) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Giới hạn độ tuổi</h1>
          <p className="text-gray-500 mb-8 max-w-xs">Tác phẩm này được giới hạn cho độ tuổi {ageRating}. Vui lòng đăng nhập để xác nhận.</p>
          <Link href="/dang-nhap" className="px-6 py-2 bg-black text-white rounded-full font-bold">
            Đăng nhập
          </Link>
        </div>
      );
    }

    const { calculateAge, isOldEnough } = await import("@/utils/age");
    const age = calculateAge(profile?.birthday);
    
    // Admin bypass optionally? We can just do strictly age for everyone except maybe created_by
    if (user.id !== work.created_by && !isOldEnough(age, ageRating)) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <span className="text-2xl font-black text-red-500">{ageRating}</span>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-red-600">Nội dung giới hạn độ tuổi</h1>
          <p className="text-gray-500 mb-8 max-w-xs">Bạn chưa đủ tuổi để xem tác phẩm này.</p>
          <Link href="/kho-tang" className="px-6 py-2 bg-black text-white rounded-full font-bold">
            Quay lại trang chủ
          </Link>
        </div>
      );
    }
  }

  // Calculate unique contributors from the already fetched contributions
  const uniqueContributors = new Set(contributions?.map((c) => c.user_id) || []).size;
  const isCompleted = work.status === "finished";


  return (
    <div className="min-h-screen max-w-2xl mx-auto p-6 flex flex-col ">
      <section className="mb-8 border-b pb-4">
        <Link
          href="/kho-tang"
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
          hinhThuc={work.sub_category}
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
