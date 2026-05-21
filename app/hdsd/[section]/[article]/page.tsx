// app/hdsd/[section]/[article]/page.tsx
// Help Center article page — dynamically fetching content from database.
// Layout: breadcrumb, article header, content body with sidebar (TOC + Related).

import React from "react";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import { getHDSDArticleBySlug, getPublishedHDSDArticles } from "@/actions/hdsd";
import { HELP_CENTER_SECTIONS } from "@/data/helpCenter";
import HelpCenterBreadcrumb from "@/components/hdsd/HelpCenterBreadcrumb";
import HelpCenterArticleSidebar from "@/components/hdsd/HelpCenterArticleSidebar";
import { Metadata } from "next";

interface HelpCenterArticlePageProps {
  params: Promise<{
    section: string;
    article: string;
  }>;
}

export async function generateMetadata({ params }: HelpCenterArticlePageProps): Promise<Metadata> {
  const { section: sectionSlug, article: articleSlug } = await params;
  const article = await getHDSDArticleBySlug(sectionSlug, articleSlug);

  if (!article) return { title: "Không tìm thấy bài viết" };

  return {
    title: `${article.title} | Hướng dẫn`,
    description: article.summary || `Hướng dẫn chi tiết về bài viết: ${article.title}`,
    openGraph: {
      title: `${article.title} | Hướng dẫn sử dụng Đồng ngôn`,
      description: article.summary || `Hướng dẫn chi tiết về bài viết: ${article.title}`,
      type: "article",
    },
  };
}

