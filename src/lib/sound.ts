let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, duration: number, gainPeak = 0.12) {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  const t = audio.currentTime + start;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(gainPeak, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(audio.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

/** Cheerful ascending chime. */
export function playCorrect() {
  tone(784, 0, 0.18);
  tone(1046, 0.09, 0.22);
  tone(1318, 0.18, 0.3, 0.1);
}

/** Soft descending blip — gentle, not harsh. */
export function playWrong() {
  tone(392, 0, 0.16, 0.1);
  tone(294, 0.11, 0.26, 0.09);
}

/** Light tap feedback. */
export function playTap() {
  tone(660, 0, 0.08, 0.06);
}
