"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  Bell,
  BookOpen,
  CalendarCheck,
  CalendarX,
  CheckCheck,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Inbox,
  ListChecks,
  ShoppingBag,
  Upload,
  MessageCircleQuestion,
  NotebookPen,
  Sparkles,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  countMyUnread,
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type PortalNotification,
} from "@/app/portal/notification-actions";
import { countAdminUnread, getAdminNotifications, markAdminNotificationRead, markAllAdminNotificationsRead } from "@/app/admin/_actions/notifications";

// The same bell for clients (portal) and Rangika (dashboard); only where the data comes from differs.
const SOURCES = {
  portal: { list: getMyNotifications, count: countMyUnread, read: markNotificationRead, readAll: markAllNotificationsRead },
  admin: { list: getAdminNotifications, count: countAdminUnread, read: markAdminNotificationRead, readAll: markAllAdminNotificationsRead },
};

const ICON: Record<string, typeof Bell> = {
  MATERIAL: FileText,
  TASK: ListChecks,
  TRACKER: ClipboardCheck,
  PROMPT: NotebookPen,
  ANSWER: MessageCircleQuestion,
  JOURNAL_REPLY: NotebookPen,
  SESSION_BOOKED: CalendarCheck,
  SESSION_CANCELLED: CalendarX,
  ZOOM_LINK: Video,
  PLAN: Sparkles,
  CLASS: GraduationCap,
  CLASS_MATERIAL: GraduationCap,
  CERTIFICATE: Award,
  COURSE: BookOpen,
  LESSON: BookOpen,
  // Rangika's
  NEW_BOOKING: CalendarCheck,
  CLASS_SALE: ShoppingBag,
  COURSE_SALE: ShoppingBag,
  ENQUIRY: Inbox,
  QUESTION: MessageCircleQuestion,
  UPLOAD: Upload,
  JOURNAL: NotebookPen,
  COURSE_FINISHED: Award,
};

/** "just now", "5 min ago", "3 h ago", "yesterday", "12 Nov". */
function ago(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h ago`;
  if (h < 48) return "yesterday";
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

/**
 * The bell at the top of the portal: a red number for unread notifications, and a list of the latest
 * ("New material from Rangika", "Rangika answered your question"…). Opening one marks it read and goes there.
 * The number refreshes on every page change, every minute, and when the tab is shown again.
 */
export function NotificationBell({ initialUnread, scope = "portal" }: { initialUnread: number; scope?: "portal" | "admin" }) {
  const api = SOURCES[scope];
  const [unread, setUnread] = useState(initialUnread);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PortalNotification[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [, start] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const box = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const r = await api.list();
      setItems(r.items);
      setUnread(r.unread);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [api]);

  // Keep the number fresh.
  useEffect(() => {
    let stop = false;
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      api
        .count()
        .then((n) => !stop && setUnread(n))
        .catch(() => {});
    };
    refresh();
    const timer = setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      stop = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [pathname, api]);

  // Close on a page change, a click outside, or Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) void load();
  };

  const openItem = (n: PortalNotification) => {
    if (!n.read) {
      setItems((list) => list?.map((x) => (x.id === n.id ? { ...x, read: true } : x)) ?? null);
      setUnread((u) => Math.max(0, u - 1));
      void api.read(n.id).catch(() => {});
    }
    setOpen(false);
    if (n.href) start(() => router.push(n.href!));
  };

  const readAll = () => {
    setItems((list) => list?.map((x) => ({ ...x, read: true })) ?? null);
    setUnread(0);
    void api.readAll().catch(() => {});
  };

  return (
    <div ref={box} className="relative">
      <button
        suppressHydrationWarning
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unread ? `Notifications, ${unread} new` : "Notifications"}
        className={cn("relative flex h-9 w-9 items-center justify-center rounded-full text-stone-600 transition hover:bg-stone-100", open && "bg-sage-100 text-sage-800")}
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="fixed inset-x-3 top-16 z-50 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-stone-200 duration-150 animate-in fade-in slide-in-from-top-2 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96"
        >
          <div className="flex items-center justify-between gap-2 border-b border-stone-100 px-4 py-3">
            <p className="font-serif text-lg text-stone-800">Notifications</p>
            {items?.some((n) => !n.read) && (
              <button suppressHydrationWarning type="button" onClick={readAll} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-sage-700 hover:bg-sage-50">
                <CheckCheck className="h-3.5 w-3.5" aria-hidden /> Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-[min(70vh,28rem)] overflow-y-auto">
            {items === null ? (
              failed ? (
                <p className="px-4 py-8 text-center text-sm text-stone-500">We couldn&apos;t load your notifications. Please try again.</p>
              ) : (
                <div className="space-y-3 p-4" aria-label="Loading">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-9 w-9 animate-pulse rounded-full bg-stone-100" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-3 w-3/4 animate-pulse rounded bg-stone-100" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-stone-100" />
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto h-8 w-8 text-stone-300" aria-hidden />
                <p className="mt-2 text-sm text-stone-500">
                  {scope === "admin"
                    ? "Nothing new yet. New bookings, enquiries, questions and client activity show here."
                    : "Nothing new yet. When Rangika adds something for you, it shows here."}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-stone-100">
                {items.map((n) => {
                  const Icon = ICON[n.kind] ?? Bell;
                  return (
                    <li key={n.id}>
                      <button
                        suppressHydrationWarning
                        type="button"
                        onClick={() => openItem(n)}
                        className={cn("flex w-full gap-3 px-4 py-3 text-left transition hover:bg-stone-50", !n.read && "bg-sage-50/60")}
                      >
                        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", n.read ? "bg-stone-100 text-stone-500" : "bg-sage-100 text-sage-700")}>
                          <Icon className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={cn("block text-sm leading-snug", n.read ? "text-stone-700" : "font-medium text-stone-900")}>{n.title}</span>
                          {n.body && <span className="mt-0.5 block line-clamp-2 text-xs text-stone-500">{n.body}</span>}
                          <span className="mt-1 block text-[11px] text-stone-400">{ago(n.at)}</span>
                        </span>
                        {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sage-600" aria-label="New" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
