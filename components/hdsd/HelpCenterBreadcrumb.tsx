// components/hdsd/HelpCenterBreadcrumb.tsx
// Breadcrumb navigation for Help Center article pages.

import React from "react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  className?: string;
}

interface HelpCenterBreadcrumbProps {
  items: BreadcrumbItem[];
}

const HelpCenterBreadcrumb: React.FC<HelpCenterBreadcrumbProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-neutral-500">
      <ol className="flex items-center flex-wrap gap-1">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-1">
            {idx > 0 && (
              <span className="text-neutral-300 mx-1" aria-hidden="true">
                &gt;
              </span>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className={`hover:text-neutral-800 transition-colors ${item.className || ""}`}
              >
                {item.label}
              </Link>
            ) : (
              <span className={`text-neutral-800 font-medium ${item.className || ""}`}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default HelpCenterBreadcrumb;
