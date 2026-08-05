import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Confetti, Sparkles } from "@/components/Confetti";
import { ReportIssueButton } from "@/components/ReportIssueDialog";
import { submitProgress, type Question } from "@/lib/quiz-api";

function praise(rate: number) {
  if (rate >= 95) return "완벽해요! 1등급 감각 그 자체 🏆";
  if (rate >= 80) return "정말 잘했어요! 조금만 더 다듬으면 만점 💖";
  if (rate >= 60) return "좋은 흐름이에요! 오답노트만 챙기면 급상승 🌷";
  return "괜찮아요, 지금이 성장 구간! 다시 한 번 도전해봐요 🌱";
}

function nextReviewLabel(q: Question, isRight: boolean) {
  const days = q.next_review_days ?? (isRight ? (q.type === "review" ? 7 : 3) : 1);
  return `다음 복습까지 ${days}일 ⏳`;
}

export function QuizRunner({
  questions,
  userId,
  onExit,
  exitLabel = "다시 도전하기 🔄",
}: {
  questions: Question[];
  userId?: string | null;
  onExit: () => void;
  exitLabel?: string;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [burst, setBurst] = useState(0);
  const [done, setDone] = useState(false);

  const total = questions.length;
  const current = questions[index];
  const score = useMemo(
    () =>
      answers.reduce((acc, a, i) => acc + (a === (questions[i]?.is_correct === 1) ? 1 : 0), 0),
    [answers, questions],
  );
  const rate = total ? Math.round((score / total) * 100) : 0;
  const isRight = current ? picked === (current.is_correct === 1) : false;

  function choose(value: boolean) {
    if (picked !== null || !current) return;
    const correct = value === (current.is_correct === 1);
    setPicked(value);
    setAnswers((prev) => [...prev, value]);
    setBurst((n) => n + 1);
    if (userId) {
      submitProgress({ userId, questionId: current.id, isCorrect: correct });
    }
    toast[correct ? "success" : "error"](correct ? "정답이에요! 🎉" : "오답이에요 🥺", {
      description: nextReviewLabel(current, correct),
    });
  }

  function next() {
    if (index + 1 >= total) setDone(true);
    else setIndex((i) => i + 1);
    setPicked(null);
  }

  if (done) {
    return (
      <section className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-6">
        <div className="glass-card relative mb-6 animate-pop p-8 text-center">
          <Confetti key={`result-${burst}`} />
          <p className="text-xs font-bold text-muted-foreground">최종 점수</p>
          <p className="mt-1 font-display text-6xl gradient-text">
            {rate}
            <span className="text-2xl text-muted-foreground">점</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {total}문제 중 {score}문제 정답
          </p>
          <p className="mt-3 font-display text-base text-secondary-foreground">{praise(rate)}</p>
        </div>

        <h2 className="mb-3 px-1 font-display text-lg">📒 오답노트</h2>
        <ul className="flex flex-col gap-4">
          {questions.map((q, i) => {
            const mine = answers[i];
            const right = mine === (q.is_correct === 1);
            return (
              <li key={q.id} className="glass-card p-5">
                <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                  <span>
                    {i + 1}. {q.unit}
                  </span>
                  <span className={right ? "text-success" : "text-destructive"}>
                    {right ? "정답 ⭕" : "오답 ❌"}
                  </span>
                </div>
                <p className="mt-2 font-bold leading-relaxed">{q.statement}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
                  <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
                    내 선택 {mine === undefined ? "-" : mine ? "O" : "X"}
                  </span>
                  <span className="rounded-full bg-mint/60 px-3 py-1 text-mint-foreground">
                    정답 {q.is_correct === 1 ? "O" : "X"}
                  </span>
                  <span className="rounded-full bg-peach/60 px-3 py-1 text-peach-foreground">
                    {nextReviewLabel(q, right)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {q.explanation}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-[11px] text-muted-foreground">출처 · {q.source}</p>
                  <ReportIssueButton questionId={q.id} userId={userId} />
                </div>
              </li>
            );
          })}
        </ul>

        <button
          onClick={onExit}
          className="mt-8 w-full animate-pulse-soft rounded-3xl btn-gradient py-4 font-display text-lg transition active:scale-95"
        >
          {exitLabel}
        </button>
      </section>
    );
  }

  if (!current) return null;

  const progress = ((index + (picked !== null ? 1 : 0)) / total) * 100;

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      {/* Top: back + progress + unit badge */}
      <div className="shrink-0">
        <div className="flex items-center gap-2.5">
          <Link
            to="/"
            aria-label="뒤로 가기"
            className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-card/80 text-lg text-secondary-foreground shadow-sm ring-1 ring-border/70 transition hover:bg-card active:scale-90"
          >
            ←
          </Link>
          <div className="min-w-0 flex-1">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary/60">
              <div
                className="h-full rounded-full btn-gradient transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] font-bold text-muted-foreground">
              {index + 1} / {total} 문제 💖
            </p>
          </div>
          <span className="max-w-[38%] shrink-0 truncate rounded-full bg-lavender/35 px-3 py-1.5 text-[11px] font-bold text-lavender-foreground shadow-sm">
            {current.unit} 🌍
          </span>
        </div>
      </div>

      {/* Center: statement */}
      <div className="glass-card my-3 flex min-h-0 flex-1 animate-pop flex-col justify-center gap-2.5 overflow-y-auto rounded-3xl p-5 shadow-md">
        {current.type === "review" && (
          <span className="w-fit shrink-0 rounded-full bg-peach/60 px-3 py-1 text-[10px] font-bold text-peach-foreground">
            💡 오늘의 복습
          </span>
        )}
        {current.type === "new" && (
          <span className="w-fit shrink-0 rounded-full bg-mint/55 px-3 py-1 text-[10px] font-bold text-mint-foreground">
            🌱 새로운 기출
          </span>
        )}
        <p className="text-[18px] font-bold leading-[1.65] tracking-tight text-card-foreground">
          {current.statement}
        </p>
      </div>

      {/* Action area: O / X */}
      <div className="relative grid shrink-0 grid-cols-2 gap-3">
        <button
          onClick={() => choose(true)}
          disabled={picked !== null}
          className="rounded-3xl bg-coral py-5 font-display text-5xl text-coral-foreground shadow-md ring-1 ring-coral-foreground/15 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-90 disabled:opacity-45"
          aria-label="O 선택"
        >
          O
        </button>
        <button
          onClick={() => choose(false)}
          disabled={picked !== null}
          className="rounded-3xl bg-indigoish py-5 font-display text-5xl text-indigoish-foreground shadow-md ring-1 ring-indigoish-foreground/15 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-90 disabled:opacity-45"
          aria-label="X 선택"
        >
          X
        </button>
        {picked !== null && (isRight ? <Confetti key={burst} /> : <Sparkles key={burst} />)}
      </div>

      {/* Bottom: disclaimer + report */}
      <div className="mt-2.5 flex shrink-0 items-center justify-between gap-2">
        <p className="min-w-0 flex-1 text-[9.5px] leading-snug text-muted-foreground/80">
          본 퀴즈는 기출문제 기반 AI 2차 가공 자료입니다. 일부 오류가 있을 수 있습니다.
        </p>
        <ReportIssueButton
          questionId={current.id}
          userId={userId}
          statement={current.statement}
          source={current.source}
          className="shrink-0 rounded-full bg-card/70 px-3 py-1.5 text-[10px] font-bold text-muted-foreground ring-1 ring-border/70 transition hover:text-secondary-foreground active:scale-95"
        />
      </div>

      {/* Bottom overlay: explanation */}
      {picked !== null && (
        <div className="fixed inset-x-0 bottom-0 z-40 animate-pop px-4 pb-4">
          <div className="glass-card mx-auto max-h-[52vh] w-full max-w-md overflow-y-auto rounded-3xl p-4 shadow-md">
            <div className="flex items-center justify-between gap-2">
              <p className={`font-display text-lg ${isRight ? "text-success" : "text-destructive"}`}>
                {isRight ? "맞았습니다! 🎉" : "틀렸습니다! 🥺"}
                <span className="ml-2 text-[11px] font-bold text-muted-foreground">
                  정답 {current.is_correct === 1 ? "O" : "X"}
                </span>
              </p>
              <ReportIssueButton
                questionId={current.id}
                userId={userId}
                statement={current.statement}
                source={current.source}
              />
            </div>
            <p className="mt-2 text-[13px] leading-relaxed">{current.explanation}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
              <span className="rounded-full bg-secondary px-2.5 py-1 font-bold text-secondary-foreground">
                {nextReviewLabel(current, isRight)}
              </span>
              <span>출처 · {current.source}</span>
            </div>
            <button
              onClick={next}
              className="mt-3 w-full rounded-2xl btn-gradient py-3 font-display text-base transition active:scale-95"
            >
              {index + 1 >= total ? "결과 보기 🏆" : "다음 문제 →"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
