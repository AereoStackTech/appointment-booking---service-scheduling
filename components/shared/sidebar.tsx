"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Layers,
  Clock,
  Users,
  Settings,
  ExternalLink,
  Shield,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { LanguageSelector } from "@/components/shared/language-selector";
import { useLanguage } from "@/lib/i18n/context";

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    {
      label: t("operationalAgenda"),
      href: "/dashboard",
      icon: LayoutDashboard,
      match: pathname === "/dashboard",
    },
    {
      label: t("appointmentsHub"),
      href: "/appointments",
      icon: CalendarCheck,
      match: pathname.startsWith("/appointments"),
    },
    {
      label: t("serviceCatalog"),
      href: "/services",
      icon: Layers,
      match: pathname.startsWith("/services"),
    },
    {
      label: t("availabilityHours"),
      href: "/availability",
      icon: Clock,
      match: pathname.startsWith("/availability"),
    },
    {
      label: t("clientDirectory"),
      href: "/clients",
      icon: Users,
      match: pathname.startsWith("/clients"),
    },
    {
      label: t("studioSettings"),
      href: "/settings",
      icon: Settings,
      match: pathname.startsWith("/settings"),
    },
  ];

  return (
    <aside className="w-64 bg-stone-900 text-stone-100 flex flex-col justify-between border-r border-stone-800 shrink-0 select-none min-h-screen">
      {/* Top Brand */}
      <div>
        <div className="p-6 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <CalendarCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-xl tracking-tight leading-none block">
                {t("brandName")}
              </span>
              <span className="text-[10px] text-stone-400 font-mono tracking-wider">
                {t("operations")}
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Link to Client Portal */}
        <div className="px-4 pb-2">
          <Link
            href="/book"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 rounded-md border border-indigo-800/50 transition-colors"
          >
            <span className="flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-2 text-indigo-400" />
              {t("clientPortal")}
            </span>
            <ExternalLink className="w-3 h-3 text-indigo-400" />
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  item.match
                    ? "bg-stone-800 text-white font-semibold shadow-xs"
                    : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    item.match ? "text-indigo-400" : "text-stone-400"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile & Language Changer */}
      <div className="p-4 border-t border-stone-800 bg-stone-950/40 space-y-3">
        {/* Language Changer inside sidebar */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] text-stone-400 font-medium">
            {t("language")}
          </span>
          <LanguageSelector variant="dark" align="left" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-stone-800/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
            </div>
            <div className="truncate">
              <span className="text-xs font-semibold text-white block truncate">
                {user?.name || "Admin User"}
              </span>
              <span className="text-[10px] text-stone-500 font-mono block">
                {user?.role === "ADMIN" ? "Administrator" : "Staff Operator"}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center justify-center px-3 py-1.5 text-xs text-stone-400 hover:text-white hover:bg-stone-800 rounded-md transition-colors border border-stone-800"
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" />
          {t("signOut")}
        </button>
      </div>
    </aside>
  );
}
