import Link from "next/link";

type CategoryItem = {
  id: string;
  name: string;
  description: string;
  count: number;
  href: string;
  icon: string;
};

const CATEGORIES: CategoryItem[] = [
  {
    id: "bat-dau",
    name: "Bat dau",
    description: "Huong dan can ban de vao nhip viet nhanh va dung.",
    count: 12,
    href: "/wiki?category=bat-dau",
    icon: "Compass",
  },
  {
    id: "viet-va-dang",
    name: "Viet va dang",
    description: "Quy trinh tao bai, bien tap va dang noi dung chat luong.",
    count: 18,
    href: "/wiki?category=viet-va-dang",
    icon: "Feather",
  },
  {
    id: "tuong-tac",
    name: "Tuong tac",
    description: "Quy tac ung xu, dong gop va giu chat luong cong dong.",
    count: 9,
    href: "/wiki?category=tuong-tac",
    icon: "Users",
  },
  {
    id: "tai-khoan",
    name: "Tai khoan",
    description: "Quan ly ho so, bao mat va tuy chinh trai nghiem su dung.",
    count: 7,
    href: "/wiki?category=tai-khoan",
    icon: "Shield",
  },
  {
    id: "kinh-nghiem",
    name: "Kinh nghiem",
    description: "Mau viet, meo trinh bay va cach nang cap chat luong bai.",
    count: 14,
    href: "/wiki?category=kinh-nghiem",
    icon: "BookOpen",
  },
  {
    id: "faq",
    name: "FAQ",
    description: "Tong hop cau hoi pho bien va cach xu ly nhanh gon.",
    count: 10,
    href: "/wiki?category=faq",
    icon: "MessageCircle",
  },
];

export default function CategoryGrid() {
  return (
    <section aria-labelledby="wiki-category-title" className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Danh muc</p>
        <h2 id="wiki-category-title" className="mt-2 text-2xl font-semibold leading-tight text-ink md:text-3xl">
          Chon chu de ban dang can
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            className="rounded-2xl border border-border bg-paper p-5 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{category.icon}</p>
            <h3 className="mt-2 text-base font-semibold leading-snug text-ink">{category.name}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{category.description}</p>
            <p className="mt-3 text-xs text-muted">{category.count} bai viet</p>
          </Link>
        ))}
      </div>
    </section>
  );
}