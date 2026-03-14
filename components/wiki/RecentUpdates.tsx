import Link from "next/link";

type UpdateItem = {
  id: string;
  title: string;
  category: string;
  href: string;
  updatedAt: string;
};

const RECENT_UPDATES: UpdateItem[] = [
  {
    id: "update-1",
    title: "Cap nhat huong dan dat tieu de de de tim tren wiki",
    category: "Bien tap",
    href: "/wiki?article=huong-dan-dat-tieu-de",
    updatedAt: "2026-03-14",
  },
  {
    id: "update-2",
    title: "Bo sung quy tac trich dan va dan nguon noi bo",
    category: "Quy tac",
    href: "/wiki?article=quy-tac-trich-dan",
    updatedAt: "2026-03-13",
  },
  {
    id: "update-3",
    title: "Dieu chinh checklist truoc khi dang de giam loi thieu",
    category: "Quy trinh",
    href: "/wiki?article=checklist-truoc-khi-dang",
    updatedAt: "2026-03-11",
  },
  {
    id: "update-4",
    title: "Them mau mo bai theo 3 kieu mo phong van de",
    category: "Mau viet",
    href: "/wiki?article=mau-mo-bai",
    updatedAt: "2026-03-08",
  },
];

function formatFallbackDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getRecencyLabel(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return formatFallbackDate(value);
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime();
  const diffDays = Math.round((today - target) / 86400000);

  if (diffDays <= 0) {
    return "Hom nay";
  }

  if (diffDays === 1) {
    return "Hom qua";
  }

  if (diffDays > 1 && diffDays <= 7) {
    return `${diffDays} ngay truoc`;
  }

  return formatFallbackDate(value);
}

export default function RecentUpdates() {
  return (
    <section aria-labelledby="wiki-recent-title" className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Moi cap nhat</p>
        <h2 id="wiki-recent-title" className="mt-2 text-2xl font-semibold leading-tight text-ink md:text-3xl">
          Cap nhat gan day de ban theo kip thay doi
        </h2>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-2 md:p-3">
        <ul className="divide-y divide-border" aria-label="Danh sach bai viet cap nhat gan day">
          {RECENT_UPDATES.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="group flex items-start justify-between gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
                aria-label={`Doc bai ${item.title}`}
              >
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-ink transition-colors group-hover:text-accent md:text-base">{item.title}</h3>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="rounded bg-accent-soft px-2 py-0.5 text-xs text-accent">{item.category}</span>
                    <span className="text-xs text-muted">{formatFallbackDate(item.updatedAt)}</span>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-muted">{getRecencyLabel(item.updatedAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}