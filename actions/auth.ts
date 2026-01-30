"use server";

import { createClient } from "@/utils/supabase/server";
import { getErrorMessage } from "@/utils/error-handler";

export async function forgotPassword(email: string) {
  const supabase = await createClient();
  const headersList = await (await import('next/headers')).headers();
  const host = headersList.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const origin = `${protocol}://${host}`;
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/account/reset-password`,
  });

  if (error) {
    return { error: getErrorMessage(error) };
  }

  return { success: true };
}

export async function updatePassword(password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return { error: getErrorMessage(error) };
  }

  return { success: true };
}
