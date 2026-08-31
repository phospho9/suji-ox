import { createFileRoute, Link } from "@tanstack/react-router";

import { useAuth } from "@/hooks/useAuth";
import { getSubjectConfig } from "@/config/subjectConfig";

export const Route = createFileRoute("/")({
  head: () => {
    const config = getSubjectConfig();
    return {
      meta: [
        { title: `수능 ${config.subject} 1등급 O/X 퀴즈 | ${config.title}` },
        {
          name: "description",
          content: `하루 20선지로 끝내는 수능 ${config.subject} O/X 기출 퀴즈. 에빙하우스 망각곡선 자동 복습과 단원별 정확도 분석까지 한 화면에서.`,
        },
        { property: "og:title", content: `수능 ${config.subject} 1등급 O/X 퀴즈 | ${config.title}` },
        {
          property: "og:description",
          content: `기출 O/X 변환 퀴즈, 망각곡선 자동 복습, 단원별·추세 분석을 제공하는 수능 ${config.subject} 학습 서비스.`,
        },
        { name: "naver-site-verification", content: "9f791a60b282df2371e7b6f2ddde004a00b213c6" },
      ],
    };
  },
  component: LandingPage,
});

const FEATURES = [
  {
    icon: "⚡",
    title: "기출 O/X 변환 퀴즈",
    desc: "평가원·교육청 최신 기출 선지를 O/X로 초고속 판별",
    tone: "bg-secondary/70",
  },
  {
    icon: "🧠",
    title: "에빙하우스 망각곡선",
    desc: "까먹을 때쯤 자동 복습 배치, 약점만 콕 집어 반복",
    tone: "bg-mint/50",
  },
  {
    icon: "📊",
    title: "단원별·추세 분석",
    desc: "단원 정확도와 성장 추세를 그래프로 한눈에 확인",
    tone: "bg-peach/50",
  },
];

function LandingPage() {
  const { user, signingIn, signInWithGoogle } = useAuth();
  const config = getSubjectConfig();
  const currentHost = typeof window !== "undefined" ? window.location.hostname : "suji.haniw.com";

  return (
    <main className="flex h-screen max-h-screen w-full flex-col overflow-hidden px-5 pb-2.5 pt-3">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-hidden">
        <header className="shrink-0 space-y-1.5 text-center">
          <h1 className="font-display text-[18px] leading-snug tracking-tight text-foreground sm:text-[22px]">
            <span className="block text-[11px] font-bold text-muted-foreground sm:text-xs">
              현직 한의사 아빠가 고3 딸을 위해 직접 만든
            </span>
            <span className="block">
              {config.badge} 수능 <span className="font-black text-[#E0247D]">{config.subject}</span> 퀴즈
            </span>
          </h1>
          <p className="px-2 text-[11px] leading-snug text-muted-foreground">
            - 딸의 성장을 바라는 마음으로, 최신 기출 선지만 정밀 가공해서 O/X 문제로 담았습니다.
          </p>
          <span className="inline-block rounded-full border border-primary/25 bg-secondary/70 px-3 py-1 text-[10px] font-bold text-secondary-foreground">
            {currentHost} 💖
          </span>
        </header>

        <section className="flex min-h-0 flex-1 flex-col justify-center gap-2 py-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`flex items-center gap-2.5 rounded-3xl ${f.tone} px-3.5 py-2.5 shadow-soft backdrop-blur-sm`}
            >
              <span className="shrink-0 text-lg">{f.icon}</span>
              <div className="min-w-0">
                <p className="truncate font-display text-[15px] text-foreground">{f.title}</p>
                <p className="text-[11px] leading-snug text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="shrink-0 space-y-2">
          <Link
            to="/quiz"
            search={{ mode: "daily" }}
            className="block w-full animate-pulse-soft rounded-3xl btn-gradient py-3.5 text-center font-display text-lg transition active:scale-95"
          >
            🌸 지금 바로 퀴즈 시작하기
          </Link>
          {user ? (
            <Link
              to="/dashboard"
              className="block w-full rounded-2xl border border-border bg-card/50 py-2.5 text-center text-xs font-bold text-muted-foreground backdrop-blur-sm transition active:scale-95"
            >
              📊 내 대시보드 보기
            </Link>
          ) : (
            <button
              onClick={() => void signInWithGoogle()}
              disabled={signingIn}
              className="w-full rounded-2xl border border-border bg-card/50 py-2.5 text-center text-xs font-bold text-muted-foreground backdrop-blur-sm transition active:scale-95 disabled:opacity-60"
            >
              {signingIn ? "연결 중..." : "로그인하면 AI 복습 모드까지 🚀"}
            </button>
          )}
        </div>

        <footer className="shrink-0 pt-2">
          <p className="text-[10px] leading-snug text-[#888888] sm:text-[11px]">
            본 서비스의 지문 및 해설은 수능·모의평가 기출문제를 기반으로 AI 분석을 통해 2차
            가공(O/X 변환)된 비영리 학습 자료입니다. AI 변환 특성상 일부 오탈자나 해석상의 차이가
            존재할 수 있습니다. 오류 발견 시 [🚨 오류 제보] 버튼을 통해 적극적인 피드백
            부탁드립니다.
          </p>
        </footer>
      </div>
    </main>
  );
}
