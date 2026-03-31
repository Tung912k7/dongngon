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
            .select("id, title, category_type, sub_category, limit_type, status, created_at, author_nickname, privacy, created_by, age_rating")
            .order("created_at", { ascending: false });

        // Privacy Filter: Only show Public works OR works created by the current user
        // We use .or() for (A OR B) and regular chain for AND
        if (user) {
            query = query.or(`privacy.eq.Public,created_by.eq.${user.id}`);
        } else {
            query = query.eq("privacy", "Public");
        }

        if (q) {
            query = query.or(`title.ilike.%${q}%,author_nickname.ilike.%${q}%`);
        }
        return await query;
    })();

    if (error) {
        console.error("[KhoTang] Server fetch error:", error.code, error.message);
    }

    // Pre-map the works on the server to avoid hydration mismatch/logic duplication
    const mappedWorks = ((rawWorks || []) as WorkRow[]).map((work) => {
        return {
            ...work,
            title: sanitizeTitle(work.title),
            author_nickname: sanitizeNickname(work.author_nickname),
            type: work.category_type,
            hinh_thuc: work.sub_category,
            rule: "1 câu",
            age_rating: work.age_rating ?? undefined,
            status: work.status === "writing" ? "Đang viết" : 
                    work.status === "finished" ? "Hoàn thành" : 
                    work.status === "pending" ? "Đợi duyệt" : work.status,
            date: formatDate(work.created_at),
            rawDate: new Date(work.created_at),
            is_author_private: false,
        };
    });

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
                        "numberOfItems": mappedWorks.length,
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
            />
        </>
    );
}
