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

export function ReportIssueButton({
  questionId,
  userId,
  className,
}: {
  questionId: number;
  userId?: string | null | undefined;
  className?: string | undefined;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    const text = reason.trim();
    if (!text) {
      toast.error("어떤 부분이 이상한지 알려주세요 🙏");
      return;
    }
    if (text.length > MAX_LEN) {
      toast.error(`제보 내용은 ${MAX_LEN}자 이내로 입력해 주세요.`);
      return;
    }
    setSending(true);
    try {
      await submitReport({ questionId, userId: userId ?? null, reason: text });
      toast.success("제보해 주셔서 감사합니다. 신속히 검토하겠습니다.");
      setReason("");
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
          "rounded-full bg-secondary/70 px-3 py-1.5 text-[11px] font-bold text-secondary-foreground transition active:scale-95"
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

          <p className="rounded-2xl bg-secondary/60 px-3 py-2 text-[11px] font-bold text-secondary-foreground">
            문제 ID · #{questionId}
          </p>

          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={MAX_LEN}
            rows={5}
            placeholder="예) 선지의 '건조기후'가 '냉대기후'로 잘못 표기되어 있어요."
            className="rounded-2xl bg-background/70"
          />
          <p className="text-right text-[10px] text-muted-foreground">
            {reason.length}/{MAX_LEN}
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
