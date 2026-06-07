import { logger } from "@/lib/logger";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in search params, use it as the redirection URL
  const rawNext = searchParams.get("next") ?? "/";
  // Only allow safe relative paths — block protocol-relative URLs and external redirects
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    logger.error("Auth callback error:", error);
  }

  // return the user to login page with error
  return NextResponse.redirect(`${origin}/dang-nhap?error=auth-callback-failed`);
}
