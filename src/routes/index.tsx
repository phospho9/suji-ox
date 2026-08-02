import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Confetti, Sparkles } from "@/components/Confetti";
import { useAuth } from "@/hooks/useAuth";
import { playCorrect, playTap, playWrong } from "@/lib/sound";
import { fetchQuestions, submitProgress, type Question } from "@/lib/quiz-api";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "수지 SUJI | 수능지리 O/X 기출 퀴즈" },
      {
        name: "description",
        content:
          "하루 20선지로 끝내는 수능 세계지리 O/X 기출 퀴즈. 평가원·교육청 최신 기출을 즉시 해설과 오답노트로 복습해요.",
      },
      { property: "og:title", content: "수지 SUJI | 수능지리 O/X 기출 퀴즈" },
      {
        property: "og:description",
        content: "하루 20선지로 끝내는 수능 세계지리 O/X 기출 퀴즈. 평가원·교육청 최신 기출을 즉시 해설과 오답노트로 복습해요.",
      },
      { name: "naver-site-verification", content: "9f791a60b282df2371e7b6f2ddde004a00b213c6" },
    ],
  }),
  component: QuizPage,
});

type Phase = "intro" | "quiz" | "result";

function Spinner() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="size-12 animate-spin rounded-full border-4 border-secondary border-t-primary"
        role="status"
        aria-label="불러오는 중"
      />
      <p className="animate-pulse text-sm text-muted-foreground">
        기출 선지를 예쁘게 담고 있어요 🎀
      </p>
    </div>
  );
}

const BADGES = [
  { icon: "🎯", text: "평가원/교육청 최신 기출 완전 분석", tone: "bg-secondary/80" },
  { icon: "⚡", text: "자료 해석 문제도 1초 만에 O/X 변환", tone: "bg-mint/60" },
  { icon: "⏱️", text: "쉬는 시간 3분 만에 20문제 완파", tone: "bg-peach/60" },
];

function praise(rate: number) {
  if (rate >= 95) return "완벽해요! 1등급 감각 그 자체 🏆";
  if (rate >= 80) return "정말 잘했어요! 조금만 더 다듬으면 만점 💖";
  if (rate >= 60) return "좋은 흐름이에요! 오답노트만 챙기면 급상승 🌷";
  return "괜찮아요, 지금이 성장 구간! 다시 한 번 도전해봐요 🌱";
}

