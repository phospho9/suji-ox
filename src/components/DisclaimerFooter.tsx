export function DisclaimerFooter() {
  return (
    <footer className="mx-auto w-full max-w-3xl px-5 pb-10 pt-8">
      <div className="glass-card p-5 text-[11px] leading-relaxed text-muted-foreground">
        <p className="mb-2 font-bold text-secondary-foreground">면책 고지 &amp; 제보 요청</p>
        <p>
          본 서비스의 선지 및 해설은 수능·모의평가 기출문제를 기반으로 AI 분석을 통해 O/X 문제로
          가공되었습니다. AI의 분석 및 변환 과정에서 일부 오탈자나 해석상의 오류가 존재할 수
          있습니다.
        </p>
        <p className="mt-2">
          더욱 정확한 문제 제공을 위해 오답이나 오류 발견 시 <b>[오류 제보]</b> 버튼을 통해 적극적인
          피드백 부탁드립니다.
        </p>
      </div>
    </footer>
  );
}
