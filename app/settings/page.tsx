import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SettingsClient from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/dang-nhap");
  }

  // Fetch user profile data (nickname, avatar)
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <SettingsClient 
        user={user} 
        initialNickname={profile?.nickname || ""} 
        initialAvatarUrl={profile?.avatar_url || ""} 
      />
    </div>
  );
}
