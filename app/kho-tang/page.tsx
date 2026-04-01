import { createClient } from "@/utils/supabase/server";
import { formatDate } from "@/utils/date";
import DongNgonClient from "@/components/DongNgonClient";
import { Metadata } from "next";
import { sanitizeTitle, sanitizeNickname } from "@/utils/sanitizer";

type WorkRow = {
    id: string;
    title: string;
    category_type: string;
    sub_category: string;
    limit_type: string;
    status: string;
    created_at: string;
    author_nickname: string;
    privacy: string;
    created_by: string;
    age_rating: string | null;
    description: string | null;
};

export const metadata: Metadata = {
  title: "Đồng ngôn - Kho tàng tác phẩm",
  description: "Mỗi một tác phẩm là một hạt giống đang chờ bạn vun trồng. Triệu hạt giống tạo nên cánh đồng văn học bạt ngàn và vô tận.",
  openGraph: {
    title: "Kho tàng tác phẩm | Đồng ngôn",
    description: "Mỗi một tác phẩm là một hạt giống đang chờ bạn vun trồng. Triệu hạt giống tạo nên cánh đồng văn học bạt ngàn và vô tận.",
    url: "https://dongngon.vercel.app/kho-tang",
    siteName: "Đồng ngôn",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kho tàng tác phẩm | Đồng ngôn",
    description: "Khám phá hàng ngàn tác phẩm văn học ngẫu hứng tại Đồng ngôn.",
  },
};

// Map UI status labels back to DB values for server-side filtering
const STATUS_UI_TO_DB: Record<string, string> = {
    "Đang viết": "writing",
    "Hoàn thành": "finished",
    "Đợi duyệt": "pending",
};

// Map DB status values to UI labels
const STATUS_DB_TO_UI: Record<string, string> = {
    writing: "Đang viết",
    finished: "Hoàn thành",
    pending: "Đợi duyệt",
};

export default async function DongNgonPage({
    searchParams,
}: {
    searchParams: Promise<{
        query?: string;
        category?: string;
        form?: string;
        rule?: string;
        sort?: string;
        status?: string;
        limit?: string;
        page?: string;
    }>;
}) {
    const params = await searchParams;
    const q = params.query || "";
    const categoryFilter = params.category || "";
    const formFilter = params.form || "";
    const sortDate = params.sort || "newest";
    const statusFilter = params.status || "";
    const limit = Math.min(Math.max(parseInt(params.limit || "10") || 10, 5), 20);
    const page = Math.max(parseInt(params.page || "1") || 1, 1);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. IMPROVED SEARCH: Pre-search in contributions if query exists
    let contentMatchedWorkIds: string[] = [];
    if (q) {
        const { data: contribMatches } = await supabase
            .from("contributions")
            .select("work_id")
            .eq('is_test', false)
            .ilike("content", `%${q}%`)
            .limit(100);
        
        if (contribMatches) {
            contentMatchedWorkIds = [...new Set(contribMatches.map(c => c.work_id))];
        }
    }

    // 2. Build server-side query on works table
    let query = supabase
        .from("works")
        .select(
            "id, title, category_type, sub_category, limit_type, status, created_at, author_nickname, privacy, created_by, age_rating, description",
            { count: "exact" }
        );

    // Privacy & Test filter
    if (user) {
        // Only show (privacy Public AND non-test) OR user's own works (including test)
        query = query.or(`and(privacy.eq.Public,is_test.eq.false),created_by.eq.${user.id}`);
    } else {
        query = query.eq("privacy", "Public").eq("is_test", false);
    }

    // Category filter
    if (categoryFilter) {
        query = query.eq("category_type", categoryFilter);
    }

    // Form/sub_category filter
    if (formFilter) {
        query = query.eq("sub_category", formFilter);
    }

    // Status filter
    if (statusFilter) {
        const dbStatus = STATUS_UI_TO_DB[statusFilter];
        if (dbStatus) {
            query = query.eq("status", dbStatus);
        }
    }

    // 3. IMPROVED SEARCH SCOPE: Title, Author, Description, AND Content Matches
    if (q) {
        let orCondition = `title.ilike.%${q}%,author_nickname.ilike.%${q}%,description.ilike.%${q}%`;
        if (contentMatchedWorkIds.length > 0) {
            // Append content-matched IDs to the OR filter
            orCondition += `,id.in.(${contentMatchedWorkIds.join(",")})`;
        }
        query = query.or(orCondition);
    }

    // Sort - If searching, real-world relevance ranking is preferred but here we default to date
    query = query.order("created_at", { ascending: sortDate === "oldest" });

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: rawWorks, count, error } = await query;

    if (error) {
        console.error("[KhoTang] Server fetch error:", error.code, error.message);
    }

    // 4. IMPROVED RANKING (In-memory for current page)
    const sortedWorks = [...(rawWorks || [])].sort((a, b) => {
        if (!q) return 0;
        
        // Helper to check for relevance
        const score = (w: any) => {
            let s = 0;
            const qLower = q.toLowerCase();
            if (w.title?.toLowerCase().includes(qLower)) s += 100;
            if (w.author_nickname?.toLowerCase().includes(qLower)) s += 50;
            if (w.description?.toLowerCase().includes(qLower)) s += 20;
            if (contentMatchedWorkIds.includes(w.id)) s += 10;
            return s;
        };
        
        const scoreA = score(a);
        const scoreB = score(b);
        
        if (scoreA !== scoreB) return scoreB - scoreA;
        // If scores equal, fallback to date (respecting sortDate param)
        return sortDate === "oldest" 
            ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const totalCount = count || 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    // Map works for client
    const mappedWorks = (sortedWorks as WorkRow[]).map((work) => ({
        ...work,
        title: sanitizeTitle(work.title),
        author_nickname: sanitizeNickname(work.author_nickname),
        type: work.category_type,
        hinh_thuc: work.sub_category,
        rule: "1 câu",
        age_rating: work.age_rating ?? undefined,
        status: STATUS_DB_TO_UI[work.status] || work.status,
        date: formatDate(work.created_at),
        rawDate: new Date(work.created_at),
        is_author_private: false,
        description: work.description ?? undefined,
    }));

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        "name": "Kho tàng tác phẩm",
                        "description": "Mỗi một tác phẩm là một hạt giống đang chờ bạn vun trồng. Triệu hạt giống tạo nên cánh đồng văn học bạt ngàn và vô tận.",
                        "url": "https://dongngon.vercel.app/kho-tang",
                        "isPartOf": {
                            "@type": "WebSite",
                            "@id": "https://dongngon.vercel.app/#website"
                        },
                        "inLanguage": "vi",
                        "numberOfItems": totalCount,
                        "breadcrumb": {
                            "@type": "BreadcrumbList",
                            "itemListElement": [
                                {
                                    "@type": "ListItem",
                                    "position": 1,
                                    "name": "Trang chủ",
                                    "item": "https://dongngon.vercel.app"
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 2,
                                    "name": "Kho tàng",
                                    "item": "https://dongngon.vercel.app/kho-tang"
                                }
                            ]
                        }
                    })
                }}
            />
            <DongNgonClient
                initialWorks={mappedWorks}
                initialUser={user}
                totalCount={totalCount}
                totalPages={totalPages}
                currentPage={page}
            />
        </>
    );
}
