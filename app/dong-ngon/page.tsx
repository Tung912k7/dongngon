import { createClient } from "@/utils/supabase/server";
import { formatDate } from "@/utils/date";
import DongNgonClient from "@/components/DongNgonClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đồng ngôn - Kho tàng tác phẩm",
  description: "Khám phá những áng thơ văn, câu nói hay và các tác phẩm sáng tác ngẫu hứng từ cộng đồng Đồng ngôn.",
};

export default async function DongNgonPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>;
}) {
    const { query: q } = await searchParams;
    const supabase = await createClient();

    // Fetch User first to use in filter
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch Works with privacy filter
    const { data: rawWorks, error } = await (async () => {
        let query = supabase
            .from("works")
            .select("id, title, category_type, sub_category, limit_type, status, created_at, author_nickname, privacy, created_by")
            .order("created_at", { ascending: false });

        // Privacy Filter: Only show Public works OR works created by the current user
        // We use .or() for (A OR B) and regular chain for AND
        if (user) {
            query = query.or(`privacy.ilike.public,created_by.eq.${user.id}`);
        } else {
            query = query.ilike("privacy", "public");
        }

        if (q) {
            query = query.or(`title.ilike.%${q}%,author_nickname.ilike.%${q}%`);
        }
        return await query;
    })();

    if (error) {
        console.error("Supabase server-side fetch error:", error);
    }

    // Pre-map the works on the server to avoid hydration mismatch/logic duplication
    const mappedWorks = (rawWorks || []).map((work: any) => ({
        ...work,
        type: work.category_type,
        hinh_thuc: work.sub_category,
        rule: work.limit_type === "sentence" ? "1 câu" : "1 kí tự",
        status: work.status === "writing" ? "Đang viết" : 
                work.status === "finished" ? "Hoàn thành" : 
                work.status === "pending" ? "Đợi duyệt" : work.status,
        date: formatDate(work.created_at),
        rawDate: work.created_at // Pass the string; Client will convert to Date object
    }));

    return (
        <DongNgonClient 
            initialWorks={mappedWorks} 
            initialUser={user} 
        />
    );
}
