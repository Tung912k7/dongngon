"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { HelpCenterArticleRecord, HelpCenterArticleUpsertInput } from "@/types/helpCenter";

function getAdminSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl) {
    throw new Error("Missing Supabase URL for admin operations");
  }

  if (!supabaseServiceKey) {
    throw new Error("Missing Supabase service role key for admin operations");
  }

  return { supabaseUrl, supabaseServiceKey };
}

// Use service role key to bypass RLS for admin operations
function createAdminClient() {
  const { supabaseUrl, supabaseServiceKey } = getAdminSupabaseConfig();

  return createSupabaseClient(supabaseUrl, supabaseServiceKey);
}

// Check admin role
async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  return true; 
}

// Fetch a single published article by slug
export async function getHDSDArticleBySlug(sectionSlug: string, articleSlug: string): Promise<HelpCenterArticleRecord | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('help_center_articles')
      .select('*')
      .eq('section_slug', sectionSlug)
      .eq('slug', articleSlug)
      .eq('is_published', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching HDSD article by slug:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error fetching HDSD article by slug:', err);
    return null;
  }
}

export async function getAdminHDSDArticles(): Promise<{ success: boolean; data?: HelpCenterArticleRecord[]; error?: string }> {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { success: false, error: "Unauthorized" };
    
    const adminDb = createAdminClient();
    const { data, error } = await adminDb
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

export async function getPublishedHDSDArticles(): Promise<{ success: boolean; data?: HelpCenterArticleRecord[]; error?: string }> {
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

    const adminDb = createAdminClient();
    
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
    console.error("[HDSD] Failed to upsert article:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function deleteHDSDArticle(id: string) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { success: false, error: "Unauthorized" };

    const adminDb = createAdminClient();
    const { error } = await adminDb
      .from("help_center_articles")
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/hdsd");
    revalidatePath("/hdsd");
    
    return { success: true };
  } catch (error) {
    console.error("[HDSD] Failed to delete article:", error);
    return { success: false, error: "Internal server error" };
  }
}
