import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Work } from "@/stores/work-store";
import CreateWorkModal from "@/components/CreateWorkModal";
import { LinkedButton } from "@/components/PrimaryButton";
import WorkLibraryItem from "@/components/WorkLibraryItem";
import { formatDate } from "@/utils/date";
import { sanitizeTitle, sanitizeNickname } from "@/utils/sanitizer";
import ProfileSidebar from "@/components/ProfileSidebar";

type WorkLike = Record<string, unknown> & {
  title: string;
  author_nickname: string;
  category_type: string;
  sub_category: string;
  limit_type: string;
  status: string;
  created_at: string;
};

const sanitizeWork = (work: WorkLike): Work => {
  return {
    ...work,
    title: sanitizeTitle(work.title),
    author_nickname: sanitizeNickname(work.author_nickname),
    type: work.category_type,
    hinh_thuc: work.sub_category,
    rule: "1 câu",
    status: work.status === "writing" ? "Đang viết" : 
            work.status === "finished" ? "Hoàn thành" : 
            work.status === "pending" ? "Đợi duyệt" : work.status,
    date: formatDate(work.created_at),
    rawDate: work.created_at
  } as unknown as Work;
};

export default async function ProfilePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ id?: string }> 
}) {
  const { id } = await searchParams;
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // If ID is provided, we are viewing that user. Otherwise, we are viewing our own profile.
  const targetId = id || currentUser?.id;

  // If still no targetId (logged out and no ?id=...), redirect to login
  if (!targetId) {
    redirect("/dang-nhap");
  }

  const isOwner = currentUser?.id === targetId;

  // Fetch Profile of targetId
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", targetId)
    .single();

  if (profileError) {
    console.error("[Profile] Fetch error:", profileError.code, profileError.message);
  }

  // Synthesis logic for the profile if DB fetch fails
  const syntheticProfile = (isOwner && currentUser) ? {
    id: targetId,
    nickname: currentUser.user_metadata?.nickname || currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || "Người dùng",
    full_name: currentUser.user_metadata?.full_name,
    avatar_url: currentUser.user_metadata?.avatar_url,
    is_private: false,
    has_acknowledged_welcome_message: true,
  } : null;

  const finalProfile = profile || syntheticProfile;

  if (!finalProfile) {
    console.error("Profile not found and no fallback available, redirecting to home");
    redirect("/");
  }

  // Add account privacy check
  if (finalProfile.is_private && !isOwner) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto shadow-xl">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25-2.25v6.75a2.25 2.25 0 002.25 2.25z" />
             </svg>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-widest">Người dùng đã khoá tài khoản</h1>
          <p className="text-gray-500 font-medium">Hồ sơ này đã được chủ sở hữu đặt ở chế độ riêng tư.</p>
          <LinkedButton href="/" className="mt-8 border-2 border-black px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all">Quay lại trang chủ</LinkedButton>
        </div>
      </div>
    );
  }

  // Fetch Created Works of targetId
  let worksQuery = supabase
    .from("works")
    .select("*")
    .eq("created_by", targetId)
    .order("created_at", { ascending: false });

  // Privacy Filter: If not owner, only show Public works
  if (!isOwner) {
    worksQuery = worksQuery.ilike("privacy", "public");
  }

  const { data: rawCreatedWorks } = await worksQuery;
  const createdWorks = (rawCreatedWorks || []).map(sanitizeWork);

  // Fetch Contributed Works (Unique)
  const { data: contributions } = await supabase
    .from("contributions")
    .select("*, works(*)")
    .eq("user_id", targetId);

  // Filter unique works from contributions
  const contributedWorksList = Array.from(
    new Map((contributions || [])
      .filter(c => {
        // Handle works as object or array, with singular/plural fallback
        const workData = c.works || (c as Record<string, unknown>).work;
        const finalWork = Array.isArray(workData) ? workData[0] : workData;

        if (!finalWork || !finalWork.id || finalWork.created_by === targetId) return false;
        
        // Privacy check for public visitors
        if (!isOwner && finalWork.privacy !== "public" && finalWork.privacy !== "Public" && finalWork.privacy !== "PUBLIC") {
          return false;
        }

        return true;
      })
      .map(c => {
        const workData = c.works || (c as Record<string, unknown>).work;
        const finalWork = Array.isArray(workData) ? workData[0] : workData;
        return [finalWork.id, sanitizeWork(finalWork as WorkLike)];
      }))
      .values()
  );

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 md:pb-24">
      <section className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar */}
        <ProfileSidebar profile={finalProfile} isOwner={isOwner} currentUser={currentUser} />

        {/* Main Content */}
        <div className="flex-1 w-full bg-white border-2 border-black rounded-[3rem] overflow-hidden">
          
          {/* Created Works Section */}
          <div className="p-10 pb-0">
            <div className="flex justify-between items-end mb-10 border-b-2 border-black pb-4">
              <h2 className="text-3xl font-black uppercase tracking-tighter">TÁC PHẨM ĐÃ TẠO</h2>
              {isOwner && createdWorks && createdWorks.length > 0 && <CreateWorkModal />}
            </div>
            <div className="flex flex-col gap-4">
              {createdWorks && createdWorks.length > 0 ? (
                createdWorks.map((work) => (
                  <WorkLibraryItem key={work.id} work={work} isOwner={isOwner} />
                ))
              ) : (
                <div className="w-full py-20 border-2 border-dashed border-black/10 rounded-[3rem] flex flex-col items-center justify-center text-gray-400 gap-6 bg-gray-50/50">
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 opacity-20">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                  <p className="italic font-bold text-gray-400/40 uppercase tracking-[0.2em] text-[10px]">
                    {isOwner ? "Bạn chưa tạo tác phẩm nào" : "Tác giả chưa có tác phẩm công khai"}
                  </p>
                  {isOwner && <CreateWorkModal />}
                </div>
              )}
            </div>
          </div>

          <div className="p-10 pt-20">
            <div className="flex justify-between items-end mb-10 border-b-2 border-black pb-4">
              <h2 className="text-3xl font-black uppercase tracking-tighter">ĐÓNG GÓP CỦA TÔI</h2>
              {isOwner && contributedWorksList && contributedWorksList.length > 0 && (
                <LinkedButton 
                  href="/kho-tang"
                  className="!rounded-full !text-[10px] !uppercase !tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                >
                  ĐÓNG GÓP THÊM
                </LinkedButton>
              )}
            </div>
            <div className="flex flex-col gap-4">
              {contributedWorksList && contributedWorksList.length > 0 ? (
                contributedWorksList.map((work) => (
                  <WorkLibraryItem key={work.id} work={work} isOwner={false} />
                ))
              ) : (
                <div className="w-full py-20 border-2 border-dashed border-black/10 rounded-[3rem] flex flex-col items-center justify-center text-gray-400 gap-6 bg-gray-50/50">
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 opacity-20">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <p className="italic font-bold text-gray-400/40 uppercase tracking-[0.2em] text-[10px]">
                    {isOwner ? "Bạn chưa có đóng góp nào" : "Chưa có đóng góp công khai nào"}
                  </p>
                  {isOwner && (
                    <LinkedButton 
                      href="/kho-tang"
                      className="!px-10 !py-3 !rounded-full !text-xs !uppercase !tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                    >
                      ĐÓNG GÓP NGAY
                    </LinkedButton>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

      </section>
    </div>
  );
}
