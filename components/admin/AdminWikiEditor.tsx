"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";

import {
  deleteWikiArticle,
  upsertWikiArticle,
} from "@/actions/wiki";
import type { WikiArticleRecord, WikiArticleUpsertInput } from "@/types/wiki";
import WikiArticle from "@/components/wiki/WikiArticle";

type Props = {
  initialArticles: WikiArticleRecord[];
};

type ArticleFormState = {
  id: string | null;
  slug: string;
  sectionSlug: string;
  sectionTitle: string;
  title: string;
  summary: string;
  contentMarkdown: string;
  sortOrder: string;
  isPublished: boolean;
};

type SectionFilter = "all" | string;

const defaultFormState: ArticleFormState = {
  id: null,
  slug: "",
  sectionSlug: "",
  sectionTitle: "",
  title: "",
  summary: "",
  contentMarkdown: "",
  sortOrder: "0",
  isPublished: true,
};

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminWikiEditor({ initialArticles }: Props) {
  const [articles, setArticles] = useState<WikiArticleRecord[]>(initialArticles);
  const [formState, setFormState] = useState<ArticleFormState>(defaultFormState);
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const isEditing = Boolean(formState.id);

  const sections = useMemo(() => {
    const seen = new Map<string, string>();
    for (const a of articles) {
      if (!seen.has(a.sectionSlug)) {
        seen.set(a.sectionSlug, a.sectionTitle);
      }
    }
    return Array.from(seen.entries()).map(([slug, title]) => ({ slug, title }));
  }, [articles]);

  const stats = useMemo(() => {
    const published = articles.filter((a) => a.isPublished).length;
    return { total: articles.length, published, draft: articles.length - published };
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesSection = sectionFilter === "all" || article.sectionSlug === sectionFilter;
      if (!matchesSection) return false;
      if (!query) return true;
      return [article.title, article.summary, article.slug, article.sectionTitle].some((v) =>
        v.toLowerCase().includes(query),
      );
    });
  }, [articles, sectionFilter, searchQuery]);

  const resetForm = useCallback(() => {
    setFormState(defaultFormState);
  }, []);

  const handleFieldChange = <K extends keyof ArticleFormState>(
    field: K,
    value: ArticleFormState[K],
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = useCallback((article: WikiArticleRecord) => {
    setFormState({
      id: article.id,
      slug: article.slug,
      sectionSlug: article.sectionSlug,
      sectionTitle: article.sectionTitle,
      title: article.title,
      summary: article.summary,
      contentMarkdown: article.contentMarkdown,
      sortOrder: String(article.sortOrder),
      isPublished: article.isPublished,
    });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleCancelEdit = useCallback(() => {
    resetForm();
    setMessage(null);
  }, [resetForm]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const slug = formState.slug.trim();
    const sectionSlug = formState.sectionSlug.trim();
    const sectionTitle = formState.sectionTitle.trim();
    const title = formState.title.trim();
    const contentMarkdown = formState.contentMarkdown.trim();
    const sortOrder = Number(formState.sortOrder);

    if (!slug) {
      setMessage({ type: "error", text: "Slug bài viết là bắt buộc." });
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setMessage({ type: "error", text: "Slug chỉ được dùng chữ thường, số và dấu gạch ngang." });
      return;
    }

    if (!sectionSlug || !/^[a-z0-9-]+$/.test(sectionSlug)) {
      setMessage({ type: "error", text: "Slug chuyên mục không hợp lệ." });
      return;
    }

    if (!sectionTitle) {
      setMessage({ type: "error", text: "Tên chuyên mục là bắt buộc." });
      return;
    }

    if (!title) {
      setMessage({ type: "error", text: "Tiêu đề là bắt buộc." });
      return;
    }

    if (!contentMarkdown) {
      setMessage({ type: "error", text: "Nội dung markdown là bắt buộc." });
      return;
    }

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setMessage({ type: "error", text: "Thứ tự hiển thị phải là số nguyên không âm." });
      return;
    }

    const input: WikiArticleUpsertInput = {
      ...(formState.id ? { id: formState.id } : {}),
      slug,
      sectionSlug,
      sectionTitle,
      title,
      summary: formState.summary.trim(),
      contentMarkdown,
      sortOrder,
      isPublished: formState.isPublished,
    };

    startTransition(async () => {
      setMessage(null);
      const result = await upsertWikiArticle(input);

      if (!result.success) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      const saved = result.data;

      setArticles((prev) => {
        if (formState.id) {
          return prev
            .map((a) => (a.id === saved.id ? saved : a))
            .sort(
              (a, b) =>
                a.sectionTitle.localeCompare(b.sectionTitle) ||
                a.sortOrder - b.sortOrder ||
                a.title.localeCompare(b.title),
            );
        }
        return [saved, ...prev].sort(
          (a, b) =>
            a.sectionTitle.localeCompare(b.sectionTitle) ||
            a.sortOrder - b.sortOrder ||
            a.title.localeCompare(b.title),
        );
      });

      setMessage({
        type: "success",
        text: formState.id ? "Đã cập nhật bài viết." : "Đã thêm bài viết mới.",
      });
      resetForm();
    });
  };

  const handleDelete = useCallback(
    (article: WikiArticleRecord) => {
      if (!confirm(`Xóa bài viết "${article.title}"?`)) return;

      setRemovingId(article.id);
      setMessage(null);

      startTransition(async () => {
        const result = await deleteWikiArticle(article.id);

        if (!result.success) {
          setMessage({ type: "error", text: result.error });
          setRemovingId(null);
          return;
        }

        setArticles((prev) => prev.filter((a) => a.id !== article.id));
        if (formState.id === article.id) resetForm();
        setRemovingId(null);
      });
    },
    [formState.id, resetForm],
  );

  const handleTogglePublished = useCallback((article: WikiArticleRecord) => {
    setMessage(null);
    startTransition(async () => {
      const result = await upsertWikiArticle({
        id: article.id,
        slug: article.slug,
        sectionSlug: article.sectionSlug,
        sectionTitle: article.sectionTitle,
        title: article.title,
        summary: article.summary,
        contentMarkdown: article.contentMarkdown,
        sortOrder: article.sortOrder,
        isPublished: !article.isPublished,
      });

      if (!result.success) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      setArticles((prev) => prev.map((a) => (a.id === result.data.id ? result.data : a)));
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin"
          className="p-2 hover:bg-slate-100 rounded-full transition-colors border-2 border-transparent hover:border-black"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </Link>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Quản lý trợ giúp</h1>
          <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Nội dung trang Wiki / Help Center
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-10">
        {[
          { label: "Tổng bài viết", value: stats.total },
          { label: "Đang hiển thị", value: stats.published },
          { label: "Bản nháp", value: stats.draft },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white rounded-[1.75rem] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6"
          >
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</p>
            <p className="mt-3 text-4xl font-black">{value}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <section className="mb-10 bg-white rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            {isEditing ? "Chỉnh sửa" : "Thêm mới"}
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight italic">
            {isEditing ? "Cập nhật bài viết" : "Tạo bài viết"}
          </h2>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          {/* Slug + SectionSlug row */}
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest pl-1">
                Slug bài viết <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formState.slug}
                onChange={(e) => handleFieldChange("slug", e.target.value)}
                placeholder="vd: tao-tai-khoan"
                className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-base font-medium font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest pl-1">
                Slug chuyên mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formState.sectionSlug}
                onChange={(e) => {
                  handleFieldChange("sectionSlug", e.target.value);
                  // Auto-fill sectionTitle if the slug matches a known section
                  const known = sections.find((s) => s.slug === e.target.value.trim());
                  if (known) handleFieldChange("sectionTitle", known.title);
                }}
                placeholder="vd: bat-dau-nhanh"
                list="section-slugs"
                className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-base font-medium font-mono"
              />
              <datalist id="section-slugs">
                {sections.map((s) => (
                  <option key={s.slug} value={s.slug} />
                ))}
              </datalist>
            </div>
          </div>

          {/* SectionTitle + Title row */}
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest pl-1">
                Tên chuyên mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formState.sectionTitle}
                onChange={(e) => handleFieldChange("sectionTitle", e.target.value)}
                placeholder="vd: Bắt đầu nhanh"
                className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-base font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest pl-1">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formState.title}
                onChange={(e) => {
                  handleFieldChange("title", e.target.value);
                  // Auto-generate slug when creating a new article
                  if (!formState.id && !formState.slug) {
                    handleFieldChange("slug", toSlug(e.target.value));
                  }
                }}
                placeholder="vd: Đăng ký và hoàn thiện hồ sơ"
                className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-base font-medium"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest pl-1">
              Tóm tắt{" "}
              <span className="font-medium normal-case tracking-normal text-slate-400">
                (tùy chọn, tối đa 320 ký tự)
              </span>
            </label>
            <textarea
              value={formState.summary}
              onChange={(e) => handleFieldChange("summary", e.target.value)}
              rows={2}
              maxLength={320}
              placeholder="Mô tả ngắn về bài viết..."
              className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-base font-medium resize-none"
            />
          </div>

          {/* Content Markdown */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest pl-1">
              Nội dung Markdown <span className="text-red-500">*</span>
              <span className="ml-2 font-medium normal-case tracking-normal text-slate-400">
                (dấu{" "}
                <code className="bg-slate-100 px-1 rounded text-xs">- </code> đầu dòng để tạo danh
                sách)
              </span>
            </label>
            <textarea
              value={formState.contentMarkdown}
              onChange={(e) => handleFieldChange("contentMarkdown", e.target.value)}
              rows={10}
              placeholder={`- Bước 1: Mô tả hành động.\n- Bước 2: Chi tiết tiếp theo.\n- Bước 3: Kết quả mong đợi.`}
              className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-sm font-mono resize-y min-h-[160px]"
            />

            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 mb-3">
                Xem trước (đã sanitize)
              </p>
              {formState.contentMarkdown.trim() ? (
                <WikiArticle
                  articleId={formState.slug || "preview-article"}
                  title={formState.title || "Tiêu đề bài viết"}
                  summary={formState.summary || "Tóm tắt bài viết"}
                  contentMarkdown={formState.contentMarkdown}
                  compact
                />
              ) : (
                <p className="text-sm text-slate-500 italic">Nhập markdown để xem trước.</p>
              )}
            </div>
          </div>

          {/* SortOrder + isPublished row */}
          <div className="flex flex-wrap items-end gap-5">
            <div className="space-y-2 w-36">
              <label className="text-xs font-black uppercase tracking-widest pl-1">Thứ tự</label>
              <input
                type="number"
                min={0}
                value={formState.sortOrder}
                onChange={(e) => handleFieldChange("sortOrder", e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-base font-medium"
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border-4 border-black px-4 py-4 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={formState.isPublished}
                onChange={(e) => handleFieldChange("isPublished", e.target.checked)}
                className="h-5 w-5 accent-black"
              />
              <span className="text-sm font-bold uppercase tracking-[0.12em]">
                Hiển thị cho người dùng
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-black text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-40 text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
            >
              {isPending ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Thêm bài viết"}
            </button>

            {isEditing ? (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isPending}
                className="w-full py-4 bg-white text-black rounded-[1.5rem] border-4 border-black font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-40 text-sm"
              >
                Hủy chỉnh sửa
              </button>
            ) : null}
          </div>
        </form>
      </section>

      {/* List */}
      <section>
        <h2 className="text-xl font-black uppercase tracking-widest mb-6">Danh sách bài viết</h2>

        {message ? (
          <div
            className={`mb-6 rounded-[1.25rem] border-4 p-4 font-bold ${
              message.type === "error"
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-emerald-500 bg-emerald-50 text-emerald-700"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        {/* Filter bar */}
        <div className="mb-6 grid gap-4 rounded-[1.5rem] border-4 border-black bg-white p-5 md:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="space-y-2">
            <label
              htmlFor="wiki-search"
              className="text-xs font-black uppercase tracking-widest pl-1"
            >
              Tìm kiếm
            </label>
            <input
              id="wiki-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tiêu đề, tóm tắt, slug..."
              className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-base font-medium"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="wiki-section-filter"
              className="text-xs font-black uppercase tracking-widest pl-1"
            >
              Chuyên mục
            </label>
            <select
              id="wiki-section-filter"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-base font-medium bg-white"
            >
              <option value="all">Tất cả chuyên mục</option>
              {sections.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="w-full py-16 text-center border-4 border-dashed border-slate-200 rounded-[2rem]">
            <p className="font-bold text-slate-400 italic">Chưa có bài viết nào trong hệ thống.</p>
            <p className="mt-2 text-sm text-slate-400">
              Hãy chạy SQL seed để thêm nội dung mặc định, hoặc dùng form trên để tạo bài mới.
            </p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="w-full py-12 text-center border-4 border-dashed border-slate-200 rounded-[2rem]">
            <p className="font-bold text-slate-400 italic">
              Không có bài viết nào khớp với bộ lọc hiện tại.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className={`bg-white rounded-[1.75rem] border-4 border-black p-6 transition-opacity ${
                  removingId === article.id ? "opacity-40 pointer-events-none" : ""
                }`}
              >
                <div className="flex flex-wrap items-start gap-4">
                  {/* Left: content info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full border-2 border-black bg-slate-100">
                        {article.sectionTitle}
                      </span>
                      <span
                        className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full border-2 ${
                          article.isPublished
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-300 bg-slate-100 text-slate-500"
                        }`}
                      >
                        {article.isPublished ? "Hiển thị" : "Nháp"}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{article.slug}</span>
                    </div>

                    <h3 className="text-lg font-black truncate">{article.title}</h3>

                    {article.summary ? (
                      <p className="mt-1 text-sm text-slate-500 line-clamp-2">{article.summary}</p>
                    ) : null}

                    <p className="mt-2 text-xs text-slate-400">
                      Thứ tự: {article.sortOrder} &nbsp;·&nbsp; Cập nhật:{" "}
                      {formatDateTime(article.updatedAt)}
                    </p>
                  </div>

                  {/* Right: actions */}
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {/* Toggle published */}
                    <button
                      type="button"
                      onClick={() => handleTogglePublished(article)}
                      disabled={isPending}
                      title={article.isPublished ? "Ẩn bài viết" : "Hiển thị bài viết"}
                      className="p-2.5 rounded-xl border-2 border-black hover:bg-slate-100 transition-colors disabled:opacity-40"
                    >
                      {article.isPublished ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      )}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleEdit(article)}
                      disabled={isPending}
                      title="Chỉnh sửa"
                      className="p-2.5 rounded-xl border-2 border-black hover:bg-slate-100 transition-colors disabled:opacity-40"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
                        />
                      </svg>
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(article)}
                      disabled={isPending || removingId === article.id}
                      title="Xóa bài viết"
                      className="p-2.5 rounded-xl border-2 border-red-400 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Markdown preview (truncated) */}
                {article.contentMarkdown ? (
                  <details className="mt-4">
                    <summary className="text-xs font-black uppercase tracking-widest text-slate-400 cursor-pointer select-none hover:text-slate-600">
                      Xem nội dung
                    </summary>
                    <pre className="mt-3 text-xs font-mono bg-slate-50 border-2 border-slate-200 rounded-xl p-4 whitespace-pre-wrap overflow-auto max-h-48 text-slate-700">
                      {article.contentMarkdown}
                    </pre>
                  </details>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
