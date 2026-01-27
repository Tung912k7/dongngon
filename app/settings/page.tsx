import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/dang-nhap");
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-aquus font-bold uppercase tracking-tighter">Đang hoàn thiện</h1>
        <p className="text-gray-500 font-sans tracking-widest">CHỨC NĂNG CÀI ĐẶT SẼ SỚM RA MẮT</p>
      </div>
    </div>
  );
}
