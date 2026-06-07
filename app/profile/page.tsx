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
    .select("nickname, description, avatar_url, is_hidden, is_private")
    .eq("id", targetId)
    .single();

  if (!profile) return { title: "Không tìm thấy hồ sơ" };

  // If the profile is hidden or private, do not index it
  if (profile.is_hidden || profile.is_private) {
    return {
      title: "Hồ sơ riêng tư",
      robots: { index: false, follow: false },
    };
  }

  const nickname = profile.nickname || "Người dùng ẩn danh";
  const userDescription =
    profile.description || `Xem hồ sơ và các tác phẩm của ${nickname} trên Đồng ngôn.`;

  const ogImageUrl = new URL(`${baseUrl}/api/og`);
  ogImageUrl.searchParams.set("type", "profile");
  ogImageUrl.searchParams.set("author", nickname);
  ogImageUrl.searchParams.set("description", userDescription);

  return {
    title: nickname,
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
import { LinkedButton } from "@/components/PrimaryButton";
import { formatDate } from "@/utils/date";
import { sanitizeNickname, sanitizeTitle } from "@/utils/sanitizer";
import ProfileSidebar, { SidebarProfile } from "@/components/ProfileSidebar";
import ProfileWorksSection from "@/components/ProfileWorksSection";

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
    logger.error("[Profile] Fetch error", profileError, {
      code: profileError.code,
      message: profileError.message,
    });
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
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md font-be-vietnam">
          <div className="w-20 h-20 bg-[#134e4a] rounded-full flex items-center justify-center mx-auto shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="#faf8f5"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-ganh font-bold text-deep-teal tracking-tight lowercase">
            không tìm thấy hồ sơ
          </h1>
          <p className="text-ink-charcoal/70 font-medium">
            Hồ sơ này không tồn tại hoặc đã bị vô hiệu hóa.
          </p>
          <LinkedButton
            href="/"
            className="mt-8 border border-[#eae6e1] bg-white text-ink-charcoal px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-[#faf8f5] hover:border-deep-teal/20 transition-all shadow-sm"
          >
            quay lại trang chủ
          </LinkedButton>
        </div>
      </div>
    );
  }

  if (finalProfile.is_private && !isOwner) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md font-be-vietnam">
          <div className="w-20 h-20 bg-[#134e4a] rounded-full flex items-center justify-center mx-auto shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="#faf8f5"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25-2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-ganh font-bold text-deep-teal tracking-tight lowercase">
            người dùng đã khoá tài khoản
          </h1>
          <p className="text-ink-charcoal/70 font-medium">
            Hồ sơ này đã được chủ sở hữu đặt ở chế độ riêng tư.
          </p>
          <LinkedButton
            href="/"
            className="mt-8 border border-[#eae6e1] bg-white text-ink-charcoal px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-[#faf8f5] hover:border-deep-teal/20 transition-all shadow-sm"
          >
            quay lại trang chủ
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
  const [worksResult, contributionsResult, savedWorksResult, worksCountResult] = await Promise.all([
    worksQuery,
    supabase.from("contributions").select("*, works(*)").eq("user_id", targetId),
    isOwner
      ? supabase
        .from("saved_works")
        .select("*, work:works(*)")
        .eq("user_id", targetId)
        .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase
      .from("works")
      .select("id", { count: "exact", head: true })
      .eq("created_by", targetId),
  ]);

  const rawCreatedWorks = worksResult.data;
  const contributions = contributionsResult.data;
  const savedWorksData = savedWorksResult.data;
  const worksCount = worksCountResult.count || 0;

  const createdWorks = (rawCreatedWorks || []).map(sanitizeWork);

  const contributionsCount = contributions?.length || 0;
  const totalCopies = (contributions || []).reduce(
    (sum, c: { copy_count?: number | null }) => sum + (c.copy_count || 0),
    0
  );
  const inkPoints = contributionsCount * 10 + totalCopies * 5 + worksCount * 15;
  const uniqueWorksCount = new Set((contributions || []).map((c) => c.work_id)).size;

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
        return sanitizeWork(finalWork as unknown as WorkLike);
      })
      .filter(Boolean) as Work[];
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] p-4 md:p-8 md:pb-24">
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
          }).replace(/</g, "\\u003c"),
        }}
      />
      <section className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar */}
        <ProfileSidebar
          key={finalProfile.id}
          profile={finalProfile}
          isOwner={isOwner}
          currentUser={currentUser}
          inkPoints={inkPoints}
        />

        {/* Main Content */}
        <div className="flex-grow w-full lg:w-2/3">
          {/* Quick Stats Block */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 font-be-vietnam">
            <div className="bg-[#fcfaf8] rounded-2xl p-6 border border-[#eae6e1] flex flex-col justify-between min-h-[120px] transition-all duration-300 hover:border-[#134e4a]/20 shadow-sm">
              <span className="text-xs font-semibold text-ink-charcoal/50 uppercase tracking-wider block">
                Câu đã chắp bút
              </span>
              <span className="font-ganh font-bold text-4xl text-ink-charcoal mt-2">
                {contributionsCount}
              </span>
            </div>

            <div className="bg-[#fcfaf8] rounded-2xl p-6 border border-[#eae6e1] flex flex-col justify-between min-h-[120px] transition-all duration-300 hover:border-[#134e4a]/20 shadow-sm">
              <span className="text-xs font-semibold text-ink-charcoal/50 uppercase tracking-wider block">
                Tác phẩm tham gia
              </span>
              <span className="font-ganh font-bold text-4xl text-ink-charcoal mt-2">
                {uniqueWorksCount}
              </span>
            </div>

            <div className="bg-[#134e4a] text-[#faf8f5] rounded-2xl p-6 border border-[#134e4a] flex flex-col justify-between min-h-[120px] transition-all duration-300 hover:bg-[#003633] shadow-sm">
              <span className="text-xs font-semibold text-[#faf8f5]/70 uppercase tracking-wider block">
                Số Giọt mực đã tích lũy
              </span>
              <span className="font-ganh font-bold text-4xl text-[#faf8f5] mt-2 flex items-center gap-2">
                {inkPoints}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 text-[#faf8f5]/85 shrink-0"
                >
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </span>
            </div>
          </div>

          <ProfileWorksSection
            createdWorks={createdWorks}
            contributedWorksList={contributedWorksList}
            savedWorksList={savedWorksList}
            isOwner={isOwner}
          />
        </div>
      </section>
    </div>
  );
}
