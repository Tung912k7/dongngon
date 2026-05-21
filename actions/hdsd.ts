"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { createClient } from "@/utils/supabase/server";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import type { HelpCenterArticleRecord, HelpCenterArticleUpsertInput } from "@/types/helpCenter";
import { logger } from "@/lib/logger";

function getSupabaseUrl() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("Missing Supabase URL for admin operations");
  }

  return supabaseUrl;
}

function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || null;
}

async function createHDSDWriteClient() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseServiceKey = getSupabaseServiceRoleKey();

  if (supabaseServiceKey) {
    return createSupabaseClient(supabaseUrl, supabaseServiceKey);
  }

  logger.warn("[HDSD] Service role key missing; falling back to authenticated admin client.");
  return await createClient();
}

// Check admin role
async function checkAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: privateData } = await supabase
    .from("user_private_data")
    .select("role")
    .eq("id", user.id)
    .single();

  return privateData?.role === "admin";
}

// Fetch a single published article by slug
export async function getHDSDArticleBySlug(
  sectionSlug: string,
  articleSlug: string
): Promise<HelpCenterArticleRecord | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("help_center_articles")
      .select("*")
      .eq("section_slug", sectionSlug)
      .eq("slug", articleSlug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) {
      logger.error("Error fetching HDSD article by slug:", error);
      return null;
    }

    return data;
  } catch (err) {
    logger.error("Unexpected error fetching HDSD article by slug:", err);
    return null;
  }
}

export async function getAdminHDSDArticles(): Promise<{
  success: boolean;
  data?: HelpCenterArticleRecord[];
  error?: string;
}> {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { success: false, error: "Unauthorized" };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("help_center_articles")
      .select("*")
      .order("section_title", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as HelpCenterArticleRecord[] };
  } catch {
    return { success: false, error: "Internal server error" };
  }
}

export async function getPublishedHDSDArticles(): Promise<{
  success: boolean;
  data?: HelpCenterArticleRecord[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("help_center_articles")
      .select("*")
      .eq("is_published", true)
      .order("section_title", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as HelpCenterArticleRecord[] };
  } catch {
    return { success: false, error: "Internal server error" };
  }
}

export async function upsertHDSDArticle(input: HelpCenterArticleUpsertInput) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { success: false, error: "Unauthorized" };

    const adminDb = await createHDSDWriteClient();

    const payload = {
      ...input,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await adminDb
      .from("help_center_articles")
      .upsert(payload)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/hdsd");
    revalidatePath("/hdsd");

    return { success: true, data: data as HelpCenterArticleRecord };
  } catch (error) {
    logger.error("[HDSD] Failed to upsert article:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function deleteHDSDArticle(id: string) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { success: false, error: "Unauthorized" };

    const adminDb = await createHDSDWriteClient();
    const { error } = await adminDb.from("help_center_articles").delete().eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/hdsd");
    revalidatePath("/hdsd");

    return { success: true };
  } catch (error) {
    logger.error("[HDSD] Failed to delete article:", error);
    return { success: false, error: "Internal server error" };
  }
}
