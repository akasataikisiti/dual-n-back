export type BoardSize = 3 | 4 | 5;
export type Shape = 'circle' | 'triangle' | 'square' | 'star';
export type Color = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
export type MatchType = 'position' | 'shape' | 'color' | 'sound';

export interface MatchConfig {
  position: boolean;
  shape: boolean;
  color: boolean;
  sound: boolean;
}

export interface KeyBindings {
  position: string;
  shape: string;
  color: string;
  sound: string;
}

export interface GameSettings {
  nLevel: number;
  boardSize: BoardSize;
  matchTypes: MatchConfig;
  trialCount: number;
  keyBindings: KeyBindings;
  showTimerBar: boolean;
}

export interface Stimulus {
  position: number;
  shape: Shape;
  color: Color;
  sound: string;
}

export type FeedbackType = 'hit' | 'miss' | 'falseAlarm' | 'correctReject';
export type FeedbackMap = Partial<Record<MatchType, FeedbackType>>;

export interface TrialRecord {
  trialIndex: number;
  stimulus: Stimulus;
  shouldMatch: MatchConfig;
  userAnswered: MatchConfig;
  feedback: FeedbackMap;
  scoreGain: number;
}

export interface SessionResult {
  id: string;
  date: number;
  nLevel: number;
  boardSize: BoardSize;
  activeMatchTypes: MatchType[];
  trialCount: number;
  score: number;
  records: TrialRecord[];
}
