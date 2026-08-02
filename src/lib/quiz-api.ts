const BASE_URL = "https://world-geography-test.acumoxa.workers.dev";

export type Question = {
  id: number;
  statement: string;
  is_correct: number;
  unit: string;
  explanation: string;
  source: string;
  type?: "review" | "new" | string;
};

export type SyncUserPayload = {
  id: string;
  email: string;
  display_name: string;
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
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("failed to fetch questions");
  const data = (await res.json()) as Question[];
  return Array.isArray(data) ? data : [];
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
