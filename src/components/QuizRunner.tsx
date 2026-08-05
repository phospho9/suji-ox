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

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      {/* Top: progress */}
      <div className="shrink-0">
        <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-bold text-secondary-foreground">
          <span className="truncate rounded-full bg-lavender/40 px-2.5 py-1">{current.unit}</span>
          <span className="shrink-0">
            💖 {index + 1}/{total}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/70">
          <div
            className="h-full rounded-full btn-gradient transition-all duration-500"
            style={{ width: `${((index + (picked !== null ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Center: statement */}
      <div className="glass-card my-3 flex min-h-0 flex-1 flex-col justify-center gap-2 overflow-y-auto p-4">
        {current.type === "review" && (
          <span className="w-fit shrink-0 rounded-full bg-peach/70 px-2.5 py-0.5 text-[10px] font-bold text-peach-foreground">
            💡 오늘의 복습
          </span>
        )}
        {current.type === "new" && (
          <span className="w-fit shrink-0 rounded-full bg-mint/60 px-2.5 py-0.5 text-[10px] font-bold text-mint-foreground">
            새로운 기출
          </span>
        )}
        <p className="text-[17px] font-bold leading-relaxed">{current.statement}</p>
      </div>

      {/* Middle-bottom: O / X */}
      <div className="relative grid shrink-0 grid-cols-2 gap-3">
        <button
          onClick={() => choose(true)}
          disabled={picked !== null}
          className="glass-card rounded-3xl py-5 font-display text-5xl text-primary transition duration-200 active:scale-90 disabled:opacity-50"
          aria-label="O 선택"
        >
          O
        </button>
        <button
          onClick={() => choose(false)}
          disabled={picked !== null}
          className="glass-card rounded-3xl py-5 font-display text-5xl text-lavender-foreground transition duration-200 active:scale-90 disabled:opacity-50"
          aria-label="X 선택"
        >
          X
        </button>
        {picked !== null && (isRight ? <Confetti key={burst} /> : <Sparkles key={burst} />)}
      </div>

      {/* Bottom overlay: explanation */}
      {picked !== null && (
        <div className="fixed inset-x-0 bottom-0 z-40 animate-pop px-4 pb-4">
          <div className="glass-card mx-auto max-h-[52vh] w-full max-w-md overflow-y-auto p-4">
            <div className="flex items-center justify-between gap-2">
              <p className={`font-display text-lg ${isRight ? "text-success" : "text-destructive"}`}>
                {isRight ? "맞았습니다! 🎉" : "틀렸습니다! 🥺"}
                <span className="ml-2 text-[11px] font-bold text-muted-foreground">
                  정답 {current.is_correct === 1 ? "O" : "X"}
                </span>
              </p>
              <ReportIssueButton questionId={current.id} userId={userId} />
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
