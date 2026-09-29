"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "მთავარი" },
  { href: "/admin/products", label: "პროდუქცია" },
  { href: "/admin/categories", label: "კატეგორიები" },
  { href: "/admin/coa", label: "COA სერტიფიკატები" },
  { href: "/admin/reviews", label: "შეფასებები" },
  { href: "/admin/texts", label: "გვერდების ტექსტები" },
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/legal", label: "იურიდიული გვერდები" },
  { href: "/admin/settings", label: "კონტაქტი და ფუტერი" },
];

export function AdminNav() {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));
  return (
    <aside className="bg-navy text-white lg:sticky lg:top-0 lg:h-screen">
      <div className="flex items-center justify-between px-5 py-4 lg:block lg:py-6">
        <Link href="/admin" className="text-[17px] font-bold tracking-tight">
          SOLO <span className="text-blue">ადმინი</span>
        </Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "shrink-0 px-3 py-2 text-[14px] transition-colors",
              active(l.href) ? "bg-white/12 font-bold text-white" : "text-white/75 hover:bg-white/6 hover:text-white",
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="hidden border-t border-white/10 px-3 pt-4 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block lg:pb-5">
        <a href="/" target="_blank" className="block px-3 py-2 text-[13px] text-white/75 hover:text-white">
          საიტის ნახვა ↗
        </a>
        <form action={logout}>
          <button type="submit" className="w-full px-3 py-2 text-left text-[13px] text-white/75 hover:text-white">
            გასვლა
          </button>
        </form>
      </div>
      <form action={logout} className="px-3 pb-3 lg:hidden">
        <button type="submit" className="text-[13px] text-white/75">
          გასვლა
        </button>
      </form>
    </aside>
  );
}
