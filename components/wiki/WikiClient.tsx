"use client";

import { useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { WikiSectionRecord } from "@/types/wiki";
import WikiArticle from "@/components/wiki/WikiArticle";

type WikiClientProps = {
  sections: WikiSectionRecord[];
  errorMessage?: string | null;
};

type SortOption = "relevance" | "recent";

type ArticleMeta = {
  updatedAt: string | undefined;
  updatedAtLabel: string;
  owner: string;
  readTime: string;
  category: string;
};

type QuickStartCard = {
  id: "new-user" | "publishing" | "faq";
  title: string;
  description: string;
  icon: string;
  keywords: string[];
};

const QUICK_START_CARDS: QuickStartCard[] = [
  {
    id: "new-user",
    title: "Người mới bắt đầu",
    description: "Lộ trình làm quen nhanh để hiểu luồng sử dụng chính.",
    icon: "🚀",
    keywords: ["bat-dau", "new", "moi", "gioi-thieu", "onboarding"],
  },
  {
    id: "publishing",
    title: "Đăng bài và tương tác",
    description: "Quy tắc đăng nội dung, kiểm duyệt và cách tương tác đúng.",
    icon: "🧭",
    keywords: ["dang", "bai", "tuong-tac", "dong-gop", "contribute", "work"],
  },
  {
    id: "faq",
    title: "Câu hỏi thường gặp",
    description: "Tìm đáp án nhanh cho các vấn đề phổ biến nhất.",
    icon: "❓",
    keywords: ["faq", "hoi", "thuong-gap", "common", "help"],
  },
];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getDefaultSort(query: string): SortOption {
  return query.trim() ? "relevance" : "recent";
}

function normalizeSort(value: string | null, query: string): SortOption {
  if (value === "relevance" || value === "recent") {
    return value;
  }

  return getDefaultSort(query);
}

function safeValue(value: string | null) {
  return (value ?? "").trim();
}

function sectionMatchesKeywords(section: WikiSectionRecord, keywords: string[]) {
  const title = normalizeText(section.title);
  const slug = normalizeText(section.slug);
  return keywords.some((keyword) => title.includes(keyword) || slug.includes(keyword));
}

function formatDate(dateValue: string | undefined) {
  if (!dateValue) {
    return "Chưa có ngày cập nhật";
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return "Chưa có ngày cập nhật";
  }

  return parsed.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function estimateReadTime(contentMarkdown: string) {
  const words = contentMarkdown.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return `~${minutes} phút đọc`;
}

function getSectionHelperCopy(sectionTitle: string) {
  const normalized = normalizeText(sectionTitle);

  if (normalized.includes("bat dau")) {
    return "Những bài quan trọng nhất để bắt đầu đúng quy trình.";
  }
  if (normalized.includes("dong gop")) {
    return "Tập trung vào cách viết, tương tác và giữ đúng tinh thần cộng tác.";
  }
  if (normalized.includes("tai khoan")) {
    return "Quản lý hồ sơ, bảo mật và thiết lập tài khoản an toàn.";
  }

  return "Các bài viết cốt lõi trong chuyên mục này.";
}

function scoreArticleMatch(sectionTitle: string, title: string, summary: string, query: string) {
  if (!query) {
    return 0;
  }

  const normalizedSection = normalizeText(sectionTitle);
  const normalizedTitle = normalizeText(title);
  const normalizedSummary = normalizeText(summary);

  let score = 0;

  if (normalizedTitle === query) {
    score += 10;
  }
  if (normalizedTitle.includes(query)) {
    score += 6;
  }
  if (normalizedSummary.includes(query)) {
    score += 3;
  }
  if (normalizedSection.includes(query)) {
    score += 2;
  }

  return score;
}

function compareByRecent(leftDate: string | undefined, rightDate: string | undefined) {
  const left = leftDate ? new Date(leftDate).getTime() : 0;
  const right = rightDate ? new Date(rightDate).getTime() : 0;
  return right - left;
}

function resolveArticleMeta(article: WikiSectionRecord["articles"][number], sectionTitle: string): ArticleMeta {
  const readTime = estimateReadTime(article.contentMarkdown || "");
  const category = sectionTitle?.trim() || "General";

  return {
    updatedAt: article.updatedAt,
    updatedAtLabel: formatDate(article.updatedAt),
    owner: "DongNgon Team",
    readTime,
    category,
  };
}

export default function WikiClient({ sections, errorMessage = null }: WikiClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = safeValue(searchParams.get("q"));
  const category = safeValue(searchParams.get("category"));
  const article = safeValue(searchParams.get("article"));
  const sort = normalizeSort(searchParams.get("sort"), query);

  const updateUrlState = useCallback(
    (patch: Partial<Record<"q" | "category" | "sort" | "article", string | null>>) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      const applyValue = (key: "q" | "category" | "article", value: string | null | undefined) => {
        if (value === undefined) {
          return;
        }

        const normalized = (value ?? "").trim();
        if (!normalized) {
          nextParams.delete(key);
          return;
        }

        nextParams.set(key, normalized);
      };

      applyValue("q", patch.q);
      applyValue("category", patch.category);
      applyValue("article", patch.article);

      if (patch.sort !== undefined) {
        const nextQuery = patch.q !== undefined ? patch.q ?? "" : safeValue(nextParams.get("q"));
        const nextSort = normalizeSort(patch.sort, nextQuery);
        const defaultSort = getDefaultSort(nextQuery);

        if (nextSort === defaultSort) {
          nextParams.delete("sort");
        } else {
          nextParams.set("sort", nextSort);
        }
      }

      const nextQueryString = nextParams.toString();
      const currentQueryString = searchParams.toString();

      if (nextQueryString === currentQueryString) {
        return;
      }

      router.replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const totalArticleCount = useMemo(
    () => sections.reduce((sum, section) => sum + section.articles.length, 0),
    [sections]
  );

  const hasCategoryInData = useMemo(
    () => (category ? sections.some((section) => section.slug === category) : true),
    [category, sections]
  );

  useEffect(() => {
    if (!category || hasCategoryInData) {
      return;
    }

    updateUrlState({ category: null });
  }, [category, hasCategoryInData, updateUrlState]);

  const categoryScopedSections = useMemo(() => {
    if (!category || !hasCategoryInData) {
      return sections;
    }

    return sections.filter((section) => section.slug === category);
  }, [category, hasCategoryInData, sections]);

  const filteredSections = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
      return categoryScopedSections;
    }

    return categoryScopedSections
      .map((section) => {
        const sectionMatch = normalizeText(section.title).includes(normalizedQuery);
        const filteredArticles = section.articles.filter((article) => {
          const titleMatch = normalizeText(article.title).includes(normalizedQuery);
          const summaryMatch = normalizeText(article.summary ?? "").includes(normalizedQuery);
          const contentMatch = normalizeText(article.contentMarkdown ?? "").includes(normalizedQuery);
          return titleMatch || summaryMatch || contentMatch;
        });

        if (sectionMatch) {
          return section;
        }

        return {
          ...section,
          articles: filteredArticles,
        };
      })
      .filter((section) => section.articles.length > 0 || normalizeText(section.title).includes(normalizedQuery));
  }, [categoryScopedSections, query]);

  const orderedSections = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    return filteredSections
      .map((section) => {
        const orderedArticles = [...section.articles].sort((left, right) => {
          if (sort === "recent") {
            const byRecent = compareByRecent(left.updatedAt, right.updatedAt);
            if (byRecent !== 0) {
              return byRecent;
            }
            return left.title.localeCompare(right.title, "vi");
          }

          const leftScore = scoreArticleMatch(section.title, left.title, left.summary ?? "", normalizedQuery);
          const rightScore = scoreArticleMatch(section.title, right.title, right.summary ?? "", normalizedQuery);

          if (leftScore !== rightScore) {
            return rightScore - leftScore;
          }

          const byRecent = compareByRecent(left.updatedAt, right.updatedAt);
          if (byRecent !== 0) {
            return byRecent;
          }

          return left.title.localeCompare(right.title, "vi");
        });

        const sectionRank = orderedArticles.reduce((max, article) => {
          const score = scoreArticleMatch(section.title, article.title, article.summary ?? "", normalizedQuery);
          return Math.max(max, score);
        }, 0);

        return {
          ...section,
          articles: orderedArticles,
          sectionRank,
          latestUpdatedAt: orderedArticles[0]?.updatedAt,
        };
      })
      .sort((left, right) => {
        if (sort === "recent") {
          const byRecent = compareByRecent(left.latestUpdatedAt, right.latestUpdatedAt);
          if (byRecent !== 0) {
            return byRecent;
          }
          return left.title.localeCompare(right.title, "vi");
        }

        if (left.sectionRank !== right.sectionRank) {
          return right.sectionRank - left.sectionRank;
        }

        return left.title.localeCompare(right.title, "vi");
      });
  }, [filteredSections, query, sort]);

  const activeSection = useMemo(() => {
    if (!orderedSections.length) {
      return undefined;
    }

    if (article) {
      const articleSection = orderedSections.find((section) =>
        section.articles.some((item) => item.slug === article || item.id === article)
      );
      if (articleSection) {
        return articleSection;
      }
    }

    return orderedSections[0];
  }, [article, orderedSections]);

  const activeArticle = useMemo(() => {
    if (!activeSection) {
      return undefined;
    }

    if (article) {
      const fromParam = activeSection.articles.find((item) => item.slug === article || item.id === article);
      if (fromParam) {
        return fromParam;
      }
    }

    return activeSection.articles[0];
  }, [activeSection, article]);

  useEffect(() => {
    if (!activeArticle) {
      if (article) {
        updateUrlState({ article: null });
      }
      return;
    }

    if (article === activeArticle.slug || article === activeArticle.id) {
      return;
    }

    updateUrlState({ article: activeArticle.slug });
  }, [activeArticle, article, updateUrlState]);

  const handleQuickStartSelect = (keywords: string[]) => {
    const match = orderedSections.find((section) => sectionMatchesKeywords(section, keywords));
    updateUrlState({
      category: match?.slug ?? null,
      article: match?.articles[0]?.slug ?? null,
    });
  };

  const hasNoContent = !activeSection;

  const isFilteredEmpty = !errorMessage && sections.length > 0 && orderedSections.length === 0;

  const filteredArticleCount = useMemo(
    () => orderedSections.reduce((sum, section) => sum + section.articles.length, 0),
    [orderedSections]
  );

  const statusText = useMemo(() => {
    if (!query.trim()) {
      return `${totalArticleCount} bài viết khả dụng.`;
    }

    if (filteredArticleCount === 0) {
      return `Không có kết quả cho từ khóa ${query.trim()}.`;
    }

    return `${filteredArticleCount} kết quả cho từ khóa ${query.trim()}.`;
  }, [filteredArticleCount, query, totalArticleCount]);

  const relatedArticles = useMemo(() => {
    if (!activeSection || !activeArticle) {
      return [];
    }

    return activeSection.articles
      .filter((article) => article.id !== activeArticle.id)
      .slice(0, 4)
      .map((article) => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
      }));
  }, [activeArticle, activeSection]);

  const activeMeta = useMemo(() => {
    if (!activeArticle || !activeSection) {
      return null;
    }

    return resolveArticleMeta(activeArticle, activeSection.title);
  }, [activeArticle, activeSection]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <section className="rounded-3xl border-2 border-[#111827] bg-[#FFFDF8] p-5 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="font-be-vietnam text-xs font-semibold uppercase tracking-[0.2em] text-[#4B5563]">Trung tâm tri thức</p>
            <h1 className="mt-2 font-ganh text-4xl leading-tight tracking-tight text-[#111827] sm:text-5xl">Wiki hướng dẫn</h1>
            <p className="mt-3 max-w-2xl font-be-vietnam text-[15px] leading-7 text-[#4B5563] sm:text-base">
              Tìm thông tin bạn cần trong vài giây, quét nhanh theo chuyên mục và đọc sâu từng bài mà không mất ngữ cảnh.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#D1D5DB] bg-white p-3">
            <div className="rounded-xl bg-[#F7F4EC] px-3 py-2 text-center">
              <p className="font-be-vietnam text-xs uppercase tracking-[0.16em] text-[#4B5563]">Chuyên mục</p>
              <p className="font-ganh text-2xl text-[#111827]">{sections.length}</p>
            </div>
            <div className="rounded-xl bg-[#F7F4EC] px-3 py-2 text-center">
              <p className="font-be-vietnam text-xs uppercase tracking-[0.16em] text-[#4B5563]">Bài viết</p>
              <p className="font-ganh text-2xl text-[#111827]">{totalArticleCount}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border-2 border-[#111827] bg-white p-3 sm:p-4">
          <div className="sticky top-2 z-20 rounded-xl bg-white">
            <label htmlFor="wiki-search" className="mb-2 block font-be-vietnam text-sm font-semibold text-[#111827]">
              Tìm kiếm trong Wiki
            </label>
            <div className="flex flex-col gap-2 lg:flex-row">
              <input
                id="wiki-search"
                type="search"
                value={query}
                onChange={(event) => {
                  updateUrlState({
                    q: event.target.value,
                    sort: getDefaultSort(event.target.value),
                    article: null,
                  });
                }}
                placeholder="Tìm theo chuyên mục, tiêu đề, tóm tắt hoặc nội dung..."
                className="min-h-11 w-full rounded-xl border-2 border-[#111827] bg-white px-4 py-3 font-be-vietnam text-sm text-[#111827] shadow-sm placeholder:text-[#6B7280] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3C5D]/30"
              />
              <div className="flex gap-2">
                <label htmlFor="wiki-sort" className="sr-only">
                  Sắp xếp kết quả
                </label>
                <select
                  id="wiki-sort"
                  value={sort}
                  onChange={(event) => updateUrlState({ sort: event.target.value })}
                  className="min-h-11 rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 font-be-vietnam text-sm text-[#111827] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3C5D]/30"
                >
                  <option value="relevance">Liên quan</option>
                  <option value="recent">Mới cập nhật</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    updateUrlState({ q: null, sort: getDefaultSort(""), article: null });
                  }}
                  className="min-h-11 shrink-0 rounded-xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-2 font-be-vietnam text-sm font-semibold text-[#111827] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3C5D]/30"
                >
                  Xoá tìm kiếm
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateUrlState({ category: null, article: null })}
              className={`min-h-11 rounded-full border px-3 py-2 font-be-vietnam text-xs font-semibold uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3C5D]/30 ${
                !category
                  ? "border-[#111827] bg-[#111827] text-white"
                  : "border-[#D1D5DB] bg-white text-[#111827] hover:bg-[#F9FAFB]"
              }`}
            >
              Tất cả chuyên mục
            </button>
            {sections.map((section) => {
              const isActive = category === section.slug;
              return (
                <button
                  key={section.slug}
                  type="button"
                  onClick={() => updateUrlState({ category: section.slug, article: section.articles[0]?.slug ?? null })}
                  className={`min-h-11 rounded-full border px-3 py-2 font-be-vietnam text-xs font-semibold uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3C5D]/30 ${
                    isActive
                      ? "border-[#111827] bg-[#111827] text-white"
                      : "border-[#D1D5DB] bg-white text-[#111827] hover:bg-[#F9FAFB]"
                  }`}
                >
                  {section.title}
                </button>
              );
            })}
          </div>

          <p className="mt-2 font-be-vietnam text-xs text-[#4B5563]">Mẹo: dùng từ khóa ngắn, hoặc chọn chuyên mục để thu hẹp nhanh kết quả.</p>
          <p aria-live="polite" className="mt-2 font-be-vietnam text-xs font-medium text-[#374151]">
            {statusText}
          </p>
        </div>
      </section>

      <section className="mt-5">
        <h2 className="font-ganh text-2xl text-[#111827] sm:text-3xl">Bắt đầu nhanh</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          {QUICK_START_CARDS.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => handleQuickStartSelect(card.keywords)}
              className="min-h-11 rounded-2xl border-2 border-[#111827] bg-white p-4 text-left shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3C5D]/30"
            >
              <p className="text-2xl" aria-hidden="true">{card.icon}</p>
              <p className="mt-3 font-ganh text-xl text-[#111827]">{card.title}</p>
              <p className="mt-2 font-be-vietnam text-sm leading-6 text-[#4B5563]">{card.description}</p>
            </button>
          ))}
        </div>
      </section>

      {errorMessage ? (
        <div className="mt-5 rounded-2xl border-2 border-red-300 bg-red-50 px-4 py-3 font-be-vietnam text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {isFilteredEmpty ? (
        <div className="mt-5 rounded-2xl border-2 border-[#111827] bg-white px-5 py-6 font-be-vietnam text-sm text-[#4B5563] shadow-[4px_4px_0px_0px_rgba(17,24,39,1)]">
          <p>
            Không tìm thấy nội dung phù hợp với truy vấn hiện tại.
          </p>
          <p className="mt-2">Hãy thử từ khóa ngắn hơn, kiểm tra chính tả hoặc quay về toàn bộ nội dung để bắt đầu lại.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateUrlState({ q: null, category: null, article: null, sort: getDefaultSort("") })}
              className="min-h-11 rounded-xl border border-[#111827] bg-[#111827] px-4 py-2 font-be-vietnam text-sm font-semibold text-white transition-colors hover:bg-[#1F2937] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3C5D]/30"
            >
              Xoá truy vấn và bộ lọc
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {sections.slice(0, 4).map((section) => (
              <button
                key={section.slug}
                type="button"
                onClick={() => {
                  updateUrlState({ q: null, category: section.slug, article: section.articles[0]?.slug ?? null });
                }}
                className="min-h-11 rounded-full border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-2 font-be-vietnam text-xs font-semibold uppercase tracking-[0.08em] text-[#111827] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3C5D]/30"
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {hasNoContent ? (
        <div className="mt-5 rounded-2xl border-2 border-[#111827] bg-white p-5 font-be-vietnam text-sm text-[#4B5563] shadow-[4px_4px_0px_0px_rgba(17,24,39,1)]">
          Chưa có bài viết wiki nào.
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border-2 border-[#111827] bg-white p-4 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] lg:sticky lg:top-6">
            <p className="mb-3 font-be-vietnam text-xs font-bold uppercase tracking-[0.18em] text-[#4B5563]">Chuyên mục</p>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
              {orderedSections.map((section) => {
                const active = section.slug === activeSection.slug;
                return (
                  <button
                    key={section.slug}
                    id={section.slug}
                    type="button"
                    onClick={() => updateUrlState({ category: section.slug, article: section.articles[0]?.slug ?? null })}
                    className={`min-h-11 shrink-0 rounded-xl border-2 px-3 py-3 text-left transition-colors lg:w-full ${
                      active
                        ? "border-[#111827] bg-[#111827] text-white"
                        : "border-[#D1D5DB] bg-white text-[#111827] hover:border-[#111827]/40"
                    }`}
                  >
                    <p className="font-be-vietnam text-sm font-semibold uppercase tracking-wide">{section.title}</p>
                    <p className={`mt-1 font-be-vietnam text-xs ${active ? "text-white/80" : "text-[#6B7280]"}`}>
                      {section.articles.length} bài viết
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 border-t border-[#D1D5DB] pt-4">
              <Link
                href="/settings"
                className="font-be-vietnam text-xs font-bold uppercase tracking-wider text-[#111827] hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3C5D]/30"
              >
                Quay lại Cài đặt
              </Link>
            </div>
          </aside>

          <main className="space-y-4">
            <section className="rounded-2xl border-2 border-[#111827] bg-white p-4 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] sm:p-5">
              <h2 className="font-ganh text-2xl text-[#111827] sm:text-[1.9rem]">{activeSection.title}</h2>
              <p className="mt-2 font-be-vietnam text-sm leading-6 text-[#4B5563]">{getSectionHelperCopy(activeSection.title)}</p>

              <div className="mt-4 space-y-3">
                {activeSection.articles.map((article) => {
                  const isActive = article.id === activeArticle?.id;
                  const metadata = resolveArticleMeta(article, activeSection.title);
                  return (
                    <button
                      key={article.id}
                      type="button"
                      onClick={() => updateUrlState({ article: article.slug })}
                      className={`w-full rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3C5D]/30 ${
                        isActive
                          ? "border-[#111827] bg-[#111827] text-white"
                          : "border-[#D1D5DB] bg-[#F9FAFB] text-[#111827] hover:bg-white"
                      }`}
                    >
                      <p className="font-ganh text-xl tracking-wide">{article.title}</p>
                      <p className={`mt-1 font-be-vietnam text-sm leading-6 ${isActive ? "text-white/85" : "text-[#4B5563]"}`}>
                        {article.summary || "Bài viết chưa có tóm tắt."}
                      </p>
                      <div className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-be-vietnam text-xs ${isActive ? "text-white/75" : "text-[#6B7280]"}`}>
                        <span>Cập nhật: {metadata.updatedAtLabel}</span>
                        <span>{metadata.readTime}</span>
                        <span>{metadata.category}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {activeArticle ? (
              <WikiArticle
                articleId={activeArticle.slug || activeArticle.id}
                title={activeArticle.title}
                summary={activeArticle.summary}
                contentMarkdown={activeArticle.contentMarkdown}
                updatedAt={activeMeta?.updatedAt}
                readTime={activeMeta?.readTime ?? "~5 phút đọc"}
                category={activeMeta?.category ?? "General"}
                owner={activeMeta?.owner ?? "DongNgon Team"}
                relatedArticles={relatedArticles}
                onSelectRelated={(articleId) => {
                  const selected = activeSection.articles.find((item) => item.id === articleId);
                  updateUrlState({ article: selected?.slug ?? null });
                }}
              />
            ) : null}
          </main>
        </div>
      )}
    </div>
  );
}
