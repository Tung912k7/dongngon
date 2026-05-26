import React from "react";
import { LinkedButton } from "./PrimaryButton";
import { createClient } from "@/utils/supabase/server";
import { logger } from "@/lib/logger";

interface ContributionData {
  user_id: string;
}

interface ProfileData {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
}

interface TestAccount {
  id: string;
}

interface TopContributor {
  id: string;
  name: string;
  avatar: string;
  contributions: number;
  isTest: boolean;
  rank: number;
}

const RankingsPreview = async () => {
  const supabase = await createClient();
  let topContributors: TopContributor[] = [];

  try {
    // Fetch contributions
    const { data: contributions, error: contribError } = await supabase
      .from("contributions")
      .select("user_id");

    // Fetch profiles (excluding hidden ones)
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, nickname, avatar_url")
      .neq("is_hidden", true);

    // Fetch public_test_accounts view to identify test accounts
    const { data: testAccounts, error: testError } = await supabase
      .from("public_test_accounts")
      .select("id");

    if (contribError || profileError || testError) {
      logger.error("Error fetching rankings data", contribError || profileError || testError);
    } else {
      // Aggregate contributions
      const counts: Record<string, number> = {};
      contributions?.forEach((c: ContributionData) => {
        counts[c.user_id] = (counts[c.user_id] || 0) + 1;
      });

      // Map to component structure
      topContributors =
        profiles
          ?.map((p: ProfileData) => {
            const isTest = testAccounts?.some((d: TestAccount) => d.id === p.id);
            return {
              id: p.id,
              name: p.nickname || "Vô danh",
              avatar: p.nickname ? p.nickname.charAt(0).toUpperCase() : "U",
              contributions: counts[p.id] || 0,
              isTest: isTest || false,
            };
          })
          .filter((u) => u.contributions > 0 && !u.isTest)
          .sort((a, b) => b.contributions - a.contributions)
          .map((u, index: number): TopContributor => ({ ...u, rank: index + 1 }))
          .slice(0, 3) || [];
    }
  } catch (error) {
    logger.error("Unexpected error in RankingsPreview", error);
  }

  return (
    <section className="py-20 md:py-32 bg-white text-black font-['Be_Vietnam_Pro'] relative overflow-hidden border-t-2 border-black">
      {/* Subtle grid line to match theme */}
      <div
        className="absolute inset-0 z-0 opacity-[0.1]"
        style={{
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black mb-4">
            Những kẻ chăm chỉ
          </h2>
          <div className="w-24 h-2 bg-literary-gold mx-auto mb-6" />
          <p className="text-lg text-black/70 max-w-2xl mx-auto">
            Những người dùng chăm chỉ và cần mẫn
          </p>
        </div>

        {/* Rankings List */}
        <div className="border-4 border-black bg-white mb-12">
          {topContributors.length === 0 ? (
            <div className="p-6 text-center text-black/50">Chưa có dữ liệu đóng góp.</div>
          ) : (
            topContributors.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-6 ${index !== topContributors.length - 1 ? "border-b-2 border-black" : ""
                  } hover:bg-gray-50 transition-colors`}
              >
                <div className="flex items-center gap-6">
                  {/* Rank Number */}
                  <span
                    className={`text-3xl md:text-4xl font-black ${user.rank === 1 ? "text-literary-gold" : "text-black"
                      }`}
                  >
                    #{user.rank}
                  </span>

                  {/* Avatar Placeholder */}
                  <div
                    className={`w-12 h-12 flex items-center justify-center font-bold text-white ${user.rank === 1 ? "bg-literary-gold" : "bg-black"
                      }`}
                  >
                    {user.avatar}
                  </div>

                  {/* User Info */}
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-black">{user.name}</h3>
                    <p className="text-sm text-black/50">Người dùng tích cực</p>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <span className="text-xl md:text-2xl font-black text-black">
                    {user.contributions}
                  </span>
                  <p className="text-xs uppercase tracking-widest font-bold text-black/50">
                    Câu đóng góp
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center">
          <LinkedButton
            href="/rankings"
            className="!px-10 !py-4 text-xl font-bold uppercase tracking-widest border-2 border-black transition-all"
          >
            Xem bảng xếp hạng đầy đủ
          </LinkedButton>
        </div>
      </div>
    </section>
  );
};

export default RankingsPreview;