function QuizPage() {
  const { user, signingIn, signInWithGoogle, signOut } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [burst, setBurst] = useState(0);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchQuestions(user?.id);
      setQuestions(data.slice(0, 20));
      setIndex(0);
      setAnswers([]);
      setPicked(null);
      setPhase("quiz");
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const total = questions.length || 20;
  const current = questions[index];
  const score = useMemo(
    () =>
      answers.reduce(
        (acc, a, i) => acc + (a === (questions[i]?.is_correct === 1) ? 1 : 0),
        0,
      ),
    [answers, questions],
  );
  const rate = Math.round((score / total) * 100);
  const isRight = current ? picked === (current.is_correct === 1) : false;

  function choose(value: boolean) {
    if (picked !== null || !current) return;
    const correct = value === (current.is_correct === 1);
    setPicked(value);
    setAnswers((prev) => [...prev, value]);
    setBurst((n) => n + 1);
    // 백그라운드 전송 — UI 전환을 막지 않음
    if (user) {
      submitProgress({ userId: user.id, questionId: current.id, isCorrect: correct });
    }
    if (correct) playCorrect();
    else playWrong();
  }

  function next() {
    playTap();
    if (index + 1 >= questions.length) setPhase("result");
    else setIndex((i) => i + 1);
    setPicked(null);
  }


  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 pb-14 pt-7">
      {/* Brand header */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-2xl btn-gradient text-base">
            🌸
          </span>
          <span className="font-display text-xl tracking-tight gradient-text">수지 SUJI</span>
        </div>
        {user ? (
          <div className="flex items-center gap-2">
            <span className="max-w-28 truncate rounded-full border border-primary/25 bg-gradient-to-r from-secondary to-lavender/40 px-3 py-1.5 text-[11px] font-bold text-secondary-foreground shadow-soft">
              {user.displayName} 💖
            </span>
            <button
              onClick={() => void signOut()}
              className="rounded-full border border-primary/20 px-3 py-1.5 text-[11px] font-bold text-muted-foreground transition active:scale-95"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button
            onClick={() => void signInWithGoogle()}
            disabled={signingIn}
            className="rounded-full btn-gradient px-4 py-2 text-[11px] font-bold transition active:scale-95 disabled:opacity-60"
          >
            {signingIn ? "연결 중..." : "Google 로그인 💖"}
          </button>
        )}
      </header>

      {loading && <div className="flex flex-1 items-center justify-center">{<Spinner />}</div>}

      {!loading && error && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-5xl">🥲</p>
          <p className="font-display text-xl">문제를 불러오지 못했어요</p>
          <p className="text-sm text-muted-foreground">
            네트워크를 확인한 뒤 다시 시도해 주세요.
          </p>
          <button
            onClick={load}
            className="rounded-full btn-gradient px-7 py-3 text-base font-bold transition active:scale-95"
          >
            다시 시도 🔄
          </button>
        </div>
      )}

      {!loading && !error && phase === "intro" && (
        <section className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <div className="animate-float text-5xl">🎀</div>
          <h1 className="font-display leading-tight tracking-tight">
            <span className="block text-6xl gradient-text">수지</span>
            <span className="block text-xl text-secondary-foreground mt-1">
              수능지리 O/X 기출 퀴즈 ✨
            </span>
          </h1>

          <div className="glass-card relative w-full max-w-xs overflow-hidden p-5 text-left">
            <div className="absolute -right-3 -top-3 text-4xl opacity-20">💝</div>
            <p className="font-display text-[15px] leading-relaxed text-foreground">
              현직 한의사 아빠가 고3 딸을 위해 직접 만든{" "}
              <span className="gradient-text">“수”</span>능세계
              <span className="gradient-text">“지”</span>리 퀴즈
            </p>
            <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
              딸의 향상을 바라는 마음으로, 최신 기출 선지만 정밀하게 가공하여
              담았습니다. ✨
            </p>
          </div>

          <ul className="flex w-full max-w-xs flex-col gap-2.5">
            {BADGES.map((b) => (
              <li
                key={b.text}
                className={`flex items-center gap-2.5 rounded-2xl ${b.tone} px-4 py-3 text-left text-[13px] font-bold text-foreground/80 shadow-soft backdrop-blur-sm`}
              >
                <span className="text-base">{b.icon}</span>
                {b.text}
              </li>
            ))}
          </ul>

          <button
            onClick={() => {
              playTap();
              void load();
            }}
            className="mt-3 w-full max-w-xs animate-pulse-soft rounded-3xl btn-gradient px-6 py-4 font-display text-lg transition active:scale-95"
          >
            🌸 20문항 O/X 퀴즈 시작하기
          </button>
        </section>
      )}

      {!loading && !error && phase === "quiz" && current && (
        <section className="flex flex-1 flex-col">
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-secondary-foreground">
              <span className="rounded-full bg-lavender/40 px-3 py-1">{current.unit}</span>
              <span>
                💖 {index + 1}/{total}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-secondary/70">
              <div
                className="h-full rounded-full btn-gradient transition-all duration-500"
                style={{
                  width: `${((index + (picked !== null ? 1 : 0)) / total) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="glass-card flex min-h-44 items-center p-6">
            <p className="text-xl font-bold leading-relaxed">{current.statement}</p>
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-4">
            <button
              onClick={() => choose(true)}
              disabled={picked !== null}
              className="glass-card aspect-square rounded-full font-display text-6xl text-primary transition duration-200 active:scale-90 disabled:opacity-50"
              aria-label="O 선택"
            >
              O
            </button>
            <button
              onClick={() => choose(false)}
              disabled={picked !== null}
              className="glass-card aspect-square rounded-full font-display text-6xl text-lavender-foreground transition duration-200 active:scale-90 disabled:opacity-50"
              aria-label="X 선택"
            >
              X
            </button>
            {picked !== null &&
              (isRight ? <Confetti key={burst} /> : <Sparkles key={burst} />)}
          </div>

          {picked !== null && (
            <div className="glass-card mt-6 animate-pop p-5">
              <p
                className={`font-display text-xl ${
                  isRight ? "text-success" : "text-destructive"
                }`}
              >
                {isRight ? "맞았습니다! 🎉" : "틀렸습니다! 🥺"}
                <span className="ml-2 text-xs font-bold text-muted-foreground">
                  정답 {current.is_correct === 1 ? "O" : "X"}
                </span>
              </p>
              <p className="mt-3 text-sm leading-relaxed">{current.explanation}</p>
              <p className="mt-3 text-xs text-muted-foreground">출처 · {current.source}</p>
              <button
                onClick={next}
                className="mt-5 w-full rounded-2xl btn-gradient py-3.5 font-display text-base transition active:scale-95"
              >
                {index + 1 >= questions.length ? "결과 보기 🏆" : "다음 문제 →"}
              </button>
            </div>
          )}
        </section>
      )}

      {!loading && !error && phase === "result" && (
        <section className="flex flex-1 flex-col">
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
            <p className="mt-3 font-display text-base text-secondary-foreground">
              {praise(rate)}
            </p>
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
                  <div className="mt-3 flex gap-2 text-[11px] font-bold">
                    <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
                      내 선택 {mine === undefined ? "-" : mine ? "O" : "X"}
                    </span>
                    <span className="rounded-full bg-mint/60 px-3 py-1 text-mint-foreground">
                      정답 {q.is_correct === 1 ? "O" : "X"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {q.explanation}
                  </p>
                  <p className="mt-2 text-[11px] text-muted-foreground">출처 · {q.source}</p>
                </li>
              );
            })}
          </ul>

          <button
            onClick={() => {
              playTap();
              setPhase("intro");
            }}
            className="mt-8 w-full animate-pulse-soft rounded-3xl btn-gradient py-4 font-display text-lg transition active:scale-95"
          >
            다시 도전하기 🔄
          </button>
        </section>
      )}
    </main>
  );
}
