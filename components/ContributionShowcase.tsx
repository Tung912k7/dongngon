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
          const workContribs =
            contributions?.filter((c: Contribution) => c.work_id === work.id) || [];

          // Count unique contributors
          const uniqueContributors = new Set(
            workContribs.map((c: Contribution) => c.author_nickname)
          ).size;

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
    <section className="pt-16 md:pt-24 pb-24 md:pb-32 bg-[#FAF8F5] relative overflow-hidden border-t border-ink-charcoal/[0.04]">
      {/* Subtle grid line to match theme */}
      <div
        className="absolute inset-0 z-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, var(--color-primary) 1px, transparent 1px), linear-gradient(to bottom, var(--color-primary) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="max-w-[1440px] mx-auto px-6 md:px-16 relative z-10 font-sans">
        <div className="text-center mb-16">
          {/* Crisp rectangle badge — no rounded-full */}
          <div className="inline-flex items-center rounded px-2.5 py-1 bg-deep-teal/[0.05] border border-deep-teal/12 text-[10px] uppercase tracking-[0.2em] font-medium text-deep-teal mb-3">
            Theo dòng thời gian
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-ink-charcoal tracking-tight mb-4">
            Những đóng góp gần đây
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {stories.length === 0 ? (
            <div className="col-span-2 text-center text-on-surface-variant/80 py-16 font-sans text-[15px] bg-ink-charcoal/[0.02] rounded-xl border border-dashed border-ink-charcoal/15">
              Chưa có tác phẩm nào nổi bật.
            </div>
          ) : (
            stories.map((story) => (
              <div
                key={story.id}
                className="group relative bg-[#fcfaf8] border border-ink-charcoal/[0.06] rounded-xl p-6 md:p-8 flex flex-col justify-between min-h-[350px] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01] hover:border-deep-teal/20 shadow-[0_4px_20px_rgba(19,78,74,0.02)] hover:shadow-[0_4px_20px_rgba(19,78,74,0.05)] active:scale-[0.995] active:opacity-95"
              >
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif font-bold text-xl md:text-2xl text-ink-charcoal leading-snug">
                      {story.title}
                    </h3>
                    {/* Contributor count — soft teal tag, crisp rounded-md */}
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 bg-[#134E4A]/[0.05] text-[#134E4A] border border-[#134E4A]/10 rounded-md font-sans whitespace-nowrap">
                      {story.contributors} người viết
                    </span>
                  </div>

                  {/* Story Chain — rounded bullets */}
                  <div className="space-y-4 mb-6">
                    {story.sentences.map((sentence: Sentence, index: number) => (
                      <div
                        key={index}
                        className="relative pl-6 border-l border-ink-charcoal/[0.06] hover:border-deep-teal/30 transition-all py-1 group/item active:bg-deep-teal/[0.02] active:pl-7 duration-150 rounded-r-md cursor-default select-text"
                      >
                        {/* Rounded bullet — desaturated teal */}
                        <div className="absolute left-[-3.5px] top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-deep-teal/40 rounded-full transition-transform group-hover/item:scale-125" />
                        <p className="text-[16px] text-ink-charcoal/80 italic leading-relaxed font-serif">
                          &quot;{sentence.text}&quot;
                        </p>
                        <p className="text-[11px] text-on-surface-variant/60 mt-1 font-semibold font-sans">
                          — {sentence.author}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-5 border-t border-ink-charcoal/[0.06]">
                  <LinkedButton
                    href={`/work/${story.id}`}
                    inverse
                    className="w-full font-sans font-medium text-[13px] tracking-wide hover:!bg-deep-teal hover:!text-white hover:!border-deep-teal/30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  >
                    Xem chi tiết & Tham gia
                  </LinkedButton>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-16">
          {/* CTA — crisp rounded-md, no rounded-full pill */}
          <LinkedButton
            href="/kho-tang"
            className="group inline-flex items-center gap-2.5 px-8 py-3 !bg-ink-charcoal !text-white hover:!bg-deep-teal active:!scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] !border-ink-charcoal/[0.12] hover:!border-deep-teal/30 font-sans font-medium text-[14px] tracking-wide"
          >
            <span>Khám phá kho tàng</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </LinkedButton>
        </div>
      </div>
    </section>
  );
};

export default ContributionShowcase;
