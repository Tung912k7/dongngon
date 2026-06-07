import { createClient } from "@/utils/supabase/server";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Validate UUID v4 format */
export function isValidUuid(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

/** Require authenticated user — returns supabase client + user, or error object */
export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, user: null, error: "Unauthorized" } as const;
  return { supabase, user, error: null } as const;
}

/** Require admin role — returns supabase client + user, or error object */
export async function requireAdmin() {
  const result = await requireAuth();
  if (result.error) return result;

  const { supabase, user } = result;
  const { data } = await supabase
    .from("user_private_data")
    .select("role")
    .eq("id", user.id)
    .single();

  if (data?.role !== "admin") {
    return { supabase: null, user: null, error: "Forbidden: Admins only" } as const;
  }
  return { supabase, user, error: null } as const;
}
