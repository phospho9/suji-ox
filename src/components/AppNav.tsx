import { Link } from "@tanstack/react-router";
import { Flame, LayoutDashboard, Moon, NotebookPen, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

const LINKS = [
  { to: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { to: "/quiz", label: "퀴즈", icon: Flame },
  { to: "/notes", label: "오답노트", icon: NotebookPen },
] as const;

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("suji-theme");
    const prefersDark =
      stored === "dark" ||
      (stored === null && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("suji-theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label="테마 전환"
      className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card/60 text-muted-foreground transition hover:text-foreground active:scale-90"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

export function AppNav() {
  const { user, signingIn, signInWithGoogle, signOut } = useAuth();

  return (
    <header className="mb-6 flex flex-col gap-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-2xl btn-gradient text-base">
            🌸
          </span>
          <span className="truncate font-display text-xl tracking-tight gradient-text">
            수지 SUJI
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <span className="hidden max-w-28 truncate rounded-full border border-primary/25 bg-secondary/70 px-3 py-1.5 text-[11px] font-bold text-secondary-foreground sm:block">
                {user.displayName} 💖
              </span>
              <button
                onClick={() => void signOut()}
                className="rounded-full border border-border px-3 py-1.5 text-[11px] font-bold text-muted-foreground transition active:scale-95"
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              onClick={() => void signInWithGoogle()}
              disabled={signingIn}
              className="rounded-full btn-gradient px-4 py-2 text-[11px] font-bold transition active:scale-95 disabled:opacity-60"
            >
              {signingIn ? "연결 중..." : "Google 로그인 💖"}
            </button>
          )}
        </div>
      </div>

      <nav className="glass-card flex items-center gap-1 p-1.5">
        {LINKS.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            activeProps={{ className: "btn-gradient" }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold text-muted-foreground transition hover:text-foreground active:scale-95"
          >
            <l.icon className="size-4" />
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
