const BASE_URL = "https://world-geography-test.acumoxa.workers.dev";

/** 현재 앱이 다루는 과목 (다과목 백엔드에서 세계지리만 필터) */
export const CURRENT_SUBJECT = import.meta.env["VITE_SUBJECT"] ?? "세계지리";

const GUEST_KEY = "suji_guest_id";

/** 로그인 사용자 ID가 없으면 localStorage에 유지되는 게스트 UUID를 사용 */
export function resolveUserId(userId?: string | null): string {
  if (userId) return userId;
  if (typeof window === "undefined") return "guest";
  let id = window.localStorage.getItem(GUEST_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}

export type Question = {
  id: number;
  statement: string;
  is_correct: number;
  unit: string;
  explanation: string;
  source: string;
  exam_name?: string;
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
  avg_time_sec: number;
};

export type ActivityPoint = {
  date: string;
  solved: number;
};

export type StatsSummary = {
  total_solved: number;
  total_correct: number;
  accuracy: number;
  streak: number;
  units: UnitStat[];
  recent_activity: ActivityPoint[];
};

export type TrendPoint = {
  date: string;
  accuracy: number;
  solved: number;
};

export type MetadataUnit = { unit: string; count: number };
export type MetadataExam = {
  exam_name: string;
  exam_year?: number;
  exam_month?: number;
  exam_type?: string;
  count: number;
};
export type SubjectMetadata = {
  subject: string;
  units: MetadataUnit[];
  exams: MetadataExam[];
};

/** GET /api/metadata?subject=... — 단원/시험회차 필터 옵션 */
export async function fetchMetadata(subject = CURRENT_SUBJECT): Promise<SubjectMetadata> {
  const url = new URL(`${BASE_URL}/api/metadata`);
  url.searchParams.set("subject", subject);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("failed to fetch metadata");
  const raw = (await res.json()) as Record<string, unknown>;
  const units = Array.isArray(raw["units"]) ? (raw["units"] as Record<string, unknown>[]) : [];
  const exams = Array.isArray(raw["exams"]) ? (raw["exams"] as Record<string, unknown>[]) : [];
  return {
    subject: String(raw["subject"] ?? subject),
    units: units
      .map((u) => ({ unit: String(u["unit"] ?? ""), count: Number(u["count"] ?? 0) }))
      .filter((u) => u.unit),
    exams: exams
      .map((e) => ({
        exam_name: String(e["exam_name"] ?? ""),
        exam_year: Number(e["exam_year"] ?? 0),
        exam_month: Number(e["exam_month"] ?? 0),
        exam_type: String(e["exam_type"] ?? ""),
        count: Number(e["count"] ?? 0),
      }))
      .filter((e) => e.exam_name),
  };
}

/** POST /api/auth — 로그인 직후 사용자 정보 동기화 */
export async function syncUser(payload: SyncUserPayload): Promise<void> {
  await fetch(`${BASE_URL}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-User-Id": payload.id },
    body: JSON.stringify(payload),
  });
}


export type QuestionFilters = {
  unit?: string | undefined;
  examName?: string | undefined;
};

/** GET /api/questions[?user_id=&subject=&unit=&exam_name=] */
export async function fetchQuestions(
  userId?: string | null,
  filters: QuestionFilters = {},
): Promise<Question[]> {
  const url = new URL(`${BASE_URL}/api/questions`);
  if (userId) url.searchParams.set("user_id", userId);
  url.searchParams.set("subject", CURRENT_SUBJECT);
  if (filters.unit) url.searchParams.set("unit", filters.unit);
  if (filters.examName) url.searchParams.set("exam_name", filters.examName);
  const res = await fetch(url.toString(), {
    headers: { "X-User-Id": resolveUserId(userId) },
  });
  if (!res.ok) throw new Error("failed to fetch questions");
  const data = (await res.json()) as Question[];
  return Array.isArray(data) ? data : [];
}

/** GET /api/questions/incorrect?user_id=... — 오답노트 */
export async function fetchIncorrectQuestions(userId: string): Promise<Question[]> {
  const url = new URL(`${BASE_URL}/api/questions/incorrect`);
  url.searchParams.set("user_id", userId);
  url.searchParams.set("subject", CURRENT_SUBJECT);
  const res = await fetch(url.toString(), { headers: { "X-User-Id": resolveUserId(userId) } });
  if (!res.ok) throw new Error("failed to fetch incorrect questions");
  const data = (await res.json()) as Question[];
  return Array.isArray(data) ? data : [];
}


function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** GET /api/stats/summary?user_id=... (unit_stats / recent_activity 지원) */
export async function fetchStatsSummary(userId: string): Promise<StatsSummary> {
  const url = new URL(`${BASE_URL}/api/stats/summary`);
  url.searchParams.set("user_id", userId);
  url.searchParams.set("subject", CURRENT_SUBJECT);
  const res = await fetch(url.toString(), { headers: { "X-User-Id": resolveUserId(userId) } });
  if (!res.ok) throw new Error("failed to fetch summary");
  const raw = (await res.json()) as Record<string, unknown>;
  const rawUnitsSource = raw["unit_stats"] ?? raw["units"];
  const rawUnits = Array.isArray(rawUnitsSource)
    ? (rawUnitsSource as Record<string, unknown>[])
    : [];

  const units: UnitStat[] = rawUnits.map((u) => {
    const total = num(u["total"] ?? u["solved"] ?? u["total_solved"] ?? u["count"]);
    const correct = num(u["correct"] ?? u["total_correct"]);
    const accuracy =
      u["accuracy"] !== undefined
        ? num(u["accuracy"])
        : total > 0
          ? Math.round((correct / total) * 100)
          : 0;
    const avgMs = num(u["avg_time_ms"] ?? u["avg_time_spent_ms"]);
    return {
      unit: String(u["unit"] ?? u["name"] ?? "기타"),
      total,
      correct,
      accuracy: accuracy <= 1 && accuracy > 0 ? Math.round(accuracy * 100) : Math.round(accuracy),
      avg_time_sec: Math.round(
        (u["avg_time_sec"] !== undefined ? num(u["avg_time_sec"]) : avgMs / 1000) * 10,
      ) / 10,
    };
  });

  const rawActivity = Array.isArray(raw["recent_activity"])
    ? (raw["recent_activity"] as Record<string, unknown>[])
    : [];
  const recent_activity: ActivityPoint[] = rawActivity
    .map((a) => ({
      date: String(a["date"] ?? a["day"] ?? ""),
      solved: num(a["solved"] ?? a["count"] ?? a["total"]),
    }))
    .filter((a) => a.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  const accuracyRaw = num(raw["accuracy"]);
  return {
    total_solved: num(raw["total_solved"]),
    total_correct: num(raw["total_correct"]),
    accuracy:
      accuracyRaw <= 1 && accuracyRaw > 0 ? Math.round(accuracyRaw * 100) : Math.round(accuracyRaw),
    streak: num(raw["streak"] ?? raw["streak_days"] ?? raw["consecutive_days"]),
    units,
    recent_activity,
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
 * POST /api/progress/submit — solve_logs 적재.
 * UI 전환을 막지 않도록 항상 백그라운드(fire-and-forget)로 전송하고,
 * 신규 엔드포인트가 실패하면 기존 /api/progress로 폴백한다.
 */
export function submitProgress(input: {
  userId?: string | null;
  questionId: number;
  isCorrect: boolean;
  timeSpentMs?: number;
}): void {
  const userId = resolveUserId(input.userId);
  const timeSpentMs = Math.max(0, Math.round(input.timeSpentMs ?? 0));
  const headers = { "Content-Type": "application/json", "X-User-Id": userId };

  void fetch(`${BASE_URL}/api/progress/submit`, {
    method: "POST",
    headers,
    keepalive: true,
    body: JSON.stringify({
      userId,
      questionId: input.questionId,
      isCorrect: input.isCorrect,
      timeSpentMs,
    }),
  })
    .then((res) => {
      if (res.ok) return;
      // 구버전 엔드포인트 폴백
      return fetch(`${BASE_URL}/api/progress`, {
        method: "POST",
        headers,
        keepalive: true,
        body: JSON.stringify({
          user_id: userId,
          question_id: input.questionId,
          is_correct: input.isCorrect,
          time_spent_ms: timeSpentMs,
        }),
      }).then(() => undefined);
    })
    .catch(() => {
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

