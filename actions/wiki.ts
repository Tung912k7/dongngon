"use server";

import { revalidatePath } from "next/cache";

import { getErrorMessage } from "@/utils/error-handler";
import { createClient } from "@/utils/supabase/server";
import type {
  WikiActionResult,
  WikiArticleRecord,
  WikiArticleUpsertInput,
  WikiSectionRecord,
} from "@/types/wiki";

type HelpCenterArticleRow = {
  id: string;
  slug: string;
  section_slug: string;
  section_title: string;
  title: string;
  summary: string | null;
  content_markdown: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

const ARTICLE_SELECT = [
  "id",
  "slug",
  "section_slug",
  "section_title",
  "title",
  "summary",
  "content_markdown",
  "sort_order",
  "is_published",
  "created_at",
  "updated_at",
].join(", ");

function mapRowToArticle(row: HelpCenterArticleRow): WikiArticleRecord {
  return {
    id: row.id,
    slug: row.slug,
    sectionSlug: row.section_slug,
    sectionTitle: row.section_title,
    title: row.title,
    summary: row.summary ?? "",
    contentMarkdown: row.content_markdown,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeSlug(value: string, fieldName: string) {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    throw new Error(`${fieldName} là bắt buộc.`);
  }

  if (!/^[a-z0-9-]+$/.test(normalized)) {
    throw new Error(`${fieldName} chỉ được dùng chữ thường, số và dấu gạch ngang.`);
  }

  if (normalized.length > 120) {
    throw new Error(`${fieldName} không được dài quá 120 ký tự.`);
  }

  return normalized;
}

function normalizeRequiredText(value: string | undefined, fieldName: string, maxLength: number) {
  const normalized = (value ?? "").trim();

  if (!normalized) {
    throw new Error(`${fieldName} là bắt buộc.`);
  }

  if (normalized.length > maxLength) {
    throw new Error(`${fieldName} không được dài quá ${maxLength} ký tự.`);
  }

  return normalized;
}

function normalizeOptionalText(value: string | undefined, maxLength: number) {
  const normalized = (value ?? "").trim();

  if (normalized.length > maxLength) {
    throw new Error(`Tóm tắt không được dài quá ${maxLength} ký tự.`);
  }

  return normalized;
}

function normalizeSortOrder(value: number | undefined) {
  if (value === undefined) {
    return 0;
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new Error("Thứ tự hiển thị phải là số nguyên không âm.");
  }

  return value;
}

function normalizeUuid(value: string, fieldName: string) {
  const normalized = value.trim();

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)) {
    throw new Error(`${fieldName} không hợp lệ.`);
  }

  return normalized;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("Bạn cần đăng nhập.");
  }

  return { supabase, user };
}

async function requireAdmin() {
  const { supabase, user } = await requireUser();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) {
    throw error;
  }

  if (!profile || profile.role !== "admin") {
    throw new Error("Bạn không có quyền thực hiện thao tác này.");
  }

  return { supabase, user };
}

function groupSections(rows: HelpCenterArticleRow[]): WikiSectionRecord[] {
  const sections = new Map<string, WikiSectionRecord>();

  for (const row of rows) {
    const article = mapRowToArticle(row);
    const existing = sections.get(article.sectionSlug);

    if (existing) {
      existing.articles.push(article);
      continue;
    }

    sections.set(article.sectionSlug, {
      slug: article.sectionSlug,
      title: article.sectionTitle,
      articles: [article],
    });
  }

  return Array.from(sections.values());
}

export async function getWikiSections(): Promise<WikiActionResult<WikiSectionRecord[]>> {
  try {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("help_center_articles")
      .select(ARTICLE_SELECT)
      .eq("is_published", true)
      .order("section_title", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: groupSections((data ?? []) as unknown as HelpCenterArticleRow[]),
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getAdminWikiArticles(): Promise<WikiActionResult<WikiArticleRecord[]>> {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("help_center_articles")
      .select(ARTICLE_SELECT)
      .order("section_title", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: ((data ?? []) as unknown as HelpCenterArticleRow[]).map(mapRowToArticle),
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function upsertWikiArticle(
  input: WikiArticleUpsertInput,
): Promise<WikiActionResult<WikiArticleRecord>> {
  try {
    const { supabase, user } = await requireAdmin();
    const articleId = input.id ? normalizeUuid(input.id, "Mã bài viết") : undefined;
    const payload = {
      slug: normalizeSlug(input.slug, "Slug bài viết"),
      section_slug: normalizeSlug(input.sectionSlug, "Slug chuyên mục"),
      section_title: normalizeRequiredText(input.sectionTitle, "Tên chuyên mục", 120),
      title: normalizeRequiredText(input.title, "Tiêu đề", 160),
      summary: normalizeOptionalText(input.summary, 320),
      content_markdown: normalizeRequiredText(input.contentMarkdown, "Nội dung markdown", 50000),
      sort_order: normalizeSortOrder(input.sortOrder),
      is_published: input.isPublished ?? true,
      updated_by: user.id,
    };

    const query = articleId
      ? supabase
          .from("help_center_articles")
          .update(payload)
          .eq("id", articleId)
          .select(ARTICLE_SELECT)
          .single()
      : supabase
          .from("help_center_articles")
          .insert({ ...payload, created_by: user.id })
          .select(ARTICLE_SELECT)
          .single();

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    revalidatePath("/wiki");
    revalidatePath("/admin/wiki");

    return {
      success: true,
      data: mapRowToArticle(data as unknown as HelpCenterArticleRow),
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteWikiArticle(id: string): Promise<WikiActionResult<null>> {
  try {
    const { supabase } = await requireAdmin();
    const articleId = normalizeUuid(id, "Mã bài viết");
    const { error } = await supabase.from("help_center_articles").delete().eq("id", articleId);

    if (error) {
      throw error;
    }

    revalidatePath("/wiki");
    revalidatePath("/admin/wiki");

    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
