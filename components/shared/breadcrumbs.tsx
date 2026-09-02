import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center text-xs text-stone-500 mb-4" aria-label="Breadcrumb">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-stone-900 transition-colors"
      >
        <Home className="w-3.5 h-3.5 mr-1" />
        <span>Ops</span>
      </Link>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center">
          <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-stone-300" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-stone-900 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-stone-900">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
