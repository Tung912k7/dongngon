import React from "react";
import { createClient } from "@/utils/supabase/server";
import { logger } from "@/lib/logger";
import { formatDate } from "@/utils/date";
import OpenProjectsSlider from "./OpenProjectsSlider";

const STATUS_DB_TO_UI: Record<string, string> = {
  writing: "Đang viết",
  finished: "Hoàn thành",
  pending: "Đợi duyệt",
};

interface WorkItem {
  id: string;
  title: string;
  category_type: string;
  sub_category: string;
  limit_type?: string;
  status: string;
  author_nickname: string;
  created_by: string;
  created_at: string;
  age_rating?: string;
  description?: string;
  // Mapped properties for Work interface compatibility
  type: string;
  hinh_thuc: string;
  rule: string;
  date: string;
  rawDate: Date;
  is_author_private?: boolean;
}

export default async function OpenProjects() {
  const supabase = await createClient();
  let activeWorks: (WorkItem & {
    contributors: string[];
    contributorCount: number;
    sentenceCount: number;
    isSavedByUser: boolean;
  })[] = [];

  let userId: string | null = null;

  try {
    // 1. Fetch current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
    }

    // 2. Fetch hidden profiles to filter them out
    const { data: hiddenProfiles, error: hiddenError } = await supabase
      .from("profiles")
      .select("id")
      .eq("is_hidden", true);

    if (hiddenError) {
      logger.error("[OpenProjects] Error fetching hidden profiles", hiddenError);
    }
    const hiddenUserIds = (hiddenProfiles || []).map((p) => p.id);

    // 3. Fetch 6 writing public works (limit increased from 3 to 6 for the slider)
    let query = supabase
      .from("works")
      .select(
        "id, title, category_type, sub_category, limit_type, status, age_rating, author_nickname, created_by, created_at, description"
      )
      .eq("status", "writing")
      .eq("privacy", "Public")
      .eq("is_test", false);

    if (hiddenUserIds.length > 0) {
      query = query.not("created_by", "in", `(${hiddenUserIds.join(",")})`);
    }

    const { data: works, error: worksError } = await query
      .order("created_at", { ascending: false })
      .limit(6);

    if (worksError) {
      logger.error("[OpenProjects] Error fetching works", worksError);
    } else if (works && works.length > 0) {
      const workIds = works.map((w) => w.id);

      // 4. Fetch contributions for these works to calculate stats
      const { data: contributions, error: contribError } = await supabase
        .from("contributions")
        .select("work_id, author_nickname")
        .in("work_id", workIds);

      if (contribError) {
        logger.error("[OpenProjects] Error fetching contributions", contribError);
      }

      // 5. Fetch saved status for current user if logged in
      let savedWorkIds: string[] = [];
      if (user) {
        const { data: savedWorksData, error: savedError } = await supabase
          .from("saved_works")
          .select("work_id")
          .eq("user_id", user.id)
          .in("work_id", workIds);

        if (savedError) {
          logger.error("[OpenProjects] Error fetching saved works", savedError);
        } else if (savedWorksData) {
          savedWorkIds = savedWorksData.map((sw) => sw.work_id);
        }
      }

      // Map stats and saved status
      activeWorks = works.map((work) => {
        const workContribs = contributions?.filter((c) => c.work_id === work.id) || [];
        const uniqueContributors = Array.from(new Set(workContribs.map((c) => c.author_nickname)));

        return {
          ...work,
          contributors: uniqueContributors,
          contributorCount: uniqueContributors.length || 1, // Fallback to 1
          sentenceCount: workContribs.length,
          isSavedByUser: savedWorkIds.includes(work.id),
          // Mapped properties for Work interface (needed by WorkPreviewModal)
          type: work.category_type || "",
          hinh_thuc: work.sub_category || "",
          rule: work.limit_type === "sentence" ? "1 câu" : work.limit_type || "1 câu",
          age_rating: work.age_rating ?? undefined,
          status: STATUS_DB_TO_UI[work.status] || work.status,
          date: formatDate(work.created_at),
          rawDate: new Date(work.created_at),
          is_author_private: false,
          description: work.description ?? undefined,
        };
      });
    }
  } catch (err) {
    logger.error("[OpenProjects] Unexpected error", err);
  }

  return <OpenProjectsSlider works={activeWorks} userId={userId} />;
}
