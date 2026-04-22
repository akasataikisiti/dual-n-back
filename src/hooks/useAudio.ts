import { useRef, useCallback } from 'react';

export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);

  function getCtx(): AudioContext {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }

  const playTileChange = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // audio unavailable
    }
  }, []);

  const speakLetter = useCallback((letter: string) => {
    try {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(letter);
      utt.lang = 'en-US';
      utt.rate = 1.1;
      utt.pitch = 1.0;
      utt.volume = 0.9;
      window.speechSynthesis.speak(utt);
    } catch {
      // speech unavailable
    }
  }, []);

  return { playTileChange, speakLetter };
}
