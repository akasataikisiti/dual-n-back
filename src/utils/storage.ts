import { GameSettings, SessionResult, BoardSize } from '../types';

const SETTINGS_KEY = 'dnb_settings';
const HISTORY_KEY = 'dnb_history';
const MAX_HISTORY = 50;

const DEFAULT_SETTINGS: GameSettings = {
  nLevel: 2,
  boardSize: 3 as BoardSize,
  matchTypes: { position: true, shape: false, color: false, sound: false },
  trialCount: 20,
  responseWindowOffsetMs: 0,
  keyBindings: { position: 'a', shape: 's', color: 'd', sound: 'f' },
  showTimerBar: true,
};

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed, matchTypes: { ...DEFAULT_SETTINGS.matchTypes, ...parsed.matchTypes } };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s: GameSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function loadHistory(): SessionResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function appendHistory(result: SessionResult): void {
  const history = loadHistory();
  history.unshift(result);
  if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}
