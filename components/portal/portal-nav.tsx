"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, GraduationCap, Home, NotebookPen, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function PortalNav({
  hasSessions,
  hasCourses,
  hasLearning = false,
  newAnswers = 0,
  newReplies = 0,
  variant,
}: {
  hasSessions: boolean;
  hasCourses: boolean;
  hasLearning?: boolean;
  newAnswers?: number;
  newReplies?: number;
  variant: "top" | "bottom";
}) {
  const pathname = usePathname();
  const items: { href: string; label: string; icon: typeof Home; dot?: boolean; dotLabel?: string }[] = [
    { href: "/portal", label: "Today", icon: Home },
    ...(hasSessions ? [{ href: "/portal/sessions", label: "My sessions", icon: Sparkles, dot: newAnswers > 0, dotLabel: "new answer from Rangika" }] : []),
    ...(hasCourses ? [{ href: "/portal/classes", label: "My training", icon: GraduationCap }] : []),
    ...(hasLearning ? [{ href: "/portal/courses", label: "My courses", icon: BookOpen }] : []),
    { href: "/portal/journal", label: "Journal", icon: NotebookPen, dot: newReplies > 0, dotLabel: "new reply from Rangika" },
    { href: "/portal/profile", label: "Profile", icon: User },
  ];
  const active = (href: string) => (href === "/portal" ? pathname === href : pathname.startsWith(href));

  if (variant === "top") {
    return (
      <nav className="hidden items-center gap-1 md:flex">
        {items.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className={cn(
              "relative rounded-full px-3 py-1.5 text-sm transition-colors",
              active(i.href) ? "bg-sage-100 text-sage-800" : "text-stone-600 hover:bg-stone-100",
            )}
            aria-label={i.dot ? `${i.label}, ${i.dotLabel}` : undefined}
          >
            {i.label}
            {i.dot && <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" aria-hidden />}
          </Link>
        ))}
      </nav>
    );
  }
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid max-w-md" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            aria-label={i.dot ? `${i.label}, ${i.dotLabel}` : undefined}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[11px]",
              active(i.href) ? "text-sage-700" : "text-stone-500",
            )}
          >
            <span className="relative">
              <i.icon className={cn("h-5 w-5", active(i.href) && "stroke-[2.5]")} />
              {i.dot && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" aria-hidden />}
            </span>
            {i.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
