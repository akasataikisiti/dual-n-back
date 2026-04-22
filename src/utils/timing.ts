export interface Timings {
  stimulusDuration: number;
  blankDuration: number;
}

export function getTimings(activeFlags: number): Timings {
  return {
    stimulusDuration: 1500 + (activeFlags - 1) * 300,
    blankDuration: 500 + (activeFlags - 1) * 100,
  };
}
