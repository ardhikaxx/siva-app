"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, BookOpen, Settings, PieChart, BookText } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname === "/onboarding" || pathname === "/login" || pathname === "/register") return null;

  const links = [
    { href: "/", label: "Beranda", icon: Home },
    { href: "/calendar", label: "Kalender", icon: CalendarDays },
    { href: "/journal", label: "Jurnal", icon: BookOpen },
    { href: "/insights", label: "Analitik", icon: PieChart },
    { href: "/education", label: "Edukasi", icon: BookText },
    { href: "/settings", label: "Profil", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-brand-100 pb-safe pb-4 pt-2 px-6 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link key={link.href} href={link.href} className="flex flex-col items-center">
            <div className={`p-2 rounded-2xl transition-colors ${isActive ? "bg-brand-100 text-brand-600" : "text-brand-300 hover:text-brand-500"}`}>
              <Icon size={24} />
            </div>
            <span className={`text-[10px] mt-1 font-medium ${isActive ? "text-brand-700" : "text-brand-400"}`}>
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