export default async function HelpCenterArticlePage({ params }: HelpCenterArticlePageProps) {
  const { section: sectionSlug, article: articleSlug } = await params;

  // Fetch the specific article
  const article = await getHDSDArticleBySlug(sectionSlug, articleSlug);

  if (!article) {
    return notFound();
  }

  // Find section metadata
  const section = HELP_CENTER_SECTIONS.find((s) => s.id === sectionSlug);
  const sectionLabel = article.section_title || section?.title || "Chủ đề";

  // Fetch all published articles to find "Related Articles"
  const publishedResult = await getPublishedHDSDArticles();
  const allArticles = publishedResult.success ? publishedResult.data || [] : [];

  // Related articles = same section, excluding current one
  const relatedArticles = allArticles
    .filter((a) => a.section_slug === sectionSlug && a.slug !== articleSlug)
    .slice(0, 3)
    .map((a) => ({
      title: a.title,
      href: `/hdsd/${sectionSlug}/${a.slug}`,
      sectionIcon: section?.icon || "question",
      sectionLabel: sectionLabel,
      readingTime: `${Math.ceil(a.content_markdown.split(" ").length / 200)} phút`,
    }));

  // Simple TOC generation from H2 and H3 tags in markdown
  // We'll extract headers using a regex for a basic TOC.
  // This extracts lines starting with ## or ### (ignoring spaces)
  const headerRegex = /^#{2,3}\s+(.*$)/gm;
  const headers = Array.from(article.content_markdown.matchAll(headerRegex)).map((match, idx) => {
    const label = match[1].trim();
    // Create a URL-friendly ID from the label
    const id = `header-${idx}`;
    return { id, label };
  });

  const TOC_ITEMS =
    headers.length > 0 ? headers : [{ id: "article-root", label: "Nội dung chính" }];

  const updatedDate = new Date(article.updated_at);
  const formattedDate = `${updatedDate.getDate()} tháng ${updatedDate.getMonth() + 1}, ${updatedDate.getFullYear()}`;

  const readingTime = `${Math.ceil(article.content_markdown.split(/\s+/).length / 200)} phút đọc`;

  return (
    <div className="min-h-screen bg-neutral-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Article",
                headline: article.title,
                description: article.summary || article.title,
                url: `https://dongngon.vercel.app/hdsd/${sectionSlug}/${articleSlug}`,
                dateModified: article.updated_at,
                inLanguage: "vi",
                isPartOf: {
                  "@type": "WebSite",
                  "@id": "https://dongngon.vercel.app/#website",
                },
                publisher: {
                  "@id": "https://dongngon.vercel.app/#organization",
                },
                mainEntityOfPage: {
                  "@type": "WebPage",
                  "@id": `https://dongngon.vercel.app/hdsd/${sectionSlug}/${articleSlug}`,
                },
                articleSection: sectionLabel,
                wordCount: article.content_markdown.split(/\s+/).length,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Trang chủ",
                    item: "https://dongngon.vercel.app",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Hướng dẫn sử dụng",
                    item: "https://dongngon.vercel.app/hdsd",
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: sectionLabel,
                    item: `https://dongngon.vercel.app/hdsd/${sectionSlug}`,
                  },
                  {
                    "@type": "ListItem",
                    position: 4,
                    name: article.title,
                  },
                ],
              },
            ],
          }),
        }}
      />
      {/* ─── Breadcrumb ─── */}
      <div className="w-full bg-white border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <HelpCenterBreadcrumb
            items={[
              {
                label: "Hướng dẫn sử dụng",
                href: "/hdsd",
                className:
                  "text-[#388186] font-bold underline decoration-dotted underline-offset-4",
              },
              { label: sectionLabel, href: `/hdsd/${sectionSlug}` },
              { label: article.title },
            ]}
          />
        </div>
      </div>

      {/* ─── Main Layout ─── */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Article Content ── */}
          <article className="flex-1 min-w-0">
            {/* Header Area */}
            <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden mb-6">
              <div className="p-8 pb-4">
                <div className="flex items-center gap-4 mb-6">
                  <span className="inline-block px-3 py-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                    {sectionLabel}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-400">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    {readingTime}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 leading-tight mb-4 tracking-tight">
                  {article.title}
                </h1>

                <p className="text-sm font-bold text-neutral-400 mb-8">
                  Cập nhật lần cuối: {formattedDate}
                </p>

                <div className="h-px w-full bg-neutral-100 mb-10" />

                {/* Body Content */}
                <div
                  className="prose prose-neutral prose-lg max-w-none 
                  prose-headings:font-black prose-headings:tracking-tight prose-headings:text-neutral-900
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-6
                  prose-p:text-neutral-600 prose-p:leading-relaxed prose-p:mb-6
                  prose-strong:text-neutral-900 prose-strong:font-bold
                  prose-a:text-[#388186] prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:not-italic prose-blockquote:bg-neutral-50 prose-blockquote:border-none prose-blockquote:p-8 prose-blockquote:rounded-[24px] prose-blockquote:relative
                  prose-pre:bg-neutral-900 prose-pre:rounded-2xl
                  prose-img:rounded-3xl prose-img:border prose-img:border-neutral-100
                "
                >
                  <ReactMarkdown
                    components={{
                      h2: ({ node, children, ...props }) => {
                        const label = String(children);
                        const idx = headers.findIndex((h) => h.label === label);
                        return (
                          <h2
                            id={idx !== -1 ? `header-${idx}` : undefined}
                            className="group"
                            {...props}
                          >
                            {children}
                          </h2>
                        );
                      },
                      h3: ({ node, children, ...props }) => {
                        const label = String(children);
                        const idx = headers.findIndex((h) => h.label === label);
                        return (
                          <h3 id={idx !== -1 ? `header-${idx}` : undefined} {...props}>
                            {children}
                          </h3>
                        );
                      },
                      blockquote: ({ children }) => {
                        // Check if children contain "Mẹo:" or similar
                        return (
                          <blockquote className="my-10 p-8 bg-neutral-50 rounded-[28px] border-none relative overflow-hidden group">
                            <div className="flex gap-4 items-start relative z-10">
                              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm border border-neutral-100 flex-shrink-0">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
                                  <path d="M9 18h6" />
                                  <path d="M10 22h4" />
                                </svg>
                              </div>
                              <div className="flex-1 text-neutral-600 prose-p:mb-0 prose-strong:text-neutral-900">
                                {children}
                              </div>
                            </div>
                          </blockquote>
                        );
                      },
                    }}
                  >
                    {article.content_markdown}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </article>

          {/* ── Sidebar ── */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              <HelpCenterArticleSidebar toc={TOC_ITEMS} relatedArticles={relatedArticles} />

              {/* Extra Help Card */}
              <div className="p-6 bg-neutral-900 text-white rounded-[24px] overflow-hidden relative group">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <h4 className="font-bold mb-2 relative z-10">Vẫn chưa tìm thấy điều bạn cần?</h4>
                <p className="text-sm text-neutral-400 mb-4 relative z-10">
                  Chúng mình luôn sẵn sàng hỗ trợ bạn bất cứ lúc nào.
                </p>
                <a
                  href="/lien-he"
                  className="inline-flex items-center text-xs font-black uppercase tracking-widest text-teal-400 hover:text-teal-300 transition-colors relative z-10"
                >
                  Liên hệ ngay
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
