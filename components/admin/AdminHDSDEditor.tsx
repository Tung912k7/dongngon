"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { deleteHDSDArticle, upsertHDSDArticle } from "@/actions/hdsd";
import type { HelpCenterArticleRecord, HelpCenterArticleUpsertInput } from "@/types/helpCenter";

type Props = {
  initialArticles: HelpCenterArticleRecord[];
};

type ArticleFormState = {
  id: string | null;
  slug: string;
  section_slug: string;
  section_title: string;
  title: string;
  summary: string;
  content_markdown: string;
  sort_order: string;
  is_published: boolean;
};

type SectionFilter = "all" | string;

const defaultFormState: ArticleFormState = {
  id: null,
  slug: "",
  section_slug: "",
  section_title: "",
  title: "",
  summary: "",
  content_markdown: "",
  sort_order: "0",
  is_published: true,
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

export default function AdminHDSDEditor({ initialArticles }: Props) {
  const [articles, setArticles] = useState<HelpCenterArticleRecord[]>(initialArticles);
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
      if (!seen.has(a.section_slug)) {
        seen.set(a.section_slug, a.section_title);
      }
    }
    return Array.from(seen.entries()).map(([slug, title]) => ({ slug, title }));
  }, [articles]);

  const stats = useMemo(() => {
    const published = articles.filter((a) => a.is_published).length;
    return { total: articles.length, published, draft: articles.length - published };
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesSection = sectionFilter === "all" || article.section_slug === sectionFilter;
      if (!matchesSection) return false;
      if (!query) return true;
      return [article.title, article.summary, article.slug, article.section_title].some((v) =>
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

  const handleEdit = useCallback((article: HelpCenterArticleRecord) => {
    setFormState({
      id: article.id,
      slug: article.slug,
      section_slug: article.section_slug,
      section_title: article.section_title,
      title: article.title,
      summary: article.summary,
      content_markdown: article.content_markdown,
      sort_order: String(article.sort_order),
      is_published: article.is_published,
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
    const section_slug = formState.section_slug.trim();
    const section_title = formState.section_title.trim();
    const title = formState.title.trim();
    const content_markdown = formState.content_markdown.trim();
    const sort_order = Number(formState.sort_order);

    if (!slug) {
      setMessage({ type: "error", text: "Slug bài viết là bắt buộc." });
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setMessage({ type: "error", text: "Slug chỉ được dùng chữ thường, số và dấu gạch ngang." });
      return;
    }

    if (!section_slug || !/^[a-z0-9-]+$/.test(section_slug)) {
      setMessage({ type: "error", text: "Slug chuyên mục không hợp lệ." });
      return;
    }

    if (!section_title) {
      setMessage({ type: "error", text: "Tên chuyên mục là bắt buộc." });
      return;
    }

    if (!title) {
      setMessage({ type: "error", text: "Tiêu đề là bắt buộc." });
      return;
    }

    if (!content_markdown) {
      setMessage({ type: "error", text: "Nội dung markdown là bắt buộc." });
      return;
    }

    if (!Number.isInteger(sort_order) || sort_order < 0) {
      setMessage({ type: "error", text: "Thứ tự hiển thị phải là số nguyên không âm." });
      return;
    }

    const input: HelpCenterArticleUpsertInput = {
      ...(formState.id ? { id: formState.id } : {}),
      slug,
      section_slug,
      section_title,
      title,
      summary: formState.summary.trim(),
      content_markdown,
      sort_order,
      is_published: formState.is_published,
    };

    startTransition(async () => {
      setMessage(null);
      const result = await upsertHDSDArticle(input);

      if (!result.success || !result.data) {
        setMessage({ type: "error", text: result.error || "Lỗi không xác định." });
        return;
      }

      const saved = result.data;

      setArticles((prev) => {
        if (formState.id) {
          return prev
            .map((a) => (a.id === saved.id ? saved : a))
            .sort(
              (a, b) =>
                a.section_title.localeCompare(b.section_title) ||
                a.sort_order - b.sort_order ||
                a.title.localeCompare(b.title),
            );
        }
        return [saved, ...prev].sort(
          (a, b) =>
            a.section_title.localeCompare(b.section_title) ||
            a.sort_order - b.sort_order ||
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
    (article: HelpCenterArticleRecord) => {
      if (!confirm(`Xóa bài viết "${article.title}"?`)) return;

      setRemovingId(article.id);
      setMessage(null);

      startTransition(async () => {
        const result = await deleteHDSDArticle(article.id);

        if (!result.success) {
          setMessage({ type: "error", text: result.error || "Lỗi không xác định." });
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

  const handleTogglePublished = useCallback((article: HelpCenterArticleRecord) => {
    setMessage(null);
    startTransition(async () => {
      const result = await upsertHDSDArticle({
        id: article.id,
        slug: article.slug,
        section_slug: article.section_slug,
        section_title: article.section_title,
        title: article.title,
        summary: article.summary,
        content_markdown: article.content_markdown,
        sort_order: article.sort_order,
        is_published: !article.is_published,
      });

      if (!result.success || !result.data) {
        setMessage({ type: "error", text: result.error || "Lỗi không xác định." });
        return;
      }

      setArticles((prev) => prev.map((a) => (a.id === result.data.id ? result.data! : a)));
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Quản lý HDSD</h1>
          <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Nội dung Hướng dẫn sử dụng
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
                value={formState.section_slug}
                onChange={(e) => {
                  handleFieldChange("section_slug", e.target.value);
                  const known = sections.find((s) => s.slug === e.target.value.trim());
                  if (known) handleFieldChange("section_title", known.title);
                }}
                placeholder="vd: tai-khoan"
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

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest pl-1">
                Tên chuyên mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formState.section_title}
                onChange={(e) => handleFieldChange("section_title", e.target.value)}
                placeholder="vd: Tài khoản"
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
                  if (!formState.id && !formState.slug) {
                    handleFieldChange("slug", toSlug(e.target.value));
                  }
                }}
                placeholder="vd: Hướng dẫn tạo tài khoản Đồng Ngôn"
                className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-base font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest pl-1">
              Tóm tắt <span className="font-medium normal-case tracking-normal text-slate-400">(tùy chọn)</span>
            </label>
            <textarea
              value={formState.summary}
              onChange={(e) => handleFieldChange("summary", e.target.value)}
              rows={2}
              maxLength={320}
              placeholder="Mô tả ngắn..."
              className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-base font-medium resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest pl-1">
              Nội dung (Markdown hoặc HTML) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formState.content_markdown}
              onChange={(e) => handleFieldChange("content_markdown", e.target.value)}
              rows={10}
              placeholder="Nội dung bài viết..."
              className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-sm font-mono resize-y min-h-[160px]"
            />
          </div>

          <div className="flex flex-wrap items-end gap-5">
            <div className="space-y-2 w-36">
              <label className="text-xs font-black uppercase tracking-widest pl-1">Thứ tự</label>
              <input
                type="number"
                min={0}
                value={formState.sort_order}
                onChange={(e) => handleFieldChange("sort_order", e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-base font-medium"
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border-4 border-black px-4 py-4 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={formState.is_published}
                onChange={(e) => handleFieldChange("is_published", e.target.checked)}
                className="h-5 w-5 accent-black"
              />
              <span className="text-sm font-bold uppercase tracking-[0.12em]">
                Hiển thị cho người dùng
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-teal-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-teal-700 transition-all active:scale-[0.98] disabled:opacity-40 text-sm"
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
                : "border-teal-500 bg-teal-50 text-teal-700"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <div className="mb-6 grid gap-4 rounded-[1.5rem] border-4 border-black bg-white p-5 md:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="space-y-2">
            <label htmlFor="hdsd-search" className="text-xs font-black uppercase tracking-widest pl-1">Tìm kiếm</label>
            <input
              id="hdsd-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tiêu đề, tóm tắt, slug..."
              className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-base font-medium"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="hdsd-section-filter" className="text-xs font-black uppercase tracking-widest pl-1">
              Chuyên mục
            </label>
            <select
              id="hdsd-section-filter"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-base font-medium bg-white"
            >
              <option value="all">Tất cả</option>
              {sections.map((s) => (
                <option key={s.slug} value={s.slug}>{s.title}</option>
              ))}
            </select>
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="w-full py-16 text-center border-4 border-dashed border-slate-200 rounded-[2rem]">
            <p className="font-bold text-slate-400 italic">Chưa có bài viết nào trong hệ thống.</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="w-full py-12 text-center border-4 border-dashed border-slate-200 rounded-[2rem]">
            <p className="font-bold text-slate-400 italic">Không tìm thấy bài viết.</p>
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
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full border-2 border-black bg-slate-100">
                        {article.section_title}
                      </span>
                      <span
                        className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full border-2 ${
                          article.is_published
                            ? "border-teal-500 bg-teal-50 text-teal-700"
                            : "border-slate-300 bg-slate-100 text-slate-500"
                        }`}
                      >
                        {article.is_published ? "Hiển thị" : "Nháp"}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{article.slug}</span>
                    </div>

                    <h3 className="text-lg font-black truncate hover:underline">
                      <Link href={`/hdsd/${article.section_slug}/${article.slug}`} target="_blank">
                        {article.title}
                      </Link>
                    </h3>

                    {article.summary ? (
                      <p className="mt-1 text-sm text-slate-500 line-clamp-2">{article.summary}</p>
                    ) : null}

                    <p className="mt-2 text-xs text-slate-400">
                      Cập nhật: {formatDateTime(article.updated_at)}
                    </p>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePublished(article)}
                      disabled={isPending}
                      title={article.is_published ? "Ẩn bài" : "Hiển thị"}
                      className="p-2.5 rounded-xl border-2 border-black hover:bg-slate-100 transition-colors disabled:opacity-40"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEdit(article)}
                      disabled={isPending}
                      className="p-2.5 rounded-xl border-2 border-black hover:bg-slate-100 transition-colors disabled:opacity-40"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(article)}
                      disabled={isPending || removingId === article.id}
                      className="p-2.5 rounded-xl border-2 border-red-400 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
