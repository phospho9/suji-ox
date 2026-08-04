import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppNav } from "@/components/AppNav";
import { QuizRunner } from "@/components/QuizRunner";
import { useAuth } from "@/hooks/useAuth";
import { fetchIncorrectQuestions, fetchQuestions, type Question } from "@/lib/quiz-api";

export const Route = createFileRoute("/quiz")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search["mode"] === "incorrect" ? ("incorrect" as const) : ("daily" as const),
  }),
  head: () => ({
    meta: [
      { title: "오늘의 O/X 퀴즈 | 수지 SUJI 수능지리" },
      {
        name: "description",
        content:
          "AI 간격 반복으로 배치된 수능 세계지리 O/X 기출 20선지. 즉시 해설과 다음 복습 일정까지 한 번에 확인해요.",
      },
      { property: "og:title", content: "오늘의 O/X 퀴즈 | 수지 SUJI 수능지리" },
      {
        property: "og:description",
        content: "AI 간격 반복으로 배치된 수능 세계지리 O/X 기출 20선지를 지금 풀어보세요.",
      },
    ],
  }),
  component: QuizRoutePage,
});

function QuizRoutePage() {
  const { mode } = Route.useSearch();
  const { user, ready } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [runKey, setRunKey] = useState(0);

  const userId = user?.id ?? null;

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    const task =
      mode === "incorrect" && userId
        ? fetchIncorrectQuestions(userId)
        : fetchQuestions(userId);
    void task
      .then((data) => {
        if (cancelled) return;
        setQuestions(data.slice(0, 20));
      })
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [mode, userId, ready, runKey]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 pb-16 pt-7">
      <AppNav />

      <p className="mb-4 px-1 text-xs font-bold text-muted-foreground">
        {mode === "incorrect" ? "🔁 오답 집중 훈련 모드" : "🌸 오늘의 복습 · 신규 기출 20선지"}
      </p>

      {loading && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div
            className="size-12 animate-spin rounded-full border-4 border-secondary border-t-primary"
            role="status"
            aria-label="불러오는 중"
          />
          <p className="animate-pulse text-sm text-muted-foreground">
            기출 선지를 예쁘게 담고 있어요 🎀
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-5xl">🥲</p>
          <p className="font-display text-xl">문제를 불러오지 못했어요</p>
          <button
            onClick={() => setRunKey((n) => n + 1)}
            className="rounded-full btn-gradient px-7 py-3 text-base font-bold transition active:scale-95"
          >
            다시 시도 🔄
          </button>
        </div>
      )}

      {!loading && !error && questions.length === 0 && (
        <div className="glass-card flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
          <p className="text-4xl">🎉</p>
          <p className="font-display text-xl">지금 풀 문제가 없어요</p>
          <p className="text-sm text-muted-foreground">
            {mode === "incorrect"
              ? "오답이 모두 정복되었어요! 오늘의 퀴즈로 넘어가볼까요?"
              : "잠시 후 새로운 기출이 배치돼요."}
          </p>
          <Link
            to="/dashboard"
            className="mt-2 rounded-2xl btn-gradient px-6 py-3 text-sm font-bold transition active:scale-95"
          >
            대시보드로 가기 →
          </Link>
        </div>
      )}

      {!loading && !error && questions.length > 0 && (
        <QuizRunner
          key={`${mode}-${runKey}`}
          questions={questions}
          userId={user?.id ?? null}
          onExit={() => setRunKey((n) => n + 1)}
          exitLabel="한 세트 더 도전하기 🔄"
        />
      )}
    </main>
  );
}
