import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Fetch current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // 2. Fetch user's role from user_private_data
  const { data: privateData } = await supabase
    .from("user_private_data")
    .select("role")
    .eq("id", user.id)
    .single();

  // 3. Verify admin role
  if (privateData?.role !== "admin") {
    redirect("/");
  }

  return <>{children}</>;
}
