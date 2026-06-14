"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, BookOpen, Settings, PieChart, BookText } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  if (pathname === "/onboarding" || pathname === "/login" || pathname === "/register") return null;

  const links = [
    { href: "/", label: t('nav_home'), icon: Home },
    { href: "/calendar", label: t('nav_calendar'), icon: CalendarDays },
    { href: "/journal", label: t('nav_journal'), icon: BookOpen },
    { href: "/insights", label: t('nav_insights'), icon: PieChart },
    { href: "/education", label: t('nav_education'), icon: BookText },
  ];

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <nav className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-white/50 px-2 py-3 flex justify-between items-center shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-full w-full max-w-[360px] relative">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="relative flex flex-col items-center justify-center w-[60px] h-12 z-10 tap-highlight-transparent">
              {isActive && (
                <motion.div
                  layoutId="bottomNavBubble"
                  className="absolute inset-0 bg-brand-50 rounded-full -z-10"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
              <motion.div
                initial={false}
                animate={{ 
                  y: isActive ? -10 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`flex flex-col items-center ${isActive ? "text-brand-600" : "text-gray-400 hover:text-brand-400 transition-colors"}`}
              >
                <div className={`p-2.5 rounded-full ${isActive ? "bg-brand-500 text-white shadow-lg shadow-brand-200" : "bg-transparent"}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {isActive && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[10px] mt-1 font-bold text-brand-700 absolute -bottom-4 whitespace-nowrap"
                  >
                    {link.label}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
