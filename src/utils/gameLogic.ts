import { Stimulus, MatchConfig, GameSettings, MatchType, Shape, Color } from '../types';

const SHAPES: Shape[] = ['circle', 'triangle', 'square', 'star'];
const COLORS: Color[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const SOUNDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateStimuli(settings: GameSettings): Stimulus[] {
  const total = settings.nLevel + settings.trialCount;
  const cells = settings.boardSize * settings.boardSize;
  return Array.from({ length: total }, () => ({
    position: Math.floor(Math.random() * cells),
    shape: pick(SHAPES),
    color: pick(COLORS),
    sound: pick(SOUNDS),
  }));
}

export function checkMatches(
  stimuli: Stimulus[],
  currentIndex: number,
  nLevel: number,
  matchTypes: MatchConfig
): MatchConfig {
  const cur = stimuli[currentIndex];
  const prev = stimuli[currentIndex - nLevel];
  return {
    position: matchTypes.position && cur.position === prev.position,
    shape: matchTypes.shape && cur.shape === prev.shape,
    color: matchTypes.color && cur.color === prev.color,
    sound: matchTypes.sound && cur.sound === prev.sound,
  };
}

export function getActiveTypes(matchTypes: MatchConfig): MatchType[] {
  return (['position', 'shape', 'color', 'sound'] as MatchType[]).filter(t => matchTypes[t]);
}

export function emptyMatch(): MatchConfig {
  return { position: false, shape: false, color: false, sound: false };
}
