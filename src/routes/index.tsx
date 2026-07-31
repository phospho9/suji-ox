import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

const API_URL = "https://world-geography-test.acumoxa.workers.dev/api/questions";

type Question = {
  id: number;
  statement: string;
  is_correct: number;
  unit: string;
  explanation: string;
  source: string;
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "세계지리 기출 O/X 모의고사 | 수능 대비 20문제" },
      {
        name: "description",
        content:
          "수능 세계지리 기출 O/X 20문제를 풀고 즉시 해설과 출처를 확인하세요. 점수와 오답노트까지 한 번에.",
      },
      { property: "og:title", content: "세계지리 기출 O/X 모의고사" },
      {
        property: "og:description",
        content: "수능 세계지리 기출 O/X 20문제 + 즉시 해설 + 오답노트",
      },
    ],
  }),
  component: QuizPage,
});

type Phase = "intro" | "quiz" | "result";

function Spinner() {
  return (
    <div
      className="size-10 animate-spin rounded-full border-3 border-border border-t-primary"
      role="status"
      aria-label="불러오는 중"
    />
  );
}

function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(false);
    fetch(API_URL)
      .then((r) => {
        if (!r.ok) throw new Error("bad response");
        return r.json();
      })
      .then((data: Question[]) => {
        if (!alive) return;
        setQuestions(Array.isArray(data) ? data.slice(0, 20) : []);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [reload]);

  const score = useMemo(
    () =>
      answers.reduce(
        (acc, a, i) => acc + (a === (questions[i]?.is_correct === 1) ? 1 : 0),
        0,
      ),
    [answers, questions],
  );

  const total = questions.length || 20;
  const current = questions[index];

  function start() {
    setIndex(0);
    setAnswers([]);
    setPicked(null);
    setPhase("quiz");
  }

  function choose(value: boolean) {
    if (picked !== null) return;
    setPicked(value);
    setAnswers((prev) => [...prev, value]);
  }

  function next() {
    if (index + 1 >= questions.length) {
      setPhase("result");
    } else {
      setIndex((i) => i + 1);
    }
    setPicked(null);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 pb-12 pt-8">
      {loading && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <Spinner />
          <p className="text-sm text-muted-foreground">문제를 불러오는 중이에요…</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-lg font-semibold">문제를 불러오지 못했어요</p>
          <p className="text-sm text-muted-foreground">
            네트워크 상태를 확인한 뒤 다시 시도해 주세요.
          </p>
          <button
            onClick={() => setReload((n) => n + 1)}
            className="rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lift active:scale-[0.98]"
          >
            다시 시도
          </button>
        </div>
      )}

      {!loading && !error && phase === "intro" && (
        <section className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <span className="rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold tracking-wide text-secondary-foreground">
            수능 기출 기반 · 총 {total}문항
          </span>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            세계지리 기출
            <br />
            O/X 모의고사
          </h1>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            한 문제씩 O/X로 풀고, 바로 해설을 확인하세요. 마지막엔 점수와 오답노트를 정리해
            드려요.
          </p>
          <button
            onClick={start}
            className="w-full max-w-xs rounded-2xl bg-primary px-6 py-4 text-lg font-bold text-primary-foreground shadow-lift transition active:scale-[0.98]"
          >
            20문제 풀기 시작
          </button>
        </section>
      )}

      {!loading && !error && phase === "quiz" && current && (
        <section className="flex flex-1 flex-col">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-muted-foreground">
              <span>{current.unit}</span>
              <span>
                {index + 1} / {total}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${((index + (picked !== null ? 1 : 0)) / total) * 100}%` }}
              />
            </div>
          </div>

          <div className="card-surface flex min-h-44 items-center p-6">
            <p className="text-xl font-semibold leading-relaxed">{current.statement}</p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              onClick={() => choose(true)}
              disabled={picked !== null}
              className="card-surface aspect-square text-6xl font-bold text-primary transition active:scale-[0.97] disabled:opacity-45"
              aria-label="O 선택"
            >
              O
            </button>
            <button
              onClick={() => choose(false)}
              disabled={picked !== null}
              className="card-surface aspect-square text-6xl font-bold text-destructive transition active:scale-[0.97] disabled:opacity-45"
              aria-label="X 선택"
            >
              X
            </button>
          </div>

          {picked !== null && (
            <div className="card-surface mt-6 p-5">
              <p
                className={`text-lg font-bold ${
                  picked === (current.is_correct === 1) ? "text-success" : "text-destructive"
                }`}
              >
                {picked === (current.is_correct === 1) ? "맞았습니다!" : "틀렸습니다!"}
                <span className="ml-2 text-sm font-semibold text-muted-foreground">
                  정답 {current.is_correct === 1 ? "O" : "X"}
                </span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-foreground">
                {current.explanation}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">출처 · {current.source}</p>
              <button
                onClick={next}
                className="mt-5 w-full rounded-2xl bg-primary py-3.5 text-base font-bold text-primary-foreground active:scale-[0.98]"
              >
                {index + 1 >= questions.length ? "결과 보기" : "다음 문제"}
              </button>
            </div>
          )}
        </section>
      )}

      {!loading && !error && phase === "result" && (
        <section className="flex flex-1 flex-col">
          <div className="card-surface mb-6 p-8 text-center">
            <p className="text-sm font-semibold text-muted-foreground">최종 점수</p>
            <p className="mt-2 text-6xl font-bold text-primary">
              {Math.round((score / total) * 100)}
              <span className="text-2xl text-muted-foreground">점</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {total}문제 중 {score}문제 정답
            </p>
          </div>

          <h2 className="mb-3 px-1 text-lg font-bold">오답노트</h2>
          <ul className="flex flex-col gap-4">
            {questions.map((q, i) => {
              const mine = answers[i];
              const right = mine === (q.is_correct === 1);
              return (
                <li key={q.id} className="card-surface p-5">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>
                      {i + 1}. {q.unit}
                    </span>
                    <span className={right ? "text-success" : "text-destructive"}>
                      {right ? "정답" : "오답"}
                    </span>
                  </div>
                  <p className="mt-2 font-semibold leading-relaxed">{q.statement}</p>
                  <div className="mt-3 flex gap-2 text-xs font-bold">
                    <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
                      내 선택 {mine === undefined ? "-" : mine ? "O" : "X"}
                    </span>
                    <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
                      정답 {q.is_correct === 1 ? "O" : "X"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {q.explanation}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">출처 · {q.source}</p>
                </li>
              );
            })}
          </ul>

          <button
            onClick={() => {
              setReload((n) => n + 1);
              setPhase("intro");
            }}
            className="mt-8 w-full rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-lift active:scale-[0.98]"
          >
            다시 풀기
          </button>
        </section>
      )}
    </main>
  );
}
