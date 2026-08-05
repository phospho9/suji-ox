import { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { submitReport } from "@/lib/quiz-api";

const MAX_LEN = 1000;
const REASONS = ["정답 오류", "해설/개념 오류", "오탈자/문맥", "기타"] as const;

export function ReportIssueButton({
  questionId,
  userId,
  statement,
  source,
  className,
}: {
  questionId: number;
  userId?: string | null | undefined;
  statement?: string | undefined;
  source?: string | undefined;
  className?: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    if (!reason) {
      toast.error("어떤 종류의 오류인지 선택해 주세요 🙏");
      return;
    }
    if (details.length > MAX_LEN) {
      toast.error(`상세 내용은 ${MAX_LEN}자 이내로 입력해 주세요.`);
      return;
    }
    setSending(true);
    try {
      await submitReport({
        questionId,
        userId: userId ?? null,
        reason,
        details,
        ...(statement ? { statement } : {}),
        ...(source ? { source } : {}),
      });
      toast.success("제보해 주셔서 감사합니다! 💖");
      setReason("");
      setDetails("");
      setOpen(false);
    } catch {
      toast.error("제보 전송에 실패했어요. 잠시 후 다시 시도해 주세요 🥲");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "rounded-full bg-secondary/70 px-3 py-1.5 text-[11px] font-bold text-secondary-foreground transition hover:bg-secondary active:scale-95"
        }
      >
        🚨 오류 제보
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-card max-w-md rounded-3xl border-0">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">🚨 오류 제보</DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              오탈자, O/X 변환 오류, 해설 오류 등 발견한 내용을 알려주세요. 검토 후 빠르게
              수정할게요.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl bg-secondary/60 px-3 py-2 text-[11px] text-secondary-foreground">
            <p className="font-bold">문제 #{questionId}</p>
            {statement && (
              <p className="mt-1 line-clamp-2 leading-relaxed opacity-80">{statement}</p>
            )}
            {source && <p className="mt-1 opacity-60">출처 · {source}</p>}
          </div>

          <div className="flex flex-wrap gap-2">
            {REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition active:scale-95 ${
                  reason === r
                    ? "btn-gradient"
                    : "bg-background/70 text-muted-foreground ring-1 ring-border"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <Textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={MAX_LEN}
            rows={4}
            placeholder="예) 선지의 '건조기후'가 '냉대기후'로 잘못 표기되어 있어요."
            className="rounded-2xl bg-background/70"
          />
          <p className="text-right text-[10px] text-muted-foreground">
            {details.length}/{MAX_LEN}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-2xl bg-secondary px-4 py-3 text-sm font-bold text-secondary-foreground transition active:scale-95"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={() => void send()}
              disabled={sending}
              className="rounded-2xl btn-gradient px-4 py-3 text-sm font-bold transition active:scale-95 disabled:opacity-60"
            >
              {sending ? "전송 중..." : "제보하기 💌"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
