// types/helpCenter.ts
// TypeScript types and interfaces for Help Center domain

export interface HelpCenterSection {
  id: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface HelpCenterArticle {
  id: string;
  sectionId: string;
  title: string;
  content: string;
  tags?: string[];
}

export interface HelpCenterArticleRecord {
  id: string;
  slug: string;
  section_slug: string;
  section_title: string;
  title: string;
  summary: string;
  content_markdown: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface HelpCenterArticleUpsertInput {
  id?: string;
  slug: string;
  section_slug: string;
  section_title: string;
  title: string;
  summary?: string;
  content_markdown: string;
  sort_order?: number;
  is_published?: boolean;
}

