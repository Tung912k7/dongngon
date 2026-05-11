import { Viewport, Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { sanitizeTitle } from "@/utils/sanitizer";
import { Contribution } from "@/types/database";
import Link from "next/link";
import dynamic from "next/dynamic";
const Feed = dynamic(() => import("../../../components/Feed"));
const Editor = dynamic(() => import("../../../components/Editor"));
const VoteButton = dynamic(() => import("../../../components/VoteButton"));
const WorkOwnerControls = dynamic(() => import("../../../components/WorkOwnerControls"));
import { isReadOnlyProseSubCategory } from "@/data/workTypes";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const baseUrl = "https://dongngon.vercel.app";
  const { id } = await params;
  const supabase = await createClient();
  const { data: work } = await supabase
    .from("works")
    .select("id, title, status, sub_category, description, author_nickname, is_test")
    .eq("id", id)
    .single();

  if (!work) return { title: "Không tìm thấy tác phẩm" };
  const sanitizedTitle = sanitizeTitle(work.title);
  const description = work.description || `Đọc và đóng góp cho tác phẩm "${sanitizedTitle}" thuộc thể loại ${work.sub_category} trên Đồng ngôn.`;

  return {
    title: sanitizedTitle,
    description,
    robots: work.is_test ? { index: false, follow: false } : undefined,
    openGraph: {
      title: `${sanitizedTitle} | Đồng ngôn`,
      description,
      url: `${baseUrl}/work/${work.id}`,
      siteName: "Đồng ngôn",
      locale: "vi_VN",
      type: "article",
      authors: [work.author_nickname],
      section: work.sub_category,
    },
    twitter: {
      card: "summary_large_image",
      title: `${sanitizedTitle} | Đồng ngôn`,
      description,
      creator: "@dongngon",
    },
    alternates: {
      canonical: `/work/${work.id}`,
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

  // Parallelize all initial data fetching
  const [
    workResponse,
    contributionsResponse,
    voteCountResponse,
    userResponse
  ] = await Promise.all([
    supabase
      .from("works")
      .select("id, title, status, limit_type, category_type, sub_category, privacy, created_by, age_rating, author_nickname, description")
      .eq("id", id)
      .single(),
    supabase
      .from("contributions")
      .select("id, content, user_id, work_id, created_at, author_nickname, new_line, is_test")
      .eq("work_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("finish_votes")
      .select("*", { count: "exact", head: true })
      .eq("work_id", id),
    supabase.auth.getUser()
  ]);

  const work = workResponse.data;

  // Error logging and existence check
  if (workResponse.error || !work) {
    if (workResponse.error) {
      console.error(`[WorkPage] Error fetching work ${id}:`, workResponse.error.code, workResponse.error.message);
    }
    notFound();
  }

  const user = userResponse.data.user;

  // Secondary parallel fetch for profile and author profile
  const [profileResponse, authorProfileResponse] = await Promise.all([
    user ? supabase.from("user_private_data").select("birthday, is_test_account, role").eq("id", user.id).single() : Promise.resolve({ data: null }),
    supabase.from("profiles").select("is_hidden").eq("id", work.created_by).single()
  ]);

  const profile = profileResponse.data;
  const authorProfile = authorProfileResponse.data;
  const isTester = !!profile?.is_test_account;
  const isAdmin = profile?.role === "admin";
  const isAuthorHidden = authorProfile?.is_hidden;

  const contributions: Contribution[] = (contributionsResponse.data || [])
    .filter((c: any) => isTester || !c.is_test || (user && c.user_id === user.id))
    .map((c: any) => ({
      ...c,
      author_nickname: c.author_nickname,
      content: c.content
    }));

  const voteCount = voteCountResponse.count;

  // Permission Check: If work is private, only owner can view
  const isPrivate = work.privacy?.toLowerCase() === "private";
  if (isPrivate && (!user || user.id !== work.created_by)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#f5f5f5]">
        <div className="max-w-sm w-full bg-white border-2 border-black p-10 rounded-xl flex flex-col items-center transition-all">
          <div className="w-16 h-16 bg-black text-white rounded-lg flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-ganh font-bold mb-4 uppercase tracking-wider">Tác phẩm riêng tư</h1>
          <p className="text-black/60 font-medium mb-8 text-sm leading-relaxed">
            Bạn đang cố gắng truy cập địa hạt riêng tư của tác giả. Chỉ người sở hữu mới có quyền vào đây.
          </p>
          <Link href="/kho-tang" className="w-full py-3 bg-black text-white border-2 border-black rounded-xl font-ganh text-xs font-bold uppercase tracking-[0.2em] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (isAuthorHidden && (!user || (user.id !== work.created_by && !isAdmin))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#f5f5f5]">
        <div className="max-w-sm w-full bg-white border-2 border-black p-10 rounded-xl flex flex-col items-center transition-all">
          <div className="w-16 h-16 bg-black text-white rounded-lg flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-2xl font-ganh font-bold mb-4 uppercase tracking-wider">Không tìm thấy tác phẩm</h1>
          <p className="text-black/60 font-medium mb-8 text-sm leading-relaxed">
            Tác phẩm này không tồn tại hoặc đã bị vô hiệu hóa.
          </p>
          <Link href="/kho-tang" className="w-full py-3 bg-black text-white border-2 border-black rounded-xl font-ganh text-xs font-bold uppercase tracking-[0.2em] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Age Restriction Check
  const ageRating = work.age_rating;
  if (ageRating && ageRating.toLowerCase() !== "all") {
    if (!user) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#f5f5f5]">
          <div className="max-w-sm w-full bg-white border-2 border-black p-10 rounded-xl flex flex-col items-center transition-all">
            <div className="w-16 h-16 bg-literary-gold text-black border-2 border-black rounded-lg flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-2xl font-black">{ageRating}</span>
            </div>
            <h1 className="text-2xl font-ganh font-bold mb-4 uppercase tracking-wider">Xác nhận độ tuổi</h1>
            <p className="text-black/60 font-medium mb-8 text-sm leading-relaxed">
              Tác phẩm này được giới hạn cho độ tuổi {ageRating}. Vui lòng đăng nhập để tiếp tục.
            </p>
            <Link href="/dang-nhap" className="w-full py-3 bg-black text-white border-2 border-black rounded-xl font-ganh text-xs font-bold uppercase tracking-[0.2em] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all">
              Đăng nhập
            </Link>
          </div>
        </div>
      );
    }

    const { calculateAge, isOldEnough } = await import("@/utils/age");
    const age = calculateAge(profile?.birthday);
    
    // Admin bypass optionally? We can just do strictly age for everyone except maybe created_by
    if (user.id !== work.created_by && !isOldEnough(age, ageRating)) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-red-50">
          <div className="max-w-sm w-full bg-white border-2 border-red-600 p-10 rounded-xl flex flex-col items-center transition-all shadow-[8px_8px_0px_0px_rgba(220,38,38,0.1)]">
            <div className="w-16 h-16 bg-red-600 text-white rounded-lg flex items-center justify-center mb-6">
               <span className="text-3xl font-black">{ageRating}</span>
            </div>
            <h1 className="text-2xl font-ganh font-bold mb-4 uppercase tracking-wider text-red-600">Dừng bước!</h1>
            <p className="text-red-950/60 font-medium mb-8 text-sm leading-relaxed">
              Bạn chưa đủ tuổi để truy cập nội dung này. Quy tắc giới hạn {ageRating}+ được thực thi nghiêm ngặt.
            </p>
            <Link href="/kho-tang" className="w-full py-3 bg-red-600 text-white border-2 border-red-600 rounded-xl font-ganh text-xs font-bold uppercase tracking-[0.2em] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(220,38,38,0.4)] active:translate-x-0 active:translate-y-0 transition-all">
              Quay lại an toàn
            </Link>
          </div>
        </div>
      );
    }
  }

  // Calculate unique contributors from the already fetched contributions
  const uniqueContributors = new Set(contributions?.map((c) => c.user_id) || []).size;
  const isCompleted = work.status === "finished";
  const isOwner = !!user && user.id === work.created_by;
  const isReadOnlySubCategory = isReadOnlyProseSubCategory(work.sub_category);
  const canContribute = !isReadOnlySubCategory || isOwner;
  const contributionBlockedMessage = isReadOnlySubCategory
    ? "Mục này ở chế độ chỉ xem. Chỉ chủ tác phẩm mới có thể đóng góp."
    : undefined;


  return (
    <div className="min-h-screen max-w-2xl mx-auto p-6 flex flex-col ">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "CreativeWork",
                "name": work.title,
                "author": {
                  "@type": "Person",
                  "name": work.author_nickname
                },
                "genre": work.sub_category,
                "inLanguage": "vi",
                "description": work.description || `Tác phẩm ${work.title} thuộc thể loại ${work.sub_category} trên Đồng Ngôn.`,
                "url": `https://dongngon.vercel.app/work/${work.id}`,
                "isPartOf": {
                  "@type": "WebSite",
                  "@id": "https://dongngon.vercel.app/#website"
                },
                "contributor": {
                  "@type": "QuantitativeValue",
                  "value": uniqueContributors,
                  "unitText": "người đóng góp"
                },
                "creativeWorkStatus": isCompleted ? "Published" : "Draft",
                "accessMode": "textual",
                "interactionStatistic": {
                  "@type": "InteractionCounter",
                  "interactionType": "https://schema.org/WriteAction",
                  "userInteractionCount": contributions.length
                }
              },
              {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Trang chủ",
                    "item": "https://dongngon.vercel.app"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Kho tàng",
                    "item": "https://dongngon.vercel.app/kho-tang"
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": work.title,
                    "item": `https://dongngon.vercel.app/work/${work.id}`
                  }
                ]
              }
            ]
          }).replace(/</g, "\\u003c")
        }}
      />
      <section className="mb-10 border-b-2 border-black pb-8">
        <Link
          href="/kho-tang"
          className="text-xs font-bold uppercase tracking-[0.3em] text-black/60 hover:text-black transition-colors mb-6 inline-flex items-center gap-2 group"
        >
          <span className="text-lg group-hover:-translate-x-1 transition-transform">&larr;</span> QUAY LẠI KHO TÀNG
        </Link>
        <div className="flex justify-between items-start gap-6">
            <div className="flex-grow space-y-4">
              <h1 className="text-2xl md:text-3xl font-ganh font-bold leading-tight tracking-tight text-black break-words max-w-xl">{work.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.1em]">
                <div className="flex items-center gap-2">
                  <span className="font-black tracking-[0.2em] text-literary-gold bg-black px-2 py-0.5 rounded-sm">{work.category_type}</span>
                  <span className="text-black/60 tracking-[0.2em]">{work.sub_category}</span>
                </div>
                <span className="text-black/20 text-xs">•</span>
                <div className={`flex items-center gap-2 ${isCompleted ? "text-red-700" : "text-green-700"}`}>
                   <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? "bg-red-700" : "bg-green-700 animate-pulse"}`} />
                   <span>{isCompleted ? "HOÀN THÀNH" : "ĐANG VIẾT"}</span>
                </div>
              </div>
              <WorkOwnerControls 
                workId={work.id} 
                initialTitle={work.title} 
                isOwner={isOwner} 
              />
            </div>
            <VoteButton 
                workId={work.id} 
                initialCount={voteCount || 0} 
                isCompleted={isCompleted} 
                contributorCount={uniqueContributors}
            />
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
            <div className="bg-white p-5 rounded-xl border-2 border-black relative z-20">
                <Editor 
                  workId={work.id} 
                  writingRule="1 câu"
                  hinhThuc={work.sub_category}
                  categoryType={work.category_type}
                  user={user}
                  canContribute={canContribute}
                  blockedMessage={contributionBlockedMessage}
                />
            </div>
        </div>
      )}
    </div>
  );
}
