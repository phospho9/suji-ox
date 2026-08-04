import { createFileRoute, Link } from "@tanstack/react-router";

import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/hooks/useAuth";

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
        content:
          "하루 20선지로 끝내는 수능 세계지리 O/X 기출 퀴즈. 평가원·교육청 최신 기출을 즉시 해설과 오답노트로 복습해요.",
      },
      { name: "naver-site-verification", content: "9f791a60b282df2371e7b6f2ddde004a00b213c6" },
    ],
  }),
  component: LandingPage,
});

const BADGES = [
  { icon: "🎯", text: "평가원/교육청 최신 기출 완전 분석", tone: "bg-secondary/80" },
  { icon: "⚡", text: "자료 해석 문제도 1초 만에 O/X 변환", tone: "bg-mint/60" },
  { icon: "⏱️", text: "쉬는 시간 3분 만에 20문제 완파", tone: "bg-peach/60" },
];

function LandingPage() {
  const { user, signingIn, signInWithGoogle } = useAuth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 pb-14 pt-7">
      <AppNav />

      <section className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <div className="animate-float text-5xl">🎀</div>
        <h1 className="font-display leading-tight tracking-tight">
          <span className="block text-6xl gradient-text">수지</span>
          <span className="mt-1 block text-xl text-secondary-foreground">
            수능지리 O/X 기출 퀴즈 ✨
          </span>
        </h1>

        <div className="w-full max-w-xs space-y-3 text-left">
          <h2 className="font-display text-2xl leading-tight text-foreground">
            아는 건 스킵하고,
            <br />
            <span className="gradient-text">모르는 건 내 머릿속에 저장!</span> 💾
          </h2>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            로그인 없이 가볍게 풀어도 좋아요. 하지만 로그인하면 AI가 내 약점을 분석해서 까먹을
            때쯤 딱 맞춰 다시 알려준답니다. 시간 없는 고3을 위한 세계지리 1등급 비밀 무기, 지금
            시작해 볼까요? ✨
          </p>
        </div>

        <div className="glass-card relative w-full max-w-xs overflow-hidden p-5 text-left">
          <div className="absolute -right-3 -top-3 text-4xl opacity-20">💝</div>
          <p className="font-display text-[15px] leading-relaxed text-foreground">
            현직 한의사 아빠가 고3 딸을 위해 직접 만든{" "}
            <span className="gradient-text">“수”</span>능세계
            <span className="gradient-text">“지”</span>리 퀴즈
          </p>
          <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
            딸의 향상을 바라는 마음으로, 최신 기출 선지만 정밀하게 가공하여 담았습니다. ✨
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

        {user ? (
          <div className="mt-3 flex w-full max-w-xs flex-col gap-3">
            <Link
              to="/dashboard"
              className="w-full animate-pulse-soft rounded-3xl btn-gradient px-6 py-4 text-center font-display text-lg transition active:scale-95"
            >
              📊 내 대시보드 보기
            </Link>
            <Link
              to="/quiz"
              className="w-full rounded-3xl border border-border bg-card/50 px-6 py-3.5 text-center text-sm font-bold text-muted-foreground backdrop-blur-sm transition active:scale-95"
            >
              🌸 20문항 O/X 퀴즈 시작하기
            </Link>
          </div>
        ) : (
          <div className="mt-3 flex w-full max-w-xs flex-col gap-3">
            <button
              onClick={() => void signInWithGoogle()}
              disabled={signingIn}
              className="w-full animate-pulse-soft rounded-3xl btn-gradient px-6 py-4 font-display text-lg transition active:scale-95 disabled:opacity-60"
            >
              {signingIn ? "연결 중..." : "AI 복습 모드로 시작하기 🚀"}
            </button>
            <Link
              to="/quiz"
              className="w-full rounded-3xl border border-border bg-card/50 px-6 py-3.5 text-center text-sm font-bold text-muted-foreground backdrop-blur-sm transition active:scale-95"
            >
              로그인 없이 그냥 풀기
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
