import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame, Target, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/hooks/useAuth";
import { fetchStatsSummary, fetchStatsTrend, type TrendPoint } from "@/lib/quiz-api";


export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "학습 대시보드 | 수지 SUJI 수능지리" },
      {
        name: "description",
        content:
          "누적 학습량·정답률·연속 학습일과 단원별 숙련도를 한눈에. 취약 단원을 바로 집중 공략하는 수능 세계지리 학습 대시보드.",
      },
      { property: "og:title", content: "학습 대시보드 | 수지 SUJI 수능지리" },
      {
        property: "og:description",
        content: "누적 학습량·정답률·연속 학습일과 단원별 숙련도를 한눈에 확인해요.",
      },
    ],
  }),
  component: DashboardPage,
});

function StatCard({
  icon,
  label,
  value,
  suffix,
  badge,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  suffix?: string;
  badge?: string | undefined;
  tone: string;
}) {
  return (
    <div className="glass-card animate-pop p-5">
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
        <span className={`grid size-7 place-items-center rounded-xl ${tone}`}>{icon}</span>
        {label}
      </div>
      <p className="mt-3 font-display text-4xl gradient-text">
        {value}
        {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
      </p>
      {badge && (
        <span className="mt-2 inline-block rounded-full bg-mint/50 px-3 py-1 text-[11px] font-bold text-mint-foreground">
          {badge}
        </span>
      )}
    </div>
  );
}

function trendBadge(points: TrendPoint[]) {
  if (points.length < 2) return undefined;
  const half = Math.max(1, Math.floor(points.length / 2));
  const avg = (arr: TrendPoint[]) =>
    arr.reduce((a, p) => a + p.accuracy, 0) / Math.max(1, arr.length);
  const diff = Math.round(avg(points.slice(half)) - avg(points.slice(0, half)));
  if (diff > 0) return `+${diff}% 이번 주 상승 🔥`;
  if (diff < 0) return `${diff}% 이번 주 하락 · 다시 달려요 💪`;
  return "이번 주 유지 중 ✨";
}

function DashboardPage() {
  const { user, ready, signingIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;

  const summaryQuery = useQuery({
    queryKey: ["stats-summary", userId],
    queryFn: () => fetchStatsSummary(userId!),
    enabled: Boolean(userId),
  });
  const trendQuery = useQuery({
    queryKey: ["stats-trend", userId],
    queryFn: () => fetchStatsTrend(userId!),
    enabled: Boolean(userId),
  });

  const summary = summaryQuery.data;
  const trend = trendQuery.data ?? [];
  const weakUnits = (summary?.units ?? []).filter((u) => u.accuracy < 50);
  const weakChart = (summary?.units ?? [])
    .slice()
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 6)
    .map((u) => ({
      ...u,
      label: u.unit.length > 8 ? `${u.unit.slice(0, 8)}…` : u.unit,
    }));
  const activity = summary?.recent_activity ?? [];


  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 pb-16 pt-7">
      <AppNav />

      {!userId ? (
        <section className="glass-card flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
          <div className="animate-float text-5xl">📊</div>
          <h1 className="font-display text-2xl">내 성장 그래프를 보려면 로그인해요</h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            로그인하면 AI가 약점 단원을 분석해 까먹을 때쯤 다시 물어봐요. 누적 정답률과 연속
            학습일도 자동으로 기록됩니다 ✨
          </p>
          <button
            onClick={() => void signInWithGoogle()}
            disabled={signingIn || !ready}
            className="w-full max-w-xs animate-pulse-soft rounded-3xl btn-gradient px-6 py-4 font-display text-lg transition active:scale-95 disabled:opacity-60"
          >
            {signingIn ? "연결 중..." : "AI 복습 모드로 시작하기 🚀"}
          </button>
          <Link to="/quiz" search={{ mode: "daily" }} className="text-xs font-bold text-muted-foreground underline">
            로그인 없이 그냥 풀기
          </Link>
        </section>
      ) : (
        <>
          <h1 className="mb-4 px-1 font-display text-2xl">
            {user.displayName}님의 <span className="gradient-text">학습 대시보드</span> 💖
          </h1>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={<Target className="size-4" />}
              label="총 푼 문제"
              value={summary?.total_solved ?? 0}
              suffix="문제"
              tone="bg-secondary text-secondary-foreground"
            />
            <StatCard
              icon={<TrendingUp className="size-4" />}
              label="전체 정답률"
              value={summary?.accuracy ?? 0}
              suffix="%"
              badge={trendBadge(trend)}
              tone="bg-mint/60 text-mint-foreground"
            />
            <StatCard
              icon={<Flame className="size-4" />}
              label="연속 학습일"
              value={summary?.streak ?? 0}
              suffix="일"
              badge={(summary?.streak ?? 0) > 0 ? "불꽃 유지 중 🔥🔥" : "오늘 첫 불씨를 켜봐요 🔥"}
              tone="bg-peach/70 text-peach-foreground"
            />
          </div>

          <section className="glass-card mt-6 p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-display text-lg">📈 성적 추세 그래프</h2>
              <span className="shrink-0 text-[11px] font-bold text-muted-foreground">
                일자별 정답률
              </span>
            </div>
            {trend.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                아직 데이터가 없어요. 오늘의 퀴즈를 풀면 그래프가 자라나요 🌱
              </p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sujiTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.55} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 16,
                        border: "1px solid var(--color-border)",
                        background: "var(--color-card)",
                        color: "var(--color-card-foreground)",
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [`${v}%`, "정답률"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stroke="var(--color-primary)"
                      strokeWidth={3}
                      fill="url(#sujiTrend)"
                      dot={{ r: 3, fill: "var(--color-primary)" }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="glass-card p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="font-display text-lg">🚨 약점 단원 분석</h2>
                <span className="shrink-0 text-[11px] font-bold text-muted-foreground">
                  단원별 정답률 · 평균 풀이시간
                </span>
              </div>
              {weakChart.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  아직 단원 데이터가 없어요. 퀴즈를 풀면 약점을 찾아드려요 🔍
                </p>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={weakChart}
                      layout="vertical"
                      margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
                    >
                      <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="label"
                        width={78}
                        tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 16,
                          border: "1px solid var(--color-border)",
                          background: "var(--color-card)",
                          color: "var(--color-card-foreground)",
                          fontSize: 12,
                        }}
                        formatter={(v: number, _n, item) => [
                          `${v}% · 평균 ${item?.payload?.avg_time_sec ?? 0}초`,
                          item?.payload?.unit ?? "정답률",
                        ]}
                      />
                      <Bar dataKey="accuracy" radius={[0, 12, 12, 0]} barSize={18}>
                        {weakChart.map((u) => (
                          <Cell
                            key={u.unit}
                            fill={
                              u.accuracy < 50
                                ? "var(--color-destructive)"
                                : "var(--color-primary)"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="glass-card p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="font-display text-lg">🔥 최근 학습량</h2>
                <span className="shrink-0 text-[11px] font-bold text-muted-foreground">
                  일자별 푼 문제 수
                </span>
              </div>
              {activity.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  최근 학습 기록이 없어요. 오늘 한 세트 풀어볼까요? 🌱
                </p>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activity} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 16,
                          border: "1px solid var(--color-border)",
                          background: "var(--color-card)",
                          color: "var(--color-card-foreground)",
                          fontSize: 12,
                        }}
                        formatter={(v: number) => [`${v}문제`, "푼 문제"]}
                      />
                      <Bar
                        dataKey="solved"
                        fill="var(--color-primary)"
                        radius={[10, 10, 0, 0]}
                        barSize={18}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          </div>



          <section className="mt-6">
            <h2 className="mb-3 px-1 font-display text-lg">🧭 단원별 숙련도</h2>
            {(summary?.units.length ?? 0) === 0 ? (
              <p className="glass-card p-6 text-center text-sm text-muted-foreground">
                단원 데이터가 아직 없어요. 첫 퀴즈부터 시작해볼까요? ✨
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {summary!.units
                  .slice()
                  .sort((a, b) => a.accuracy - b.accuracy)
                  .map((u) => {
                    const critical = u.accuracy < 50;
                    return (
                      <li
                        key={u.unit}
                        className={`glass-card p-5 ${critical ? "border-2 border-destructive" : ""}`}
                      >
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                          <p className="truncate font-bold">{u.unit}</p>
                          <span className="shrink-0 font-display text-lg">{u.accuracy}%</span>
                        </div>
                        {critical && (
                          <span className="mt-2 inline-block rounded-full bg-destructive px-3 py-1 text-[11px] font-bold text-destructive-foreground">
                            🚨 집중 공략 필요
                          </span>
                        )}
                        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-secondary/70">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              critical ? "bg-destructive" : "btn-gradient"
                            }`}
                            style={{ width: `${Math.min(100, u.accuracy)}%` }}
                          />
                        </div>
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          {u.correct}/{u.total} 문제 정답
                        </p>
                        {critical && (
                          <Link
                            to="/notes"
                            className="mt-3 inline-flex rounded-2xl bg-destructive px-4 py-2 text-xs font-bold text-destructive-foreground transition active:scale-95"
                          >
                            약점 집중 훈련하기 →
                          </Link>
                        )}
                      </li>
                    );
                  })}
              </ul>
            )}
          </section>

          {weakUnits.length > 0 && (
            <p className="mt-4 px-1 text-xs font-bold text-destructive">
              위험 단원 {weakUnits.length}개 발견! 오답노트로 바로 잡아요 🔥
            </p>
          )}

          <button
            onClick={() => void navigate({ to: "/quiz", search: { mode: "daily" } })}
            className="mt-8 w-full animate-pulse-soft rounded-3xl btn-gradient py-4 font-display text-lg transition active:scale-95"
          >
            🌸 오늘의 복습 / 퀴즈 시작하기
          </button>
        </>
      )}
    </main>
  );
}
