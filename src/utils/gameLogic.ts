import { Stimulus, MatchConfig, GameSettings, MatchType, Shape, Color } from '../types';

const SHAPES: Shape[] = ['circle', 'triangle', 'square', 'star'];
const COLORS: Color[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const SOUNDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const MATCH_RATE = 0.3;

function pickDifferent<T>(arr: T[], exclude: T): T {
  if (arr.length <= 1) return arr[0];
  let v: T;
  do { v = pick(arr); } while (v === exclude);
  return v;
}

export function generateStimuli(settings: GameSettings): Stimulus[] {
  const total = settings.nLevel + settings.trialCount;
  const cells = settings.boardSize * settings.boardSize;
  const positions = Array.from({ length: cells }, (_, i) => i);

  // 非アクティブな属性はセッション中固定値にする（形は四角固定）
  const fixedShape = settings.matchTypes.shape ? null : 'square' as Shape;
  const fixedColor = settings.matchTypes.color ? null : pick(COLORS);
  const fixedSound = settings.matchTypes.sound ? null : pick(SOUNDS);

  const stimuli: Stimulus[] = [];

  // 最初のnLevel個はランダム生成（比較対象なので制御不要）
  for (let i = 0; i < settings.nLevel; i++) {
    stimuli.push({
      position: Math.floor(Math.random() * cells),
      shape: fixedShape ?? pick(SHAPES),
      color: fixedColor ?? pick(COLORS),
      sound: fixedSound ?? pick(SOUNDS),
    });
  }

  // 採点対象の試行：各属性をマッチ率30%で制御
  for (let i = settings.nLevel; i < total; i++) {
    const prev = stimuli[i - settings.nLevel];

    const position = settings.matchTypes.position && Math.random() < MATCH_RATE
      ? prev.position
      : pickDifferent(positions, prev.position);

    const shape = fixedShape !== null ? fixedShape
      : Math.random() < MATCH_RATE ? prev.shape
      : pickDifferent(SHAPES, prev.shape);

    const color = fixedColor !== null ? fixedColor
      : Math.random() < MATCH_RATE ? prev.color
      : pickDifferent(COLORS, prev.color);

    const sound = fixedSound !== null ? fixedSound
      : Math.random() < MATCH_RATE ? prev.sound
      : pickDifferent(SOUNDS, prev.sound);

    stimuli.push({ position, shape, color, sound });
  }

  return stimuli;
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
