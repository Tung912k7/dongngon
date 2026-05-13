import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SettingsClient from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/dang-nhap");
  }
  // Auth check is now handled by middleware.ts

  // Fetch user profile data (nickname, avatar, description, is_private)
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, avatar_url, description, is_private, public_fields")
    .eq("id", user.id)
    .single();

  const { data: privateData } = await supabase
    .from("user_private_data")
    .select("birthday")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <SettingsClient 
        user={user} 
        initialNickname={profile?.nickname || ""} 
        initialAvatarUrl={profile?.avatar_url || ""} 
        initialBirthday={privateData?.birthday || null}
        initialDescription={profile?.description || ""}
        initialIsPrivate={profile?.is_private || false}
        initialPublicFields={profile?.public_fields || {}}
      />
    </div>
  );
}

