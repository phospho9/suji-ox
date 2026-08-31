import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchMetadata } from "@/lib/quiz-api";

export type QuizFilterValue = { unit?: string | undefined; examName?: string | undefined };

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`max-w-full truncate rounded-full px-3 py-1.5 text-[11px] font-bold transition active:scale-95 ${
        active
          ? "btn-gradient shadow-sm"
          : "bg-secondary/70 text-secondary-foreground hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}

/** 단원 / 시험 회차 필터 (GET /api/metadata 기반) */
export function QuizFilterDialog({
  value,
  onApply,
}: {
  value: QuizFilterValue;
  onApply: (next: QuizFilterValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState(value.unit ?? "");
  const [examName, setExamName] = useState(value.examName ?? "");

  const metaQuery = useQuery({
    queryKey: ["quiz-metadata"],
    queryFn: () => fetchMetadata(),
    enabled: open,
    staleTime: 1000 * 60 * 30,
  });

  const activeCount = (value.unit ? 1 : 0) + (value.examName ? 1 : 0);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setUnit(value.unit ?? "");
          setExamName(value.examName ?? "");
          setOpen(true);
        }}
        className="shrink-0 rounded-full bg-card/80 px-3 py-1 text-[11px] font-bold text-secondary-foreground ring-1 ring-border/70 transition active:scale-95"
      >
        🔍 필터{activeCount > 0 ? ` ${activeCount}` : ""}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">문제 범위 고르기 🌸</DialogTitle>
            <DialogDescription className="text-xs">
              단원과 시험 회차를 골라서 원하는 기출만 풀 수 있어요.
            </DialogDescription>
          </DialogHeader>

          {metaQuery.isLoading && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              필터를 불러오는 중이에요 🎀
            </p>
          )}
          {metaQuery.isError && (
            <p className="py-6 text-center text-sm text-destructive">
              필터 정보를 불러오지 못했어요 🥲
            </p>
          )}

          {metaQuery.data && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2 text-[11px] font-bold text-muted-foreground">📚 시험 회차</p>
                <div className="flex flex-wrap gap-2">
                  <Chip active={!examName} onClick={() => setExamName("")}>
                    전체
                  </Chip>
                  {metaQuery.data.exams.map((e) => (
                    <Chip
                      key={e.exam_name}
                      active={examName === e.exam_name}
                      onClick={() => setExamName(e.exam_name)}
                    >
                      {e.exam_name} ({e.count})
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-bold text-muted-foreground">🧭 단원</p>
                <div className="flex flex-wrap gap-2">
                  <Chip active={!unit} onClick={() => setUnit("")}>
                    전체
                  </Chip>
                  {metaQuery.data.units.map((u) => (
                    <Chip key={u.unit} active={unit === u.unit} onClick={() => setUnit(u.unit)}>
                      {u.unit} ({u.count})
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUnit("");
                    setExamName("");
                  }}
                  className="rounded-2xl bg-secondary px-4 py-3 text-sm font-bold text-secondary-foreground transition active:scale-95"
                >
                  초기화
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onApply({ unit: unit || undefined, examName: examName || undefined });
                    setOpen(false);
                  }}
                  className="flex-1 rounded-2xl btn-gradient py-3 font-display text-base transition active:scale-95"
                >
                  이 범위로 풀기 🚀
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
