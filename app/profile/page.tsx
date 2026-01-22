import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Work } from "@/types/database";
import EditProfileModal from "@/components/EditProfileModal";
import CreateWorkModal from "@/components/CreateWorkModal";
import DeleteWorkButton from "@/components/DeleteWorkButton";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/dang-nhap");
  }

  // Fetch Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch Created Works
  const { data: createdWorks } = await supabase
    .from("works")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  // Fetch Contributed Works (Unique)
  const { data: contributions } = await supabase
    .from("contributions")
    .select("work_id, works(*)")
    .eq("user_id", user.id);

  // Filter unique works from contributions
  const contributedWorksList = Array.from(
    new Map((contributions || [])
      .filter(c => c.works && (c.works as any).created_by !== user.id)
      .map(c => [(c.works as any).id, c.works as unknown as Work]))
      .values()
  );

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 md:pb-24 font-sans">
      <main className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar */}
        <div className="w-full md:w-1/3 bg-white p-10 rounded-[4rem] border-2 border-black flex flex-col items-center shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]">
          {/* Title */}
          <div className="mb-14 text-center">
            <h1 className="text-5xl font-aquus font-bold uppercase tracking-tight mb-3">HỒ SƠ</h1>
            <div className="w-12 h-2.5 bg-black mx-auto"></div>
          </div>

          {/* Avatar Container with solid border */}
          <div className="w-64 h-64 mb-16 border-2 border-black flex items-center justify-center overflow-hidden bg-white">
            <Image
              src={profile?.avatar_url || "/default_avatar.png"}
              alt="Avatar"
              width={256}
              height={256}
              className={`w-full h-full object-cover ${(!profile?.avatar_url || profile.avatar_url === "/default_avatar.png") ? 'scale-[0.8]' : ''}`}
              priority
            />
          </div>

          {/* Info */}
          <div id="tour-user-info" className="w-full space-y-8 text-left px-2">
            <div className="border-b border-gray-100 pb-2">
              <p className="text-[10px] text-gray-400 font-sans font-bold uppercase tracking-[0.2em] mb-2">BÚT DANH</p>
              <p className="text-3xl font-black text-black leading-none">{profile?.nickname}</p>
            </div>
            <div className="border-b border-gray-100 pb-2">
              <p className="text-[10px] text-gray-400 font-sans font-bold uppercase tracking-[0.2em] mb-2">EMAIL</p>
              <p className="text-lg font-bold text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>

          <div id="tour-edit-profile" className="w-full">
            <EditProfileModal 
              initialNickname={profile?.nickname || ""} 
              initialAvatarUrl={profile?.avatar_url || "/default_avatar.png"} 
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full bg-white border-2 border-black rounded-[3rem] overflow-hidden">
          
          {/* Created Works Section */}
          <div className="p-10">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-bold font-sans">Các tác phẩm đã tạo:</h2>
              {createdWorks && createdWorks.length > 0 && <CreateWorkModal />}
            </div>
            <div className="flex flex-wrap gap-6">
              {createdWorks && createdWorks.length > 0 ? (
                createdWorks.map((work) => (
                  <div key={work.id} className="relative group">
                    <DeleteWorkButton workId={work.id.toString()} workTitle={work.title} />
                    <Link 
                      href={`/work/${work.id}`}
                      className="w-36 aspect-[3/4] bg-black rounded-lg flex items-center justify-center p-4 hover:opacity-90 transition-opacity"
                    >
                      <span className="text-white font-bold text-center text-sm line-clamp-3">
                        {work.title}
                      </span>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="w-full py-16 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center text-gray-400 gap-6">
                  <p className="italic font-bold text-gray-400/60">Chưa tạo tác phẩm nào</p>
                  <CreateWorkModal />
                </div>
              )}
            </div>
          </div>

          {/* Separator */}
          <hr className="border-t-2 border-black" />

          <div className="p-10">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-bold font-sans">Các tác phẩm đã đóng góp:</h2>
              {contributedWorksList && contributedWorksList.length > 0 && (
                <Link 
                  href="/dong-ngon"
                  className="px-6 py-2 border-2 border-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                >
                  ĐÓNG GÓP
                </Link>
              )}
            </div>
            <div className="flex flex-wrap gap-6">
              {contributedWorksList && contributedWorksList.length > 0 ? (
                contributedWorksList.map((work) => (
                  <Link 
                    key={work.id} 
                    href={`/work/${work.id}`}
                    className="w-36 aspect-[3/4] bg-black rounded-lg flex items-center justify-center p-4 group hover:scale-105 transition-transform"
                  >
                    <span className="text-white font-bold text-center text-sm line-clamp-3">
                      {work.title}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="w-full py-16 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center text-gray-400 gap-6">
                  <p className="italic font-bold text-gray-400/60">Chưa có đóng góp nào</p>
                  <Link 
                    href="/dong-ngon"
                    className="px-10 py-3 bg-white border-2 border-black rounded-full text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] text-black"
                  >
                    ĐÓNG GÓP
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
