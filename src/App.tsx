import { useState, useCallback } from 'react';
import { GameSettings, SessionResult } from './types';
import { loadSettings, saveSettings, loadHistory, appendHistory } from './utils/storage';
import { SetupScreen } from './components/SetupScreen';
import { GameScreen } from './components/GameScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { trackEvent } from './utils/analytics';

type Screen = 'setup' | 'game' | 'results' | 'history';

interface RecordCelebration {
  isNewRecord: boolean;
  previousBest: number | null;
}

function countFeedback(result: SessionResult) {
  let hits = 0;
  let misses = 0;
  let falseAlarms = 0;

  result.records.forEach(record => {
    result.activeMatchTypes.forEach(type => {
      const feedback = record.feedback[type];
      if (feedback === 'hit') hits++;
      if (feedback === 'miss') misses++;
      if (feedback === 'falseAlarm') falseAlarms++;
    });
  });

  return { hits, misses, falseAlarms };
}

function modeKey(result: SessionResult) {
  return [
    result.nLevel,
    result.boardSize,
    result.trialCount,
    result.activeMatchTypes.join(','),
  ].join('|');
}

function getRecordCelebration(result: SessionResult, history: SessionResult[]): RecordCelebration {
  const sameModeScores = history
    .filter(item => modeKey(item) === modeKey(result))
    .map(item => item.score);

  if (sameModeScores.length === 0) {
    return { isNewRecord: false, previousBest: null };
  }

  const previousBest = Math.max(...sameModeScores);
  return {
    isNewRecord: result.score > previousBest,
    previousBest,
  };
}

export function App() {
  const [screen, setScreen] = useState<Screen>('setup');
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [lastResult, setLastResult] = useState<SessionResult | null>(null);
  const [history, setHistory] = useState(loadHistory);
  const [gameKey, setGameKey] = useState(0);
  const [recordCelebration, setRecordCelebration] = useState<RecordCelebration>({
    isNewRecord: false,
    previousBest: null,
  });

  const handleStart = useCallback((s: GameSettings) => {
    setSettings(s);
    saveSettings(s);
    trackEvent('game_started', {
      n_level: s.nLevel,
      board_size: s.boardSize,
      trial_count: s.trialCount,
      response_window_offset_ms: s.responseWindowOffsetMs,
      active_match_types: Object.entries(s.matchTypes)
        .filter(([, enabled]) => enabled)
        .map(([type]) => type)
        .join(','),
      show_timer_bar: s.showTimerBar,
    });
    setGameKey(k => k + 1);
    setScreen('game');
  }, []);

  const handleComplete = useCallback((result: SessionResult) => {
    const { hits, misses, falseAlarms } = countFeedback(result);
    const existingHistory = loadHistory();
    const celebration = getRecordCelebration(result, existingHistory);
    appendHistory(result);
    setLastResult(result);
    setHistory(loadHistory());
    setRecordCelebration(celebration);
    trackEvent('game_completed', {
      n_level: result.nLevel,
      board_size: result.boardSize,
      trial_count: result.trialCount,
      score: result.score,
      active_match_types: result.activeMatchTypes.join(','),
      hit_count: hits,
      miss_count: misses,
      false_alarm_count: falseAlarms,
    });
    setScreen('results');
  }, []);

  const handlePlayAgain = useCallback(() => {
    setGameKey(k => k + 1);
    setScreen('game');
  }, []);

  const handleHistory = useCallback(() => {
    setHistory(loadHistory());
    trackEvent('history_opened', { source_screen: screen });
    setScreen('history');
  }, [screen]);

  const handleQuit = useCallback(() => {
    trackEvent('game_quit', {
      n_level: settings.nLevel,
      board_size: settings.boardSize,
      trial_count: settings.trialCount,
      response_window_offset_ms: settings.responseWindowOffsetMs,
      active_match_types: Object.entries(settings.matchTypes)
        .filter(([, enabled]) => enabled)
        .map(([type]) => type)
        .join(','),
    });
    setScreen('setup');
  }, [settings]);

  return (
    <div className="app">
      {screen === 'setup' && (
        <SetupScreen settings={settings} onStart={handleStart} onHistory={handleHistory} />
      )}
      {screen === 'game' && (
        <GameScreen key={gameKey} settings={settings} onComplete={handleComplete} onQuit={handleQuit} />
      )}
      {screen === 'results' && lastResult && (
        <ResultsScreen
          result={lastResult}
          recordCelebration={recordCelebration}
          onPlayAgain={handlePlayAgain}
          onSettings={() => setScreen('setup')}
          onHistory={handleHistory}
        />
      )}
      {screen === 'history' && (
        <HistoryScreen history={history} onBack={() => setScreen('setup')} />
      )}
    </div>
  );
}
