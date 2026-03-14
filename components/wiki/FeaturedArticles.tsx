import Link from "next/link";

type ArticleItem = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  dateText: string;
  href: string;
};

const LEAD_ARTICLE: ArticleItem = {
  id: "lead",
  title: "Lam chu giong van: tu dan y den ban thao dau tien",
  excerpt:
    "Huong dan tung buoc de xay dung bo cuc mach lac, giu nhip cau va truyen tai dung thong diep khi viet bai dai.",
  category: "Ky nang viet",
  readTime: "8 phut doc",
  dateText: "14/03/2026",
  href: "/wiki?article=lam-chu-giong-van",
};

const SECONDARY_ARTICLES: ArticleItem[] = [
  {
    id: "secondary-1",
    title: "Checklist truoc khi dang bai",
    excerpt: "Danh sach 10 diem can ra soat de bai ro rang, dung chuan va de doc.",
    category: "Quy trinh",
    readTime: "5 phut doc",
    dateText: "13/03/2026",
    href: "/wiki?article=checklist-truoc-khi-dang-bai",
  },
  {
    id: "secondary-2",
    title: "Viet mo dau thu hut ma khong cau ky",
    excerpt: "Meo mo dau gon, chac, giup nguoi doc vao bai trong 2 dong dau.",
    category: "Bien tap",
    readTime: "4 phut doc",
    dateText: "12/03/2026",
    href: "/wiki?article=viet-mo-dau-thu-hut",
  },
];

export default function FeaturedArticles() {
  return (
    <section aria-labelledby="wiki-featured-title" className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Noi bat</p>
        <h2 id="wiki-featured-title" className="mt-2 text-2xl font-semibold leading-tight text-ink md:text-3xl">
          Bai viet duoc bien tap de bat dau nhanh
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Link
          href={LEAD_ARTICLE.href}
          className="rounded-2xl border border-border bg-paper p-6 transition-all duration-200 hover:border-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
        >
          <span className="inline-flex rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">{LEAD_ARTICLE.category}</span>
          <h3 className="mt-4 text-2xl font-semibold leading-tight text-ink md:text-[2rem]">{LEAD_ARTICLE.title}</h3>
          <p className="mt-3 text-base leading-7 text-muted">{LEAD_ARTICLE.excerpt}</p>
          <p className="mt-5 text-sm text-muted">
            {LEAD_ARTICLE.readTime} · {LEAD_ARTICLE.dateText}
          </p>
        </Link>

        <div className="grid grid-cols-1 gap-5">
          {SECONDARY_ARTICLES.map((article) => (
            <Link
              key={article.id}
              href={article.href}
              className="rounded-2xl border border-border bg-paper p-5 transition-all duration-200 hover:border-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
            >
              <span className="inline-flex rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">{article.category}</span>
              <h3 className="mt-3 text-lg font-semibold leading-snug text-ink">{article.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{article.excerpt}</p>
              <p className="mt-3 text-xs text-muted">
                {article.readTime} · {article.dateText}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}