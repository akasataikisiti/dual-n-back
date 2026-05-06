export interface Timings {
  stimulusDuration: number;
  blankDuration: number;
}

const SOUND_STIMULUS_BUFFER_MS = 300;

export function getTimings(activeFlags: number, responseWindowOffsetMs = 0, hasSound = false): Timings {
  const extraByComplexity = Math.max(0, activeFlags - 2) * 250;
  const soundBuffer = hasSound ? SOUND_STIMULUS_BUFFER_MS : 0;
  return {
    stimulusDuration: Math.max(800, 1500 + (activeFlags - 1) * 300 + extraByComplexity + soundBuffer + responseWindowOffsetMs),
    blankDuration: 500 + (activeFlags - 1) * 100,
  };
}
