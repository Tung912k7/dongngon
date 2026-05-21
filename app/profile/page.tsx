import { logger } from "@/lib/logger";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}): Promise<Metadata> {
  const { id } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  const targetId = id || currentUser?.id;
  const baseUrl = "https://dongngon.vercel.app";

  if (!targetId) return { title: "Hồ sơ" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, description, avatar_url")
    .eq("id", targetId)
    .single();

  if (!profile) return { title: "Không tìm thấy hồ sơ" };

  const nickname = profile.nickname || "Người dùng ẩn danh";
  const userDescription =
    profile.description || `Xem hồ sơ và các tác phẩm của ${nickname} trên Đồng ngôn.`;

  const ogImageUrl = new URL(`${baseUrl}/api/og`);
  ogImageUrl.searchParams.set("type", "profile");
  ogImageUrl.searchParams.set("author", nickname);
  ogImageUrl.searchParams.set("description", userDescription);

  return {
    title: `${nickname} | Đồng ngôn`,
    description: profile.description || `Xem hồ sơ và các tác phẩm của ${nickname} trên Đồng ngôn.`,
    openGraph: {
      title: `${nickname} | Hồ sơ Đồng ngôn`,
      description:
        profile.description || `Xem hồ sơ và các tác phẩm của ${nickname} trên Đồng ngôn.`,
      url: `${baseUrl}/profile?id=${targetId}`,
      siteName: "Đồng ngôn",
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: nickname,
        },
      ],
      locale: "vi_VN",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${nickname} | Hồ sơ Đồng ngôn`,
      description:
        profile.description || `Xem hồ sơ và các tác phẩm của ${nickname} trên Đồng ngôn.`,
      images: [ogImageUrl.toString()],
    },
  };
}
import { Work } from "@/stores/work-store";
import CreateWorkModal from "@/components/CreateWorkModal";
import { LinkedButton } from "@/components/PrimaryButton";
import WorkLibraryItem from "@/components/WorkLibraryItem";
import { formatDate } from "@/utils/date";
import { sanitizeNickname, sanitizeTitle } from "@/utils/sanitizer";
import ProfileSidebar, { SidebarProfile } from "@/components/ProfileSidebar";

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
    status:
      work.status === "writing"
        ? "Đang viết"
        : work.status === "finished"
          ? "Hoàn thành"
          : work.status === "pending"
            ? "Đợi duyệt"
            : work.status,
    date: formatDate(work.created_at),
    rawDate: work.created_at,
  } as unknown as Work;
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

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
    logger.error("[Profile] Fetch error:", profileError.code, profileError.message);
  }

  // Fetch private data (role and birthday)
  const { data: privateData } = await supabase
    .from("user_private_data")
    .select("role, birthday")
    .eq("id", targetId)
    .single();

  const isAdmin = privateData?.role === "admin";

  // Synthesis logic for the profile if DB fetch fails
  const syntheticProfile =
    isOwner && currentUser
      ? {
          id: targetId,
          nickname:
            currentUser.user_metadata?.nickname ||
            currentUser.user_metadata?.full_name ||
            currentUser.email?.split("@")[0] ||
            "Người dùng",
          full_name: currentUser.user_metadata?.full_name,
          avatar_url: currentUser.user_metadata?.avatar_url,
          is_private: false,
          has_acknowledged_welcome_message: true,
        }
      : null;

  const finalProfile = {
    ...(profile || syntheticProfile),
    birthday: privateData?.birthday || null,
  } as SidebarProfile;

  if (!finalProfile) {
    logger.error("Profile not found and no fallback available, redirecting to home");
    redirect("/");
  }

  // Add account privacy and hidden checks
  if (finalProfile.is_hidden && !isOwner && !isAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto shadow-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="white"
              className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-widest">Không tìm thấy hồ sơ</h1>
          <p className="text-gray-500 font-medium">
            Hồ sơ này không tồn tại hoặc đã bị vô hiệu hóa.
          </p>
          <LinkedButton
            href="/"
            className="mt-8 border-2 border-black px-6 py-2 rounded font-bold uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all"
          >
            Quay lại trang chủ
          </LinkedButton>
        </div>
      </div>
    );
  }

  if (finalProfile.is_private && !isOwner) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto shadow-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="white"
              className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25-2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-widest">
            Người dùng đã khoá tài khoản
          </h1>
          <p className="text-gray-500 font-medium">
            Hồ sơ này đã được chủ sở hữu đặt ở chế độ riêng tư.
          </p>
          <LinkedButton
            href="/"
            className="mt-8 border-2 border-black px-6 py-2 rounded font-bold uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all"
          >
            Quay lại trang chủ
          </LinkedButton>
        </div>
      </div>
    );
  }

  // 3. Prepare Works Query
  let worksQuery = supabase
    .from("works")
    .select("*")
    .eq("created_by", targetId)
    .order("created_at", { ascending: false });

  if (!isOwner) {
    worksQuery = worksQuery.ilike("privacy", "public").eq("is_test", false);
  }

  // 4. Parallel Data Fetching
  const [worksResult, contributionsResult, savedWorksResult] = await Promise.all([
    worksQuery,
    supabase.from("contributions").select("*, works(*)").eq("user_id", targetId),
    isOwner
      ? supabase
          .from("saved_works")
          .select("*, work:works(*)")
          .eq("user_id", targetId)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const rawCreatedWorks = worksResult.data;
  const contributions = contributionsResult.data;
  const savedWorksData = savedWorksResult.data;

  const createdWorks = (rawCreatedWorks || []).map(sanitizeWork);

  // 5. Filter unique works from contributions
  const contributedWorksList = Array.from(
    new Map(
      (contributions || [])
        .filter((c) => {
          const workData = c.works || (c as Record<string, unknown>).work;
          const finalWork = Array.isArray(workData) ? workData[0] : workData;

          if (!finalWork || !finalWork.id || finalWork.created_by === targetId) return false;

          if (!isOwner) {
            const isPublic = ["public", "Public", "PUBLIC"].includes(finalWork.privacy);
            if (!isPublic || finalWork.is_test || c.is_test) return false;
          }

          return true;
        })
        .map((c) => {
          const workData = c.works || (c as Record<string, unknown>).work;
          const finalWork = Array.isArray(workData) ? workData[0] : workData;
          return [finalWork.id, sanitizeWork(finalWork as WorkLike)];
        })
    ).values()
  );

  // 6. Fetch Saved Works (Processed from parallel result)
  let savedWorksList: Work[] = [];
  if (isOwner) {
    savedWorksList = (savedWorksData || [])
      .map((sw: Record<string, unknown>) => {
        const workData = sw.work || sw.works;
        const finalWork = Array.isArray(workData) ? workData[0] : workData;

        if (!finalWork) return null;
        return sanitizeWork(finalWork as Work);
      })
      .filter(Boolean) as Work[];
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 md:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Person",
                name: finalProfile.nickname,
                description:
                  finalProfile.description || `Thành viên của cộng đồng sáng tác Đồng ngôn.`,
                image: finalProfile.avatar_url,
                url: `https://dongngon.vercel.app/profile?id=${finalProfile.id}`,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Trang chủ",
                    item: "https://dongngon.vercel.app",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Hồ sơ",
                    item: `https://dongngon.vercel.app/profile?id=${finalProfile.id}`,
                  },
                ],
              },
            ],
          }),
        }}
      />
      <section className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar */}
        <ProfileSidebar
          key={finalProfile.id}
          profile={finalProfile}
          isOwner={isOwner}
          currentUser={currentUser}
        />

        {/* Main Content */}
        <div className="flex-1 w-full bg-white border-2 border-black rounded overflow-hidden">
          {/* Created Works Section */}
          <div className="p-6 md:p-10 pb-0">
            <div className="flex justify-between items-end mb-8 border-b-2 border-black pb-4">
              <h2 className="text-2xl md:text-3xl font-ganh font-bold uppercase tracking-tight text-nowrap">
                TÁC PHẨM ĐÃ TẠO
              </h2>
              {isOwner && createdWorks && createdWorks.length > 0 && <CreateWorkModal />}
            </div>
            <div className="flex flex-col gap-4">
              {createdWorks && createdWorks.length > 0 ? (
                createdWorks.map((work) => (
                  <WorkLibraryItem key={work.id} work={work} isOwner={isOwner} />
                ))
              ) : (
                <div className="w-full py-16 border-2 border-dashed border-black/10 rounded flex flex-col items-center justify-center text-gray-400 gap-6 bg-gray-50/50">
                  <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 opacity-20"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </div>
                  <p className="font-bold text-black/30 uppercase tracking-[0.2em] text-[10px]">
                    {isOwner ? "Bạn chưa tạo tác phẩm nào" : "Tác giả chưa có tác phẩm công khai"}
                  </p>
                  {isOwner && <CreateWorkModal />}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 md:p-10 pt-16">
            <div className="flex justify-between items-end mb-8 border-b-2 border-black pb-4">
              <h2 className="text-2xl md:text-3xl font-ganh font-bold uppercase tracking-tight text-nowrap">
                ĐÓNG GÓP CỦA TÔI
              </h2>
              {isOwner && contributedWorksList && contributedWorksList.length > 0 && (
                <LinkedButton
                  href="/kho-tang"
                  className="!rounded !text-[10px] !uppercase !tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                >
                  📖 ĐÓNG GÓP THÊM
                </LinkedButton>
              )}
            </div>
            <div className="flex flex-col gap-4">
              {contributedWorksList && contributedWorksList.length > 0 ? (
                contributedWorksList.map((work) => (
                  <WorkLibraryItem key={work.id} work={work} isOwner={false} />
                ))
              ) : (
                <div className="w-full py-16 border-2 border-dashed border-black/10 rounded flex flex-col items-center justify-center text-gray-400 gap-6 bg-gray-50/50">
                  <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 opacity-20"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                      />
                    </svg>
                  </div>
                  <p className="font-bold text-black/30 uppercase tracking-[0.2em] text-[10px]">
                    {isOwner ? "Bạn chưa có đóng góp nào" : "Chưa có đóng góp công khai nào"}
                  </p>
                  {isOwner && (
                    <LinkedButton
                      href="/kho-tang"
                      className="!px-8 !py-3 !rounded !text-[10px] !uppercase !tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                    >
                      ĐÓNG GÓP NGAY
                    </LinkedButton>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Saved Works Section (Owner only) */}
          {isOwner && (
            <div className="p-6 md:p-10 pt-16">
              <div className="flex justify-between items-end mb-8 border-b-2 border-black pb-4">
                <h2 className="text-2xl md:text-3xl font-ganh font-bold uppercase tracking-tight text-nowrap">
                  TÁC PHẨM ĐÃ LƯU
                </h2>
              </div>
              <div className="flex flex-col gap-4">
                {savedWorksList && savedWorksList.length > 0 ? (
                  savedWorksList.map((work) => (
                    <WorkLibraryItem
                      key={work.id}
                      work={work}
                      isOwner={false}
                      initialSaved={true}
                    />
                  ))
                ) : (
                  <div className="w-full py-16 border-2 border-dashed border-black/10 rounded flex flex-col items-center justify-center text-gray-400 gap-6 bg-gray-50/50">
                    <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 opacity-20"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                      </svg>
                    </div>
                    <p className="font-bold text-black/30 uppercase tracking-[0.2em] text-[10px]">
                      Bạn chưa lưu tác phẩm nào
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
