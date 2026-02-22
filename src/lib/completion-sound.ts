/** Plays a subtle "done" chime using the Web Audio API — no external files needed. */
export function playCompletionSound() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Two quick sine tones: C5 → E5 (major third = positive/success feel)
    const notes = [523.25, 659.25]; // C5, E5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.3);
    });

    // Clean up context after sound finishes
    setTimeout(() => ctx.close(), 600);
  } catch {
    // AudioContext not available — silently skip
  }
}
