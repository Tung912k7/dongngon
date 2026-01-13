import Header from "@/components/Header";
import { createClient } from "@/utils/supabase/server";

export default async function DongNgonPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-white font-serif text-black">
      <Header user={user} />
      <main className="mx-auto max-w-7xl p-8">
        {/* Blank content */}
      </main>
    </div>
  );
}
