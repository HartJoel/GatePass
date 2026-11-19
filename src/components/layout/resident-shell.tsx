"use client";

import { LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { BottomTabs } from "@/components/layout/navigation";
import { residentNav } from "@/lib/constants/navigation";
import { signOutAction } from "@/server/actions/auth.actions";

type Section = (typeof residentNav)[number]["id"];

function sectionOf(pathname: string, estateId: string): Section {
  const rest = pathname.split(`/resident/${estateId}`)[1] ?? "";
  const seg = rest.split("/").filter(Boolean)[0];
  if (seg === "passes") return "passes";
  if (seg === "notifications") return "notifications";
  return "home";
}

/** Resident shell: light theme, mobile-first, bottom tab bar instead of a sidebar. */
export function ResidentShell({
  estateId,
  estateName,
  unreadNotifications = 0,
  children,
}: {
  estateId: string;
  estateName: string;
  unreadNotifications?: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const section = sectionOf(pathname, estateId);

  const go = (id: Section) =>
    router.push(
      id === "home" ? `/resident/${estateId}` : `/resident/${estateId}/${id}`,
    );

  return (
    <div data-theme="light" className="flex h-screen flex-col bg-bg text-ink">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-5">
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[15px] font-semibold text-ink">
            {estateName}
          </p>
          <p className="type-caption text-ink-2">Resident</p>
        </div>
        {/* TODO(phase 5): read the signed-in resident from the session instead of a placeholder. */}
        <button
          type="button"
          aria-label="Sign out"
          title="Sign out"
          className="ml-auto rounded-control p-2.5 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
          onClick={() => signOutAction().then(() => router.push("/sign-in"))}
        >
          <LogOut className="size-[18px]" aria-hidden />
        </button>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[560px] px-4 pb-8 pt-6">{children}</div>
      </main>
      <BottomTabs
        items={residentNav}
        active={section}
        onSelect={(id) => go(id as Section)}
        badges={{ notifications: unreadNotifications }}
      />
    </div>
  );
}
