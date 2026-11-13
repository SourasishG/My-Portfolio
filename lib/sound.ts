/**
 * Web Audio API procedural sound synthesizer inspired by Lorenzo Lottici and Luka Skhiladze.
 * Generates ultra-lightweight mechanical clicks, micro-ticks, and harmonic blips
 * without requiring external audio assets (.mp3/.wav).
 */

import { useSceneStore } from "@/lib/store";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a short, crisp mechanical click (e.g. button click, tab select)
 */
export function playMechanicalClick() {
  const soundOn = useSceneStore.getState().soundEnabled;
  if (!soundOn) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const now = ctx.currentTime;
  osc.type = "sine";
  osc.frequency.setValueAtTime(1400, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.016);

  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.02);
}

/**
 * Play an ultra-subtle mechanical tick (e.g. rotary dial step, chip hover)
 */
export function playRotaryTick() {
  const soundOn = useSceneStore.getState().soundEnabled;
  if (!soundOn) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const now = ctx.currentTime;
  osc.type = "triangle";
  osc.frequency.setValueAtTime(2800, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.008);

  gain.gain.setValueAtTime(0.025, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.01);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.012);
}

/**
 * Play an atmospheric harmonic chime (e.g. section arrival, sound toggle feedback)
 */
export function playAtmosphericChime(frequency = 528) {
  const soundOn = useSceneStore.getState().soundEnabled;
  if (!soundOn) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const now = ctx.currentTime;
  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0.045, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.38);
}
