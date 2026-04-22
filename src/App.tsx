import { useState, useCallback } from 'react';
import { GameSettings, SessionResult } from './types';
import { loadSettings, saveSettings, loadHistory, appendHistory } from './utils/storage';
import { SetupScreen } from './components/SetupScreen';
import { GameScreen } from './components/GameScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { HistoryScreen } from './components/HistoryScreen';

type Screen = 'setup' | 'game' | 'results' | 'history';

export function App() {
  const [screen, setScreen] = useState<Screen>('setup');
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [lastResult, setLastResult] = useState<SessionResult | null>(null);
  const [history, setHistory] = useState(loadHistory);
  const [gameKey, setGameKey] = useState(0);

  const handleStart = useCallback((s: GameSettings) => {
    setSettings(s);
    saveSettings(s);
    setGameKey(k => k + 1);
    setScreen('game');
  }, []);

  const handleComplete = useCallback((result: SessionResult) => {
    appendHistory(result);
    setLastResult(result);
    setHistory(loadHistory());
    setScreen('results');
  }, []);

  const handlePlayAgain = useCallback(() => {
    setGameKey(k => k + 1);
    setScreen('game');
  }, []);

  const handleHistory = useCallback(() => {
    setHistory(loadHistory());
    setScreen('history');
  }, []);

  return (
    <div className="app">
      {screen === 'setup' && (
        <SetupScreen settings={settings} onStart={handleStart} onHistory={handleHistory} />
      )}
      {screen === 'game' && (
        <GameScreen key={gameKey} settings={settings} onComplete={handleComplete} onQuit={() => setScreen('setup')} />
      )}
      {screen === 'results' && lastResult && (
        <ResultsScreen
          result={lastResult}
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
