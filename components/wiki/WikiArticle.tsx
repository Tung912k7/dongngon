"use client";

import { type FormEvent, useMemo, useState } from "react";

import { sanitizeMarkdownToHtml } from "@/utils/sanitizer";

type RelatedArticle = {
  id: string;
  title: string;
};

type WikiArticleProps = {
  articleId: string;
  title: string;
  summary?: string;
  contentMarkdown: string;
  compact?: boolean;
  updatedAt?: string;
  readTime?: string;
  category?: string;
  owner?: string;
  relatedArticles?: RelatedArticle[];
  onSelectRelated?: (articleId: string) => void;
};

function formatUpdatedAt(value: string | undefined) {
  if (!value) {
    return "Chưa có ngày cập nhật";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Chưa có ngày cập nhật";
  }

  return parsed.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function WikiArticle({
  articleId,
  title,
  summary,
  contentMarkdown,
  compact = false,
  updatedAt,
  readTime = "~5 phút đọc",
  category = "Tổng quan",
  owner = "Đội ngũ DongNgon",
  relatedArticles = [],
  onSelectRelated,
}: WikiArticleProps) {
  const [feedback, setFeedback] = useState<"helpful" | "not_helpful" | null>(null);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [feedbackAnnouncement, setFeedbackAnnouncement] = useState("");

  const html = useMemo(() => sanitizeMarkdownToHtml(contentMarkdown), [contentMarkdown]);
  const formattedUpdatedAt = formatUpdatedAt(updatedAt);

  const submitFeedback = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!feedback) {
      setFeedbackAnnouncement("Hãy chọn mức độ hữu ích trước khi gửi phản hồi.");
      return;
    }

    const trimmedNote = feedbackNote.trim();
    const reasonLengthBucket =
      trimmedNote.length === 0
        ? "0"
        : trimmedNote.length <= 40
        ? "1-40"
        : trimmedNote.length <= 120
        ? "41-120"
        : ">120";

    import("posthog-js").then((m) => {
      m.default.capture("wiki_feedback_submitted", {
        article_id: articleId,
        article_title: title,
        feedback,
        reason_length_bucket: reasonLengthBucket,
        event_source: "wiki_article",
        event_version: 1,
      });
    });

    setIsFeedbackSubmitted(true);
    setFeedbackAnnouncement("Đã ghi nhận phản hồi của bạn. Cảm ơn bạn đã giúp cải thiện Wiki.");
  };

  return (
    <article className="rounded-2xl border-2 border-[#111827] bg-white p-5 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] sm:p-6" aria-labelledby="wiki-article-title">
      <p className="font-be-vietnam text-xs font-semibold uppercase tracking-[0.16em] text-[#4B5563]">Bài viết chi tiết</p>

      <h2 id="wiki-article-title" className="font-ganh text-2xl tracking-wide text-[#111827] sm:text-[1.85rem]">{title}</h2>
      {summary ? <p className="mt-2 font-be-vietnam text-sm leading-6 text-[#4B5563]">{summary}</p> : null}

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2">
        <span className="rounded-full border border-[#D1D5DB] bg-white px-2.5 py-1 font-be-vietnam text-xs font-medium text-[#374151]">
          Cập nhật: {formattedUpdatedAt}
        </span>
        <span className="rounded-full border border-[#D1D5DB] bg-white px-2.5 py-1 font-be-vietnam text-xs font-medium text-[#374151]">
          {readTime}
        </span>
        <span className="rounded-full border border-[#D1D5DB] bg-white px-2.5 py-1 font-be-vietnam text-xs font-medium text-[#374151]">
          {category}
        </span>
        <span className="rounded-full border border-[#D1D5DB] bg-white px-2.5 py-1 font-be-vietnam text-xs font-medium text-[#374151]">
          Phụ trách: {owner}
        </span>
      </div>

      <div
        className={`mt-4 prose prose-slate max-w-none ${
          compact ? "text-sm" : "text-[15px]"
        } font-be-vietnam [&_h1]:font-ganh [&_h1]:text-2xl [&_h1]:tracking-wide [&_h2]:font-ganh [&_h2]:text-xl [&_h3]:font-be-vietnam [&_h3]:text-lg [&_h3]:font-semibold [&_blockquote]:border-l-4 [&_blockquote]:border-[#111827]/25 [&_blockquote]:pl-3 [&_blockquote]:italic [&_li]:leading-7 [&_p]:leading-7`}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {relatedArticles.length > 0 ? (
        <section className="mt-6 rounded-xl border border-[#D1D5DB] bg-[#F9FAFB] p-4" aria-label="Bài liên quan">
          <h3 className="font-ganh text-xl tracking-wide text-[#111827]">Bài liên quan</h3>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {relatedArticles.map((article) => (
              <button
                key={article.id}
                type="button"
                onClick={() => onSelectRelated?.(article.id)}
                className="min-h-11 rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-left font-be-vietnam text-sm font-medium text-[#111827] transition-colors hover:bg-[#F3F4F6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3C5D]/30"
              >
                {article.title}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl border border-[#D1D5DB] bg-white p-4" aria-label="Đánh giá bài viết">
        <h3 className="font-be-vietnam text-sm font-semibold text-[#111827]">Bài viết này có hữu ích không?</h3>

        <form onSubmit={submitFeedback} className="mt-3">
          <fieldset>
            <legend className="sr-only">Chọn mức độ hữu ích của bài viết</legend>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={feedback === "helpful"}
                onClick={() => {
                  setFeedback("helpful");
                  setIsFeedbackSubmitted(false);
                }}
                className={`min-h-11 rounded-xl border px-3 py-2 font-be-vietnam text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3C5D]/30 ${
                  feedback === "helpful"
                    ? "border-[#0B3C5D] bg-[#0B3C5D] text-white"
                    : "border-[#D1D5DB] bg-[#F9FAFB] text-[#111827] hover:bg-white"
                }`}
              >
                Hữu ích
              </button>
              <button
                type="button"
                aria-pressed={feedback === "not_helpful"}
                onClick={() => {
                  setFeedback("not_helpful");
                  setIsFeedbackSubmitted(false);
                }}
                className={`min-h-11 rounded-xl border px-3 py-2 font-be-vietnam text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3C5D]/30 ${
                  feedback === "not_helpful"
                    ? "border-[#111827] bg-[#111827] text-white"
                    : "border-[#D1D5DB] bg-[#F9FAFB] text-[#111827] hover:bg-white"
                }`}
              >
                Chưa hữu ích
              </button>
            </div>
          </fieldset>

          {feedback ? (
            <>
              <label htmlFor="wiki-feedback-note" className="mt-3 block font-be-vietnam text-xs font-medium text-[#4B5563]">
                Góp ý thêm (không bắt buộc)
              </label>
              <textarea
                id="wiki-feedback-note"
                value={feedbackNote}
                onChange={(event) => {
                  setFeedbackNote(event.target.value);
                  setIsFeedbackSubmitted(false);
                }}
                rows={3}
                maxLength={300}
                className="mt-2 w-full rounded-xl border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-2 font-be-vietnam text-sm text-[#111827] placeholder:text-[#6B7280] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3C5D]/30"
                placeholder="Mô tả ngắn điều bạn muốn cải thiện..."
              />
              <button
                type="submit"
                className="mt-3 min-h-11 rounded-xl border border-[#111827] bg-[#111827] px-4 py-2 font-be-vietnam text-sm font-semibold text-white transition-colors hover:bg-[#1F2937] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B3C5D]/30"
              >
                Gửi phản hồi
              </button>
            </>
          ) : null}

          {isFeedbackSubmitted ? (
            <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 font-be-vietnam text-xs text-emerald-700">
              Cảm ơn bạn. Phản hồi đã được ghi nhận.
            </p>
          ) : null}

          <p role="status" aria-live="polite" className="sr-only">
            {feedbackAnnouncement}
          </p>
        </form>
      </section>
    </article>
  );
}
