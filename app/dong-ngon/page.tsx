import { createClient } from "@/utils/supabase/server";
import { formatDate } from "@/utils/date";
import DongNgonClient from "@/components/DongNgonClient";

export default async function DongNgonPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>;
}) {
    const { query: q } = await searchParams;
    const supabase = await createClient();

    // Fetch User and Works in parallel on the server
    const [
        { data: { user } },
        { data: rawWorks, error }
    ] = await Promise.all([
        supabase.auth.getUser(),
        (async () => {
            let query = supabase
                .from("works")
                .select("id, title, category_type, sub_category, limit_type, status, created_at, author_nickname")
                .order("created_at", { ascending: false });

            if (q) {
                query = query.or(`title.ilike.%${q}%,author_nickname.ilike.%${q}%`);
            }
            return await query;
        })()
    ]);

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
