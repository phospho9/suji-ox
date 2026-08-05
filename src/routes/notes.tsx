import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/hooks/useAuth";
import { fetchIncorrectQuestions } from "@/lib/quiz-api";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "오답노트 | 수지 SUJI 수능지리" },
      {
        name: "description",
        content:
          "틀린 세계지리 기출 선지를 모아 다시 푸는 오답노트. 약점 단원만 골라 반복 훈련하며 완전 정복해요.",
      },
      { property: "og:title", content: "오답노트 | 수지 SUJI 수능지리" },
      {
        property: "og:description",
        content: "틀린 기출 선지만 모아 반복 훈련하는 약점 정복 오답노트.",
      },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const { user, ready, signingIn, signInWithGoogle } = useAuth();
  const userId = user?.id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["incorrect", userId],
    queryFn: () => fetchIncorrectQuestions(userId!),
    enabled: Boolean(userId),
  });

  const items = data ?? [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 pb-16 pt-7">
      <AppNav />

      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-1">
        <h1 className="truncate font-display text-2xl">
          📒 <span className="gradient-text">오답노트</span>
        </h1>
        {items.length > 0 && (
          <Link
            to="/quiz"
            search={{ mode: "incorrect" }}
            className="shrink-0 rounded-2xl btn-gradient px-4 py-2.5 text-xs font-bold transition active:scale-95"
          >
            오답 다시 풀기 🔁
          </Link>
        )}
      </div>

      {!userId ? (
        <section className="glass-card flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
          <div className="animate-float text-5xl">🗂️</div>
          <p className="font-display text-xl">오답노트는 로그인하면 자동으로 쌓여요</p>
          <button
            onClick={() => void signInWithGoogle()}
            disabled={signingIn || !ready}
            className="w-full max-w-xs rounded-3xl btn-gradient px-6 py-4 font-display text-lg transition active:scale-95 disabled:opacity-60"
          >
            {signingIn ? "연결 중..." : "Google 로그인 💖"}
          </button>
        </section>
      ) : isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div
            className="size-12 animate-spin rounded-full border-4 border-secondary border-t-primary"
            role="status"
            aria-label="불러오는 중"
          />
        </div>
      ) : isError ? (
        <p className="glass-card p-8 text-center text-sm text-muted-foreground">
          오답노트를 불러오지 못했어요. 잠시 후 다시 시도해 주세요 🥲
        </p>
      ) : items.length === 0 ? (
        <div className="glass-card flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
          <p className="text-4xl">🌟</p>
          <p className="font-display text-xl">아직 오답이 없어요!</p>
          <p className="text-sm text-muted-foreground">
            퀴즈를 풀면 틀린 선지가 이곳에 자동으로 모여요.
          </p>
          <Link
            to="/quiz"
            className="mt-2 rounded-2xl btn-gradient px-6 py-3 text-sm font-bold transition active:scale-95"
          >
            퀴즈 풀러 가기 →
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-3 px-1 text-xs font-bold text-destructive">
            총 {items.length}개의 약점 선지가 기다리고 있어요 🔥
          </p>
          <ul className="grid gap-4">
            {items.map((q, i) => (
              <li key={q.id} className="glass-card p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-[11px] font-bold text-muted-foreground">
                  <span className="truncate">
                    {i + 1}. {q.unit}
                  </span>
                  <span className="shrink-0 rounded-full bg-destructive px-3 py-1 text-destructive-foreground">
                    오답 ❌
                  </span>
                </div>
                <p className="mt-2 font-bold leading-relaxed">{q.statement}</p>
                <span className="mt-3 inline-block rounded-full bg-mint/60 px-3 py-1 text-[11px] font-bold text-mint-foreground">
                  정답 {q.is_correct === 1 ? "O" : "X"}
                </span>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {q.explanation}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-[11px] text-muted-foreground">출처 · {q.source}</p>
                  <ReportIssueButton questionId={q.id} userId={userId} />
                </div>
              </li>
            ))}
          </ul>

          <Link
            to="/quiz"
            search={{ mode: "incorrect" }}
            className="mt-8 w-full animate-pulse-soft rounded-3xl btn-gradient py-4 text-center font-display text-lg transition active:scale-95"
          >
            오답만 모아 다시 풀기 🔁
          </Link>
        </>
      )}
    </main>
  );
}
