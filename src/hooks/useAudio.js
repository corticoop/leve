// Audio: a real bossa nova loop (Kevin MacLeod, CC BY 3.0) as ambient
// background + procedural harmonic notes for row clears. No sound on piece
// placement — the game plays mostly silent beneath the bossa bed.

import { useEffect, useRef, useCallback, useState } from 'react';

// Pentatonic scale notes for the melodic clear harmonics, tuned warm + low.
const SCALE = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];

const BOSSA_SRC = '/audio/bossa.mp3';

export function useAudio() {
  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const musicElRef = useRef(null);
  const musicGainRef = useRef(null);
  const fxGainRef = useRef(null);

  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem('leve.muted') === '1'; } catch { return false; }
  });

  // Lazily create the AudioContext, master gain, and two buses:
  //   - music bus (routes the bossa nova <audio> element)
  //   - fx bus (routes the procedural clear chimes)
  const ensureCtx = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();

    const master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ctx.destination);

    const musicGain = ctx.createGain();
    musicGain.gain.value = 0;            // starts silent; faded in on first gesture
    musicGain.connect(master);

    const fxGain = ctx.createGain();
    fxGain.gain.value = 0.9;
    fxGain.connect(master);

    ctxRef.current = ctx;
    masterRef.current = master;
    musicGainRef.current = musicGain;
    fxGainRef.current = fxGain;
    return ctx;
  }, [muted]);

  // Attach the <audio> element to the music bus via MediaElementSource.
  const ensureMusic = useCallback(() => {
    const ctx = ensureCtx();
    if (!ctx || musicElRef.current) return;
    const el = new Audio(BOSSA_SRC);
    el.loop = true;
    el.preload = 'auto';
    el.crossOrigin = 'anonymous';
    el.volume = 1.0;
    try {
      const src = ctx.createMediaElementSource(el);
      src.connect(musicGainRef.current);
    } catch (e) {
      // Fallback: play the element directly (volume still controllable)
      console.warn('MediaElementSource failed, falling back:', e);
    }
    musicElRef.current = el;
  }, [ensureCtx]);

  const startMusic = useCallback(() => {
    const ctx = ensureCtx();
    if (!ctx) return;
    ensureMusic();
    const el = musicElRef.current;
    if (!el) return;
    // Fade the music bus in slowly so it doesn't startle.
    const g = musicGainRef.current.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(g.value, ctx.currentTime);
    g.linearRampToValueAtTime(muted ? 0 : 0.55, ctx.currentTime + 3.0);
    if (el.paused) el.play().catch((err) => console.warn('Bossa play blocked:', err));
  }, [ensureCtx, ensureMusic, muted]);

  // Melodic note for clearing a line. Each clear in a combo is a higher tone.
  const playClear = useCallback((index = 0, totalClears = 1) => {
    const ctx = ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime + index * 0.08;
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o2.type = 'triangle';
    const baseIdx = 2 + index;
    const note = SCALE[Math.min(baseIdx, SCALE.length - 1)];
    o.frequency.value = note;
    o2.frequency.value = note * 2;
    o.connect(g);
    o2.connect(g);
    g.connect(fxGainRef.current);
    const peak = 0.16 + Math.min(totalClears, 4) * 0.03;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.15);
    o.start(t);
    o2.start(t);
    o.stop(t + 1.25);
    o2.stop(t + 1.25);
  }, [ensureCtx]);

  // Placement is silent by design — keep the API but make it a no-op.
  const playPlace = useCallback(() => {}, []);

  // Tiny pickup feedback. Silent too — the bossa nova is the carrier.
  const playPick = useCallback(() => {}, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      try { localStorage.setItem('leve.muted', next ? '1' : '0'); } catch {}
      const ctx = ctxRef.current;
      if (masterRef.current && ctx) {
        masterRef.current.gain.setTargetAtTime(next ? 0 : 1, ctx.currentTime, 0.08);
      }
      return next;
    });
  }, []);

  // Resume audio on first user gesture (browser autoplay policy),
  // then start the bossa nova loop with a slow fade-in.
  useEffect(() => {
    const resume = () => {
      const ctx = ensureCtx();
      if (ctx && ctx.state === 'suspended') ctx.resume();
      startMusic();
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
    };
    window.addEventListener('pointerdown', resume, { once: true });
    window.addEventListener('keydown', resume, { once: true });
    return () => {
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
    };
  }, [ensureCtx, startMusic]);

  return { playPlace, playClear, playPick, toggleMute, muted };
}
