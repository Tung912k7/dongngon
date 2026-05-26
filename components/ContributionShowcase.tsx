import React from "react";
import { LinkedButton } from "./PrimaryButton";
import { createClient } from "@/utils/supabase/server";
import { logger } from "@/lib/logger";

interface Work {
  id: string;
  title: string;
  author_nickname: string;
  created_by?: string;
}

interface Contribution {
  work_id: string;
  content: string;
  author_nickname: string;
}

interface Sentence {
  text: string;
  author: string;
}

interface Story {
  id: string;
  title: string;
  contributors: number;
  sentences: Sentence[];
}

const ContributionShowcase = async () => {
  const supabase = await createClient();
  let stories: Story[] = [];

  try {
    // Fetch hidden profiles
    const { data: hiddenProfiles, error: hiddenError } = await supabase
      .from("profiles")
      .select("id")
      .eq("is_hidden", true);

    if (hiddenError) {
      logger.error("Error fetching hidden profiles for showcase", hiddenError);
    }

    const hiddenUserIds = (hiddenProfiles || []).map((p) => p.id);

    // Fetch 2 public works, excluding those by hidden users
    let query = supabase
      .from("works")
      .select("id, title, author_nickname, created_by")
      .eq("privacy", "Public")
      .eq("is_test", false);

    if (hiddenUserIds.length > 0) {
      query = query.not("created_by", "in", `(${hiddenUserIds.join(",")})`);
    }

    const { data: works, error: worksError } = await query.limit(2);

    if (worksError) {
      logger.error("Error fetching works for showcase", worksError);
    } else if (works && works.length > 0) {
      // Fetch contributions for these works
      const workIds = works.map((w: Work) => w.id);
      const { data: contributions, error: contribError } = await supabase
        .from("contributions")
        .select("work_id, content, author_nickname")
        .in("work_id", workIds)
        .order("created_at", { ascending: true });

      if (contribError) {
        logger.error("Error fetching contributions for showcase", contribError);
      } else {
        // Map to component structure
        stories = works.map((work: Work) => {
          const workContribs = contributions?.filter((c: Contribution) => c.work_id === work.id) || [];

          // Count unique contributors
          const uniqueContributors = new Set(workContribs.map((c: Contribution) => c.author_nickname)).size;

          return {
            id: work.id,
            title: work.title,
            contributors: uniqueContributors,
            sentences: workContribs.map((c: Contribution) => ({
              text: c.content,
              author: c.author_nickname || "Vô danh",
            })),
          };
        });
      }
    }
  } catch (error) {
    logger.error("Unexpected error in ContributionShowcase", error);
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black mb-4">
            Lịch sử đóng góp
          </h2>
          <div className="w-24 h-2 bg-literary-gold mx-auto mb-6" />
          <p className="text-lg text-black/70 max-w-2xl mx-auto">
            Quá trình hình thành của các tác phẩm
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {stories.length === 0 ? (
            <div className="col-span-2 text-center text-black/50">Chưa có tác phẩm nào :( </div>
          ) : (
            stories.map((story) => (
              <div
                key={story.id}
                className="border-4 border-black p-6 md:p-8 bg-white flex flex-col justify-between min-h-[350px]"
              >
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold uppercase tracking-tight text-black">
                      {story.title}
                    </h3>
                    <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 border-2 border-black bg-black text-white">
                      {story.contributors} người viết
                    </span>
                  </div>

                  {/* Story Chain */}
                  <div className="space-y-4 mb-6">
                    {story.sentences.map((sentence: Sentence, index: number) => (
                      <div
                        key={index}
                        className="relative pl-6 border-l-2 border-black/20 hover:border-literary-gold transition-colors py-1"
                      >
                        <div className="absolute left-[-5px] top-1/2 transform -translate-y-1/2 w-2 h-2 bg-black rounded-full" />
                        <p className="text-base md:text-lg text-black leading-relaxed">
                          &quot;{sentence.text}&quot;
                        </p>
                        <p className="text-xs text-black/50 mt-1 font-bold">— {sentence.author}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto">
                  <LinkedButton
                    href={`/work/${story.id}`}
                    inverse
                    className="w-full !py-3 font-bold uppercase tracking-widest text-sm border-2 border-black hover:bg-black hover:text-white transition-all"
                  >
                    Xem chi tiết & Tiếp nối
                  </LinkedButton>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-16">
          <LinkedButton
            href="/kho-tang"
            className="!px-10 !py-4 text-xl font-bold uppercase tracking-widest border-2 border-black transition-all"
          >
            Khám phá kho tàng
          </LinkedButton>
        </div>
      </div>
    </section>
  );
};

export default ContributionShowcase;
