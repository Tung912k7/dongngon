export type WikiArticleRecord = {
  id: string;
  slug: string;
  sectionSlug: string;
  sectionTitle: string;
  title: string;
  summary: string;
  contentMarkdown: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WikiSectionRecord = {
  slug: string;
  title: string;
  articles: WikiArticleRecord[];
};

export type WikiArticleUpsertInput = {
  id?: string;
  slug: string;
  sectionSlug: string;
  sectionTitle: string;
  title: string;
  summary?: string;
  contentMarkdown: string;
  sortOrder?: number;
  isPublished?: boolean;
};

export type WikiActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
