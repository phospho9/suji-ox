const BASE_URL = "https://world-geography-test.acumoxa.workers.dev";

/** 현재 앱이 다루는 과목 (다과목 백엔드에서 세계지리만 필터) */
export const CURRENT_SUBJECT = import.meta.env["VITE_SUBJECT"] ?? "세계지리";

export type Question = {
  id: number;
  statement: string;
  is_correct: number;
  unit: string;
  explanation: string;
  source: string;
  type?: "review" | "new" | string;
  next_review_days?: number;
  next_review_at?: string;
};

export type SyncUserPayload = {
  id: string;
  email: string;
  display_name: string;
};

export type UnitStat = {
  unit: string;
  total: number;
  correct: number;
  accuracy: number;
};

export type StatsSummary = {
  total_solved: number;
  total_correct: number;
  accuracy: number;
  streak: number;
  units: UnitStat[];
};

export type TrendPoint = {
  date: string;
  accuracy: number;
  solved: number;
};

/** POST /api/auth — 로그인 직후 사용자 정보 동기화 */
export async function syncUser(payload: SyncUserPayload): Promise<void> {
  await fetch(`${BASE_URL}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** GET /api/questions[?user_id=...] */
export async function fetchQuestions(userId?: string | null): Promise<Question[]> {
  const url = new URL(`${BASE_URL}/api/questions`);
  if (userId) url.searchParams.set("user_id", userId);
  url.searchParams.set("subject", CURRENT_SUBJECT);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("failed to fetch questions");
  const data = (await res.json()) as Question[];
  return Array.isArray(data) ? data : [];
}

/** GET /api/questions/incorrect?user_id=... — 오답노트 */
export async function fetchIncorrectQuestions(userId: string): Promise<Question[]> {
  const url = new URL(`${BASE_URL}/api/questions/incorrect`);
  url.searchParams.set("user_id", userId);
  url.searchParams.set("subject", CURRENT_SUBJECT);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("failed to fetch incorrect questions");
  const data = (await res.json()) as Question[];
  return Array.isArray(data) ? data : [];
}

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** GET /api/stats/summary?user_id=... */
export async function fetchStatsSummary(userId: string): Promise<StatsSummary> {
  const url = new URL(`${BASE_URL}/api/stats/summary`);
  url.searchParams.set("user_id", userId);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("failed to fetch summary");
  const raw = (await res.json()) as Record<string, unknown>;
  const rawUnits = Array.isArray(raw["units"]) ? (raw["units"] as Record<string, unknown>[]) : [];

  const units: UnitStat[] = rawUnits.map((u) => {
    const total = num(u["total"] ?? u["total_solved"] ?? u["count"]);
    const correct = num(u["correct"] ?? u["total_correct"]);
    const accuracy =
      u["accuracy"] !== undefined
        ? num(u["accuracy"])
        : total > 0
          ? Math.round((correct / total) * 100)
          : 0;
    return {
      unit: String(u["unit"] ?? u["name"] ?? "기타"),
      total,
      correct,
      accuracy: accuracy <= 1 && accuracy > 0 ? Math.round(accuracy * 100) : Math.round(accuracy),
    };
  });

  const accuracyRaw = num(raw["accuracy"]);
  return {
    total_solved: num(raw["total_solved"]),
    total_correct: num(raw["total_correct"]),
    accuracy:
      accuracyRaw <= 1 && accuracyRaw > 0 ? Math.round(accuracyRaw * 100) : Math.round(accuracyRaw),
    streak: num(raw["streak"] ?? raw["streak_days"] ?? raw["consecutive_days"]),
    units,
  };
}

/** GET /api/stats/trend?user_id=... */
export async function fetchStatsTrend(userId: string): Promise<TrendPoint[]> {
  const url = new URL(`${BASE_URL}/api/stats/trend`);
  url.searchParams.set("user_id", userId);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("failed to fetch trend");
  const raw = (await res.json()) as unknown;
  if (!Array.isArray(raw)) return [];
  return (raw as Record<string, unknown>[]).map((p) => {
    const acc = num(p["accuracy"] ?? p["rate"]);
    return {
      date: String(p["date"] ?? p["day"] ?? p["created_at"] ?? ""),
      accuracy: acc <= 1 && acc > 0 ? Math.round(acc * 100) : Math.round(acc),
      solved: num(p["solved"] ?? p["total"] ?? p["count"]),
    };
  });
}

/**
 * POST /api/progress — UI 전환을 막지 않도록 항상 백그라운드(fire-and-forget)로 전송.
 */
export function submitProgress(input: {
  userId: string;
  questionId: number;
  isCorrect: boolean;
}): void {
  const body = JSON.stringify({
    user_id: input.userId,
    question_id: input.questionId,
    is_correct: input.isCorrect,
  });

  void fetch(`${BASE_URL}/api/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // 학습 흐름을 방해하지 않도록 조용히 무시
  });
}

/** POST /api/reports — 문제 오류 제보 */
export async function submitReport(input: {
  questionId: number;
  userId?: string | null;
  reason: string;
  details?: string;
  statement?: string;
  source?: string;
}): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question_id: input.questionId,
      user_id: input.userId ?? null,
      reason: input.reason.trim().slice(0, 200),
      details: (input.details ?? "").trim().slice(0, 1000),
      statement: input.statement ?? null,
      source: input.source ?? null,
    }),
  });
  if (!res.ok) throw new Error("failed to submit report");
}

