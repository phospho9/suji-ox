const COLORS = [
  "bg-primary",
  "bg-lavender",
  "bg-mint",
  "bg-peach",
  "bg-accent",
  "bg-secondary",
];

const PIECES = Array.from({ length: 26 }, (_, i) => {
  const angle = (i / 26) * Math.PI * 2 + (i % 3) * 0.25;
  const dist = 90 + ((i * 37) % 90);
  return {
    dx: `${Math.cos(angle) * dist}px`,
    dy: `${Math.sin(angle) * dist - 20}px`,
    rot: `${((i * 97) % 720) - 360}deg`,
    delay: `${(i % 6) * 40}ms`,
    color: COLORS[i % COLORS.length],
    round: i % 3 === 0,
  };
});

/** Pure-CSS confetti burst. Remount (via `key`) to replay. */
export function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-visible" aria-hidden>
      <div className="absolute left-1/2 top-1/2">
        {PIECES.map((p, i) => (
          <span
            key={i}
            className={`absolute animate-confetti ${p.color} ${
              p.round ? "size-2.5 rounded-full" : "h-3.5 w-1.5 rounded-sm"
            }`}
            style={
              {
                "--dx": p.dx,
                "--dy": p.dy,
                "--rot": p.rot,
                animationDelay: p.delay,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}

const SPARKS = [
  { top: "6%", left: "10%", delay: "0ms" },
  { top: "14%", left: "82%", delay: "120ms" },
  { top: "68%", left: "6%", delay: "240ms" },
  { top: "78%", left: "88%", delay: "80ms" },
];

/** Small twinkling sparkles for a wrong-answer / ambient accent. */
export function Sparkles() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
      {SPARKS.map((s, i) => (
        <span
          key={i}
          className="absolute animate-sparkle text-lg"
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
        >
          ✨
        </span>
      ))}
    </div>
  );
}
