"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { deleteHDSDArticle, upsertHDSDArticle } from "@/actions/hdsd";
import { HELP_CENTER_SECTIONS } from "@/data/helpCenter";
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

const CUSTOM_SECTION_VALUE = "__custom__";

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

function parseTemplateHeader(rawText: string) {
  const text = rawText.trimStart();

  let headerBlock = "";
  let content = rawText;

  if (text.startsWith("---")) {
    const lines = text.split(/\r?\n/);
    if (lines[0].trim() === "---") {
      let endIndex = -1;
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === "---") {
          endIndex = i;
          break;
        }
      }

      if (endIndex > 0) {
        headerBlock = lines.slice(1, endIndex).join("\n");
        content = lines.slice(endIndex + 1).join("\n").trimStart();
      }
    }
  }

  if (!headerBlock && text.startsWith("<!--")) {
    const endComment = text.indexOf("-->");
    if (endComment > -1) {
      headerBlock = text.slice(4, endComment).trim();
      content = text.slice(endComment + 3).trimStart();
    }
  }

  const metadata: Partial<ArticleFormState> = {};
  if (headerBlock) {
    const lines = headerBlock.split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const separatorIndex = line.indexOf(":");
      if (separatorIndex < 0) continue;

      const key = line.slice(0, separatorIndex).trim().toLowerCase();
      const value = line.slice(separatorIndex + 1).trim().replace(/^['\"]|['\"]$/g, "");

      if (key === "slug") metadata.slug = value;
      if (key === "section_slug") metadata.section_slug = value;
      if (key === "section_title") metadata.section_title = value;
      if (key === "title") metadata.title = value;
      if (key === "summary") metadata.summary = value;
      if (key === "sort_order") metadata.sort_order = value;
      if (key === "is_published") metadata.is_published = value.toLowerCase() === "true";
    }
  }

  return {
    metadata,
    content,
  };
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const sectionOptions = useMemo(() => {
    const combined = new Map<string, string>();
    for (const section of HELP_CENTER_SECTIONS) {
      combined.set(section.id, section.title);
    }
    for (const section of sections) {
      combined.set(section.slug, section.title);
    }

    return Array.from(combined.entries())
      .map(([slug, title]) => ({ slug, title }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [sections]);

  const isCustomSection = useMemo(
    () =>
      Boolean(formState.section_slug) &&
      !sectionOptions.some((option) => option.slug === formState.section_slug),
    [formState.section_slug, sectionOptions],
  );

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
    const selectedSection = sectionOptions.find((option) => option.slug === section_slug);
    const section_title = (selectedSection?.title || formState.section_title).trim();
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [".md", ".txt", ".html"];
    const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validTypes.includes(extension)) {
      setMessage({ type: "error", text: "Vui lòng chọn file .md, .txt hoặc .html" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawText = event.target?.result as string;
      if (rawText) {
        const parsed = parseTemplateHeader(rawText);
        const nextState: ArticleFormState = {
          ...formState,
          ...parsed.metadata,
          content_markdown: parsed.content || formState.content_markdown,
        };

        if (nextState.section_slug) {
          const selected = sectionOptions.find((option) => option.slug === nextState.section_slug);
          if (selected) {
            nextState.section_title = selected.title;
          }
        }

        if (!nextState.slug && nextState.title) {
          nextState.slug = toSlug(nextState.title);
        }

        setFormState(nextState);

        const warnings: string[] = [];
        if (!nextState.slug) warnings.push("Slug bài viết trống");
        if (!nextState.title) warnings.push("Tiêu đề trống");
        if (!nextState.section_slug) warnings.push("Chuyên mục trống");
        if (!nextState.content_markdown) warnings.push("Nội dung trống");

        const filledMetaCount = Object.keys(parsed.metadata).length;
        let messageText = filledMetaCount > 0
          ? `Đã nạp nội dung và ${filledMetaCount} trường metadata từ file: ${file.name}`
          : `Đã tải nội dung từ file: ${file.name}`;
        
        if (nextState.slug && !parsed.metadata.slug && nextState.title) {
          messageText += ` (auto-tạo slug từ tiêu đề)`;
        }

        const messageType = warnings.length > 0 ? "error" : "success";
        const warningText = warnings.length > 0 ? `\n⚠️ ${warnings.join(", ")}` : "";

        setMessage({
          type: messageType,
          text: messageText + warningText,
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadSample = () => {
    const sampleContent = `---
slug: huong-dan-tao-tai-khoan
section_slug: tai-khoan
section_title: Tài khoản
title: Hướng dẫn tạo tài khoản Đồng Ngôn
summary: Bài viết hướng dẫn nhanh cách đăng ký tài khoản mới.
sort_order: 1
is_published: true
---

# Hướng dẫn viết bài (Mẫu chuẩn)

Đây là bản mẫu tích hợp cả **Markdown** và các thẻ **HTML** được hỗ trợ tại Đồng Ngôn.

---

## 📸 1. Cách chèn hình ảnh
Cú pháp: \`![Mô tả ảnh](https://url-anh.jpg)\`

---

## 🛠️ 2. Các thẻ HTML được hỗ trợ
Hệ thống hỗ trợ các thẻ HTML cơ bản để tùy chỉnh giao diện bài viết:

- **Ngắt dòng**: Dùng thẻ \`<br />\` để ngắt dòng thủ công.
- **Văn bản**: 
  - \`<b>Chữ đậm</b>\` -> <b>Chữ đậm</b>
  - \`<i>Chữ nghiêng</i>\` -> <i>Chữ nghiêng</i>
  - \`<u>Gạch chân</u>\` -> <u>Gạch chân</u>
  - \`<small>Chữ nhỏ</small>\` -> <small>Chữ nhỏ</small>
- **Căn lề (Lưu ý: dùng thẻ div style nếu cần phức tạp)**:
  - \`<center>Nội dung căn giữa</center>\` -> <center>Căn giữa</center>
- **Danh sách (HTML)**:
  \`<ul><li>Mục 1</li><li>Mục 2</li></ul>\`
- **Lời dẫn (Blockquote)**:
  \`<blockquote>Nội dung lời dẫn trích dẫn</blockquote>\`

---

## 🖋️ 3. Định dạng Markdown nhanh
- **Tiêu đề**: Dùng \`#\`, \`##\`, \`###\`
- **Danh sách**: Dùng \`-\` hoặc \`1.\`
- **Mẹo/Lưu ý**: Dùng blockquote Markdown (\`>\`)

> 💡 **Mẹo:** Nên sử dụng Markdown cho văn bản thuần và HTML khi cần căn chỉnh vị trí hoặc các kiểu chữ đặc biệt (như gạch chân).

---

Chúc bạn có những bài viết hướng dẫn đẹp mắt!`;

    const blob = new Blob([sampleContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dong-ngon-huong-dan-mau-day-du.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
                Chuyên mục <span className="text-red-500">*</span>
              </label>
              <select
                value={isCustomSection ? CUSTOM_SECTION_VALUE : formState.section_slug}
                onChange={(e) => {
                  const selected = e.target.value;
                  if (selected === CUSTOM_SECTION_VALUE) {
                    handleFieldChange("section_slug", "");
                    handleFieldChange("section_title", "");
                    return;
                  }

                  const option = sectionOptions.find((item) => item.slug === selected);
                  if (!option) return;

                  handleFieldChange("section_slug", option.slug);
                  handleFieldChange("section_title", option.title);
                }}
                className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-base font-medium bg-white"
              >
                <option value="">Chọn chuyên mục</option>
                {sectionOptions.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.title}
                  </option>
                ))}
                <option value={CUSTOM_SECTION_VALUE}>Tự nhập chuyên mục mới</option>
              </select>
            </div>
          </div>

          {isCustomSection || !formState.section_slug ? (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest pl-1">
                  Slug chuyên mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formState.section_slug}
                  onChange={(e) => handleFieldChange("section_slug", e.target.value)}
                  placeholder="vd: tai-khoan"
                  className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-base font-medium font-mono"
                />
              </div>

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
            </div>
          ) : (
            <div className="rounded-2xl border-4 border-black bg-slate-50 px-5 py-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Slug chuyên mục</p>
              <p className="mt-1 font-mono text-sm">{formState.section_slug}</p>
              <p className="mt-3 text-xs font-black uppercase tracking-widest text-slate-500">Tên chuyên mục</p>
              <p className="mt-1 font-semibold">{formState.section_title}</p>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
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

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pl-1">
              <label className="text-xs font-black uppercase tracking-widest">
                Nội dung (Markdown hoặc HTML) <span className="text-red-500">*</span>
              </label>
              
              <div className="flex flex-wrap gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".md,.txt,.html"
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-black border-2 border-black rounded text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98]"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Tải từ máy tính
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white hover:bg-slate-800 border-2 border-black rounded text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98]"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Tải file mẫu đầy đủ
                </button>
              </div>
            </div>

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

            <div className="space-y-2 flex-1 min-w-[220px]">
              <label className="text-xs font-black uppercase tracking-widest pl-1">Trạng thái</label>
              <select
                value={formState.is_published ? "published" : "draft"}
                onChange={(e) => handleFieldChange("is_published", e.target.value === "published")}
                className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-base font-medium bg-white"
              >
                <option value="published">Hiển thị cho người dùng</option>
                <option value="draft">Lưu bản nháp (ẩn)</option>
              </select>
            </div>
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
                      className="p-2.5 rounded border-2 border-black hover:bg-slate-100 transition-colors disabled:opacity-40"
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
                      className="p-2.5 rounded border-2 border-black hover:bg-slate-100 transition-colors disabled:opacity-40"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(article)}
                      disabled={isPending || removingId === article.id}
                      className="p-2.5 rounded border-2 border-red-400 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
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

