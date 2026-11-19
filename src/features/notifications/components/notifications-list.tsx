"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatAgo } from "@/lib/format";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/server/actions/notification.actions";
import type { NotificationRow } from "@/server/services/notification.service";

const REASON_TEXT: Record<string, string> = {
  GUARD_REJECTED: "the guard rejected this entry",
  ALREADY_USED: "the code had already been used",
  EXPIRED: "the pass had expired",
  REVOKED: "the pass had been revoked",
  NOT_YET_VALID: "the pass wasn’t valid yet",
  NOT_FOUND: "the code didn’t match a pass",
};

function message(n: NotificationRow): string {
  const visitor = n.visitor ?? "Someone";
  const unit = n.unit ? ` at ${n.unit}` : "";
  if (n.decision === "approved") return `${visitor} was let in${unit}.`;
  const reason = n.reason
    ? (REASON_TEXT[n.reason] ?? "it was rejected")
    : "it was rejected";
  return `An entry attempt for ${visitor}${unit} was rejected — ${reason}.`;
}

export function NotificationsList({
  estateId,
  notifications,
}: {
  estateId: string;
  notifications: NotificationRow[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [now] = useState(() => Date.now());
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  async function markOne(n: NotificationRow) {
    if (n.readAt) return;
    setBusyId(n.id);
    await markNotificationReadAction(estateId, n.id);
    setBusyId(null);
    router.refresh();
  }

  async function markAll() {
    setMarkingAll(true);
    await markAllNotificationsReadAction(estateId);
    setMarkingAll(false);
    router.refresh();
  }

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <h1 className="type-h1 text-ink">Alerts</h1>
          <p className="mt-1 text-[15px] text-ink-2">
            Updates about the passes you’ve issued.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            icon={<CheckCheck className="size-4" />}
            onClick={markAll}
            disabled={markingAll}
            className="!h-9 !px-3 !text-sm"
          >
            {markingAll ? "Marking…" : "Mark all read"}
          </Button>
        )}
      </header>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          message="No alerts yet. You’ll see activity here when a visitor pass is used."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {notifications.map((n) => {
            const unread = !n.readAt;
            const row = (
              <div
                className={
                  unread
                    ? "flex items-start gap-3 rounded-card border border-accent/30 bg-accent-soft/40 p-4"
                    : "flex items-start gap-3 rounded-card border border-line bg-surface p-4"
                }
              >
                {unread && (
                  <span
                    className="mt-1.5 size-2 shrink-0 rounded-full bg-accent"
                    aria-hidden
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={
                      unread
                        ? "text-[15px] font-semibold text-ink"
                        : "text-[15px] text-ink"
                    }
                  >
                    {message(n)}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <StatusBadge status={n.decision} size="sm" />
                    <span className="tnum text-[13px] text-ink-2">
                      {formatAgo(now - n.createdAt.getTime())}
                    </span>
                  </div>
                </div>
                {unread && (
                  <button
                    type="button"
                    aria-label="Mark as read"
                    disabled={busyId === n.id}
                    onClick={(e) => {
                      e.preventDefault();
                      void markOne(n);
                    }}
                    className="shrink-0 rounded-control p-1.5 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-45"
                  >
                    <CheckCheck className="size-4" aria-hidden />
                  </button>
                )}
              </div>
            );
            return (
              <li key={n.id}>
                {n.passId ? (
                  <Link
                    href={`/resident/${estateId}/passes/${n.passId}`}
                    onClick={() => unread && void markOne(n)}
                    className="block"
                  >
                    {row}
                  </Link>
                ) : (
                  row
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
