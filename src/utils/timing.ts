export interface Timings {
  stimulusDuration: number;
  blankDuration: number;
}

export function getTimings(activeFlags: number, responseWindowOffsetMs = 0): Timings {
  const extraByComplexity = Math.max(0, activeFlags - 2) * 250;
  return {
    stimulusDuration: Math.max(800, 1500 + (activeFlags - 1) * 300 + extraByComplexity + responseWindowOffsetMs),
    blankDuration: 500 + (activeFlags - 1) * 100,
  };
}
