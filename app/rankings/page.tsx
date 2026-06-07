import React from "react";
import { createClient } from "@/utils/supabase/server";
import { logger } from "@/lib/logger";
import { Metadata } from "next";
import Link from "next/link";
import { getLevelInfo } from "@/utils/levels";

export const metadata: Metadata = {
  title: "Bảng vàng",
  description: "Bảng vinh danh những người đóng góp tích cực nhất của Đồng Ngôn.",
};

interface UserRank {
  id: string;
  nickname: string;
  avatarUrl?: string;
  contributionsCount: number;
  totalCopies: number;
  worksCount: number;
  inkPoints: number;
}

// Minimalist Drop SVG Icon for "Giọt mực"
const DropIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg
    className={`${className} inline-block text-current fill-current mr-1 align-text-bottom`}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2.5C12 2.5 6 9 6 14c0 3.31 2.69 6 6 6s6-2.69 6-6c0-5-6-11.5-6-11.5z" />
  </svg>
);

export default async function RankingsPage() {
  const supabase = await createClient();
  let rankings: UserRank[] = [];
  let currentUser: import("@supabase/supabase-js").User | null = null;
  let personalRank = "N/A";
  let personalProfile: UserRank | null = null;

  try {
    // Fetch logged in user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    currentUser = user;

    // 1. Fetch non-hidden profiles
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, nickname, avatar_url, is_hidden")
      .neq("is_hidden", true);

    // 1.1 Fetch public test accounts to exclude them
    const { data: testAccounts, error: testError } = await supabase
      .from("public_test_accounts")
      .select("id");

    if (profileError) {
      logger.error("[RankingsPage] Error fetching profiles:", profileError);
    }
    if (testError) {
      logger.error("[RankingsPage] Error fetching test accounts:", testError);
    }

    const testIds = new Set((testAccounts || []).map((t) => t.id));

    if (profiles && profiles.length > 0) {
      // 2. Fetch all contributions to aggregate (try with copy_count first)
      let contribs: { user_id: string; copy_count?: number | null }[] = [];
      const { data: contributions, error: contribError } = await supabase
        .from("contributions")
        .select("user_id, copy_count");

      if (contribError) {
        // Fallback if copy_count column does not exist
        if (
          contribError.message?.includes("copy_count") ||
          contribError.message?.includes("does not exist")
        ) {
          logger.warn(
            "[RankingsPage] copy_count column does not exist, falling back to query without it."
          );
          const { data: fallbackContribs, error: fallbackError } = await supabase
            .from("contributions")
            .select("user_id");

          if (fallbackError) {
            logger.error("[RankingsPage] Error fetching contributions fallback:", fallbackError);
          } else {
            contribs = (fallbackContribs || []).map((c) => ({ ...c, copy_count: 0 }));
          }
        } else {
          logger.error("[RankingsPage] Error fetching contributions:", contribError);
        }
      } else {
        contribs = contributions || [];
      }

      // 2.1 Fetch all works to count user creations
      const { data: works, error: worksError } = await supabase.from("works").select("created_by");

      if (worksError) {
        logger.error("[RankingsPage] Error fetching works:", worksError);
      }

      const allWorks = works || [];

      // 3. Aggregate data excluding test accounts
      rankings = profiles
        .filter((p) => !testIds.has(p.id))
        .map((p) => {
          const userContribs = contribs.filter((c) => c.user_id === p.id);
          const contributionsCount = userContribs.length;
          const totalCopies = userContribs.reduce((sum, c) => sum + (c.copy_count || 0), 0);
          const userWorks = allWorks.filter((w) => w.created_by === p.id);
          const worksCount = userWorks.length;

          // Formula: 10 per contribution, 5 per copy, 15 per work created
          const inkPoints = contributionsCount * 10 + totalCopies * 5 + worksCount * 15;

          return {
            id: p.id,
            nickname: p.nickname || "Ẩn danh",
            avatarUrl: p.avatar_url,
            contributionsCount,
            totalCopies,
            worksCount,
            inkPoints,
          };
        });

      // Filter out users with 0 ink points and sort
      rankings = rankings.filter((r) => r.inkPoints > 0).sort((a, b) => b.inkPoints - a.inkPoints);
    }
  } catch (err) {
    logger.error("[RankingsPage] Unexpected error:", err);
  }

  // Get Top 3 contributors if available (no fallbacks)
  const top1 = rankings[0] || null;
  const top2 = rankings[1] || null;
  const top3 = rankings[2] || null;

  const top1Level = top1 ? getLevelInfo(top1.inkPoints).currentLevel : null;
  const top2Level = top2 ? getLevelInfo(top2.inkPoints).currentLevel : null;
  const top3Level = top3 ? getLevelInfo(top3.inkPoints).currentLevel : null;

  // Rest of rankings (from 4th place onwards)
  const remainingRankings = rankings.slice(3);

  // Find personal stats
  let userPoints = 0;
  if (currentUser) {
    const idx = rankings.findIndex((r) => r.id === currentUser.id);
    if (idx !== -1) {
      personalRank = `#${idx + 1}`;
      personalProfile = rankings[idx];
      userPoints = personalProfile.inkPoints;
    }
  }

  const { currentLevel, nextLevel, progressPercent } = getLevelInfo(userPoints);

  // Helper for rendering initials
  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1b1a] py-16 md:py-24 px-6 md:px-16 font-be-vietnam">
      <div className="max-w-[1440px] mx-auto">
        {/* Header Section (Matched layout from Kho tàng) */}
        <div className="text-left mb-16 border-b border-[#eae6e1] pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-[2px] bg-[#1c1b1a]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#1c1b1a]/40">
              BẢNG VÀNG
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-ganh font-bold text-[#1c1b1a] leading-[1.1] tracking-tight lowercase">
            bảng thành tích
          </h1>
          <p className="font-be-vietnam text-sm md:text-base text-[#1c1b1a]/70 max-w-2xl mt-4 font-light leading-relaxed">
            Quy luật tính số giọt mực: <br />
            • Viết một câu: 10 Giọt
            <br />
            • Câu văn được sao chép: 5 Giọt
            <br />
            • Tạo tác phẩm mới: 15 Giọt
          </p>
        </div>

        {rankings.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-black/15 bg-white rounded-[12px] p-8 max-w-lg mx-auto">
            <div className="mb-6 text-black/20">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                />
              </svg>
            </div>
            <h2 className="font-ganh font-bold text-2xl text-black mb-3">Chưa có vết mực nào</h2>
            <p className="font-be-vietnam text-sm text-black/55 mb-8 max-w-[320px] leading-relaxed">
              Nơi lưu giữ những tác phẩm tự do và tràn đầy cảm xúc. Hãy là người đầu tiên đặt bút viết.
            </p>
            <Link
              href="/kho-tang"
              className="px-6 py-3 bg-black text-white hover:bg-black/85 text-[10px] font-bold uppercase tracking-widest rounded-[6px] transition-all cursor-pointer"
            >
              Viết ngay
            </Link>
          </div>
        ) : (
          <>
            {/* Bento Grid Top 3 Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 pt-4 items-end">
              {/* Hạng 2 (Bên trái/Dưới 1 bậc) */}
              {top2 ? (
                <Link
                  href={`/profile?id=${top2.id}`}
                  className="flex flex-col bg-[#fcfaf8] rounded-2xl p-6 border border-[#eae6e1] justify-between min-h-[260px] hover:-translate-y-1 hover:border-[#134e4a]/20 transition-all duration-300 shadow-[0_4px_20px_rgba(28,27,26,0.02)] active:scale-[0.98] outline-none"
                >
                  <div className="flex justify-between items-start mb-4">
                    {top2Level && (
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md border ${top2Level.bgClass} ${top2Level.textClass} ${top2Level.borderClass}`}>
                        {top2Level.name}
                      </span>
                    )}
                    <span className="font-mono text-xs font-bold text-[#1c1b1a]/40">#2</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {top2.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={top2.avatarUrl}
                        alt={top2.nickname}
                        className="w-14 h-14 rounded-2xl object-cover border border-[#eae6e1]"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-white border border-[#eae6e1] flex items-center justify-center text-[#1c1b1a]/50 font-ganh font-bold text-lg uppercase shadow-sm">
                        {getInitials(top2.nickname)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-ganh font-bold text-lg text-[#1c1b1a] line-clamp-1">
                        {top2.nickname}
                      </h3>
                      <p className="text-xs text-[#1c1b1a]/50 font-light font-be-vietnam mt-0.5">
                        {top2.contributionsCount || 0} câu • {top2.worksCount || 0} tác phẩm
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 border-t border-[#eae6e1] pt-4 flex justify-between items-center">
                    <span className="text-[10px] text-[#1c1b1a]/40 font-bold tracking-wider uppercase">
                      Tích lũy
                    </span>
                    <span className="text-sm font-mono font-bold text-[#1c1b1a] flex items-center">
                      <DropIcon /> {top2.inkPoints || 0}
                    </span>
                  </div>
                </Link>
              ) : (
                /* Placeholders for missing Top 2 */
                <div className="flex flex-col justify-center items-center border border-dashed border-[#eae6e1] bg-[#fcfaf8]/50 rounded-2xl p-6 min-h-[260px] text-center">
                  <span className="text-xs text-[#1c1b1a]/30 font-medium font-be-vietnam">
                    Vị trí chờ
                  </span>
                </div>
              )}

              {/* Hạng 1 (Ở giữa - Quán Quân) - Lớn hơn & dùng Double Bezel và md:-translate-y-4 */}
              {top1 ? (
                <Link
                  href={`/profile?id=${top1.id}`}
                  className="flex flex-col min-h-[300px] p-1.5 bg-[#fcfaf8] border border-[#eae6e1] rounded-3xl hover:-translate-y-2 transition-all duration-300 shadow-[0_8px_32px_rgba(212,175,55,0.06)] relative md:-translate-y-4 active:scale-[0.98] outline-none"
                >
                  <div className="flex-1 flex flex-col justify-between bg-white rounded-[18px] border border-[#d4af37]/20 p-6 relative">
                    <div className="flex justify-between items-start mb-4">
                      {top1Level && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md border ${top1Level.bgClass} ${top1Level.textClass} ${top1Level.borderClass}`}>
                          {top1Level.name}
                        </span>
                      )}
                      <span className="font-mono text-xs font-bold text-[#d4af37]">#1</span>
                    </div>
                    <div className="flex items-center gap-4 my-2">
                      {top1.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={top1.avatarUrl}
                          alt={top1.nickname}
                          className="w-16 h-16 rounded-2xl object-cover border border-[#d4af37]/20"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/5 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] font-ganh font-bold text-xl uppercase shadow-sm">
                          {getInitials(top1.nickname)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-ganh font-bold text-xl text-[#1c1b1a] line-clamp-1">
                          {top1.nickname}
                        </h3>
                        <p className="text-xs text-[#d4af37] font-medium font-be-vietnam mt-0.5">
                          {top1.contributionsCount || 0} câu • {top1.worksCount || 0} tác phẩm
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 border-t border-[#eae6e1] pt-4 flex justify-between items-center">
                      <span className="text-[10px] text-[#1c1b1a]/40 font-bold tracking-wider uppercase">
                        Tích lũy
                      </span>
                      <span className="text-base font-mono font-bold text-[#d4af37] flex items-center">
                        <DropIcon className="text-[#d4af37]" /> {top1.inkPoints || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              ) : (
                /* Placeholders for missing Top 1 */
                <div className="flex flex-col justify-center items-center border border-dashed border-[#eae6e1] bg-[#fcfaf8]/50 rounded-2xl p-6 min-h-[300px] text-center md:-translate-y-4">
                  <span className="text-xs text-[#1c1b1a]/30 font-medium font-be-vietnam">
                    Ngôi vị chưa tìm thấy chủ nhân
                  </span>
                </div>
              )}

              {/* Hạng 3 (Bên phải/Dưới 1 bậc) */}
              {top3 ? (
                <Link
                  href={`/profile?id=${top3.id}`}
                  className="flex flex-col bg-[#fcfaf8] rounded-2xl p-6 border border-[#eae6e1] justify-between min-h-[260px] hover:-translate-y-1 hover:border-[#134e4a]/20 transition-all duration-300 shadow-[0_4px_20px_rgba(28,27,26,0.02)] active:scale-[0.98] outline-none"
                >
                  <div className="flex justify-between items-start mb-4">
                    {top3Level && (
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md border ${top3Level.bgClass} ${top3Level.textClass} ${top3Level.borderClass}`}>
                        {top3Level.name}
                      </span>
                    )}
                    <span className="font-mono text-xs font-bold text-[#1c1b1a]/40">#3</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {top3.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={top3.avatarUrl}
                        alt={top3.nickname}
                        className="w-14 h-14 rounded-2xl object-cover border border-[#eae6e1]"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-white border border-[#eae6e1] flex items-center justify-center text-[#1c1b1a]/50 font-ganh font-bold text-lg uppercase shadow-sm">
                        {getInitials(top3.nickname)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-ganh font-bold text-lg text-[#1c1b1a] line-clamp-1">
                        {top3.nickname}
                      </h3>
                      <p className="text-xs text-[#1c1b1a]/50 font-light font-be-vietnam mt-0.5">
                        {top3.contributionsCount || 0} câu • {top3.worksCount || 0} tác phẩm
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 border-t border-[#eae6e1] pt-4 flex justify-between items-center">
                    <span className="text-[10px] text-[#1c1b1a]/40 font-bold tracking-wider uppercase">
                      Tích lũy
                    </span>
                    <span className="text-sm font-mono font-bold text-[#1c1b1a] flex items-center">
                      <DropIcon /> {top3.inkPoints || 0}
                    </span>
                  </div>
                </Link>
              ) : (
                /* Placeholders for missing Top 3 */
                <div className="flex flex-col justify-center items-center border border-dashed border-[#eae6e1] bg-[#fcfaf8]/50 rounded-2xl p-6 min-h-[260px] text-center">
                  <span className="text-xs text-[#1c1b1a]/30 font-medium font-be-vietnam">
                    Vị trí chờ
                  </span>
                </div>
              )}
            </div>

            {/* 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Cột Trái (Tất cả Tác Giả) - Chiếm 2 phần */}
              <div className="lg:col-span-2 bg-[#fcfaf8] rounded-2xl p-6 md:p-8 border border-[#eae6e1] flex flex-col justify-between shadow-[0_4px_20px_rgba(28,27,26,0.02)]">
                <div>
                  <div className="flex justify-between items-center mb-8 border-b border-[#eae6e1] pb-4">
                    <h2 className="font-ganh font-bold text-xl md:text-2xl text-[#1c1b1a]">
                      Danh sách thứ hạng
                    </h2>
                    {/* Minimalist Tab indicator */}
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#1c1b1a]/60 bg-[#eae6e1]/40 px-3 py-1.5 rounded-md border border-[#eae6e1]">
                      Tất cả thời gian
                    </div>
                  </div>

                  {remainingRankings.length === 0 ? (
                    <div className="text-center text-[#1c1b1a]/40 py-16 font-light font-be-vietnam text-sm">
                      Chưa có thành viên xếp hạng thêm.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#eae6e1]/50">
                      {remainingRankings.map((user, idx) => {
                        const rank = idx + 4;
                        const userLevel = getLevelInfo(user.inkPoints).currentLevel;
                        return (
                          <Link
                            key={user.id}
                            href={`/profile?id=${user.id}`}
                            className="flex items-center py-4 hover:bg-[#134e4a]/5 rounded-xl px-3 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] outline-none"
                          >
                            {/* Rank Number */}
                            <div className="w-10 flex justify-center text-[#1c1b1a]/40 font-mono text-xs">
                              #{rank}
                            </div>

                            {/* Avatar & Name */}
                            <div className="flex-grow pl-4 flex items-center gap-3">
                              {user.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={user.avatarUrl}
                                  alt={user.nickname}
                                  className="w-9 h-9 rounded-xl object-cover border border-[#eae6e1]"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-white border border-[#eae6e1] flex items-center justify-center text-[#1c1b1a]/50 font-bold text-xs uppercase font-ganh shadow-sm">
                                  {getInitials(user.nickname)}
                                </div>
                              )}
                              <div>
                                <span className="font-ganh font-bold text-base text-[#1c1b1a] block font-sans">
                                  {user.nickname}
                                </span>
                                <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border mt-1 ${userLevel.bgClass} ${userLevel.textClass} ${userLevel.borderClass}`}>
                                  {userLevel.name}
                                </span>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="w-32 text-right text-xs text-[#1c1b1a]/40 font-light hidden sm:block">
                              {user.contributionsCount || 0} câu • {user.worksCount || 0}{" "}
                              truyện
                            </div>

                            {/* Points */}
                            <div className="w-28 text-right font-mono text-sm font-bold text-[#1c1b1a] flex items-center justify-end">
                              <DropIcon /> {user.inkPoints || 0}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Cột Phải (Thành Tích Cá Nhân) - Chiếm 1 phần */}
              <div className="flex flex-col gap-8">
                {/* Personal Stats Card */}
                <div className="bg-[#fcfaf8] rounded-2xl p-6 md:p-8 border border-[#eae6e1] shadow-[0_4px_20px_rgba(28,27,26,0.02)]">
                  <h2 className="font-ganh font-bold text-lg md:text-xl text-[#1c1b1a] mb-6 pb-2 border-b border-[#eae6e1]">
                    Thành tích của bạn
                  </h2>

                  {currentUser ? (
                    <div className="space-y-6">
                      {/* User Profile Info */}
                      <div className="flex items-center gap-4">
                        {currentUser.user_metadata?.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={currentUser.user_metadata.avatar_url}
                            alt="Avatar"
                            className="w-12 h-12 rounded-xl object-cover border border-[#eae6e1]"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-white border border-[#eae6e1] flex items-center justify-center text-[#1c1b1a] font-bold text-lg font-ganh shadow-sm">
                            {getInitials(
                              currentUser.user_metadata?.nickname || currentUser.email || "U"
                            )}
                          </div>
                        )}
                        <div>
                          <span className="font-ganh font-bold text-lg text-[#1c1b1a] block leading-none">
                            {currentUser.user_metadata?.nickname || "Bạn"}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border mt-1.5 inline-block ${currentLevel.bgClass} ${currentLevel.textClass} ${currentLevel.borderClass}`}>
                            {currentLevel.name}
                          </span>
                        </div>
                      </div>

                      {/* Level Progress Bar */}
                      <div className="pt-2 border-t border-[#eae6e1]">
                        <div className="flex justify-between items-center text-xs font-semibold text-[#1c1b1a]/50 mb-1.5 font-be-vietnam">
                          <span>Tiến trình thăng cấp</span>
                          <span className="font-mono flex items-center">
                            <DropIcon className="w-3 h-3" /> {userPoints} {nextLevel ? `/ ${nextLevel.minPoints}` : ""}
                          </span>
                        </div>
                        <div className="w-full bg-[#eae6e1] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#134e4a] h-full transition-all duration-500 rounded-full"
                            style={{
                              width: `${progressPercent}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#eae6e1]">
                        <div className="bg-white p-4 rounded-xl border border-[#eae6e1] text-center shadow-sm">
                          <span className="text-[9px] text-[#1c1b1a]/40 uppercase tracking-wider block font-bold mb-1 font-be-vietnam">
                            Thứ hạng
                          </span>
                          <span className="font-mono font-bold text-2xl text-[#1c1b1a]">
                            {personalRank}
                          </span>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-[#eae6e1] text-center flex flex-col justify-center items-center shadow-sm">
                          <span className="text-[9px] text-[#1c1b1a]/40 uppercase tracking-wider block font-bold mb-1 font-be-vietnam">
                            Số Giọt mực
                          </span>
                          <span className="font-mono font-bold text-2xl text-[#1c1b1a] flex items-center">
                            <DropIcon className="w-5 h-5 text-[#1c1b1a]" />{" "}
                            {personalProfile?.inkPoints || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-[#1c1b1a]/70 mb-6 leading-relaxed font-light font-sans">
                        Đăng nhập để xem vị trí của bạn trên Bảng Vàng và theo dõi điểm Giọt mực.
                      </p>
                      <Link
                        href="/dang-nhap"
                        className="w-full text-center block py-3 bg-[#134e4a] text-[#faf8f5] hover:bg-[#003633] text-[10px] font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer shadow-sm"
                      >
                        Đăng nhập ngay
                      </Link>
                    </div>
                  )}
                </div>

                {/* Inspirational Quote widget */}
                <div className="bg-[#fcfaf8] rounded-2xl p-8 border border-[#eae6e1] flex flex-col justify-between min-h-[180px] relative overflow-hidden shadow-[0_4px_20px_rgba(28,27,26,0.02)]">
                  <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]" />
                  <div className="text-[#1c1b1a]/5 text-6xl absolute top-4 left-4 font-serif select-none pointer-events-none">
                    “
                  </div>
                  <div className="relative z-10 flex-grow flex items-center mb-6 pt-4">
                    <p className="italic text-[#1c1b1a]/70 text-sm md:text-base leading-relaxed font-serif">
                      &ldquo;Văn học là nguồn cội của mọi nghệ thuật.&rdquo;
                    </p>
                  </div>
                  <div className="border-t border-[#eae6e1] pt-3 text-right relative z-10">
                    <span className="font-ganh text-xs font-bold text-[#1c1b1a]/60">
                      — Hồ Chí Minh
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
