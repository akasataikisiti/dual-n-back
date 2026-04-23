import { useState, useEffect, useRef } from 'react';
import { GameSettings, BoardSize, MatchType, KeyBindings } from '../types';
import { getActiveTypes } from '../utils/gameLogic';
import { getTimings } from '../utils/timing';

const MATCH_TYPES: { key: MatchType; label: string }[] = [
  { key: 'position', label: '位置' },
  { key: 'shape', label: '形' },
  { key: 'color', label: '色' },
  { key: 'sound', label: '音' },
];

const KEY_LABELS: Record<MatchType, string> = {
  position: '位置ボタン',
  shape: '形ボタン',
  color: '色ボタン',
  sound: '音ボタン',
};

interface Props {
  settings: GameSettings;
  onStart: (settings: GameSettings) => void;
  onHistory: () => void;
}

export function SetupScreen({ settings: initial, onStart, onHistory }: Props) {
  const [s, setS] = useState<GameSettings>(initial);
  const [capturingKey, setCapturingKey] = useState<MatchType | null>(null);
  const capturingRef = useRef<MatchType | null>(null);
  capturingRef.current = capturingKey;

  const activeTypes = getActiveTypes(s.matchTypes);
  const timings = getTimings(activeTypes.length);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = capturingRef.current;
      if (!t) return;
      e.preventDefault();
      const key = e.key.toLowerCase();
      if (key.length !== 1) return;
      setS(prev => {
        const conflict = (Object.keys(prev.keyBindings) as MatchType[]).find(
          k => k !== t && prev.keyBindings[k] === key
        );
        const newBindings = { ...prev.keyBindings, [t]: key };
        if (conflict) newBindings[conflict] = prev.keyBindings[t];
        return { ...prev, keyBindings: newBindings };
      });
      setCapturingKey(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  function setNLevel(delta: number) {
    setS(prev => ({ ...prev, nLevel: Math.max(1, Math.min(9, prev.nLevel + delta)) }));
  }

  function setTrialCount(v: number) {
    setS(prev => ({ ...prev, trialCount: Math.max(5, Math.min(100, v)) }));
  }

  function setBoardSize(v: BoardSize) {
    setS(prev => ({ ...prev, boardSize: v }));
  }

  function toggleMatchType(t: MatchType) {
    if (t === 'position') return;
    setS(prev => ({
      ...prev,
      matchTypes: { ...prev.matchTypes, [t]: !prev.matchTypes[t] },
    }));
  }

  function startCapture(t: MatchType) {
    setCapturingKey(t);
  }

  function handleStart() {
    onStart(s);
  }

  return (
    <div className="setup-screen">
      <h1 className="setup-title">Dual N-Back</h1>

      <section className="setup-section">
        <h3>N レベル</h3>
        <div className="nlevel-control">
          <button className="stepper-btn" onClick={() => setNLevel(-1)} disabled={s.nLevel <= 1}>−</button>
          <span className="nlevel-value">{s.nLevel}-back</span>
          <button className="stepper-btn" onClick={() => setNLevel(1)} disabled={s.nLevel >= 9}>＋</button>
        </div>
      </section>

      <section className="setup-section">
        <h3>盤面サイズ</h3>
        <div className="board-size-options">
          {([3, 4, 5] as BoardSize[]).map(n => (
            <button
              key={n}
              className={`size-btn ${s.boardSize === n ? 'size-btn--active' : ''}`}
              onClick={() => setBoardSize(n)}
            >
              {n}×{n}
            </button>
          ))}
        </div>
      </section>

      <section className="setup-section">
        <h3>マッチ種類</h3>
        <div className="match-type-options">
          {MATCH_TYPES.map(({ key, label }) => (
            <label key={key} className={`match-toggle ${key === 'position' ? 'match-toggle--fixed' : ''}`}>
              <input
                type="checkbox"
                checked={s.matchTypes[key]}
                onChange={() => toggleMatchType(key)}
                disabled={key === 'position'}
              />
              <span>{label}</span>
              {key === 'position' && <span className="badge">固定</span>}
            </label>
          ))}
        </div>
      </section>

      <section className="setup-section">
        <h3>問題数</h3>
        <div className="trial-count-control">
          <input
            type="number"
            min={5}
            max={100}
            value={s.trialCount}
            onChange={e => setTrialCount(parseInt(e.target.value) || 20)}
            className="trial-input"
          />
          <span>問</span>
        </div>
      </section>

      <section className="setup-section">
        <h3>キーバインド</h3>
        <div className="keybind-list">
          {MATCH_TYPES.filter(({ key }) => s.matchTypes[key]).map(({ key }) => (
            <div key={key} className="keybind-row">
              <span className="keybind-label">{KEY_LABELS[key]}</span>
              <button
                className={`keybind-btn ${capturingKey === key ? 'keybind-btn--capturing' : ''}`}
                onClick={() => startCapture(key)}
              >
                {capturingKey === key ? 'キーを押してください...' : s.keyBindings[key].toUpperCase()}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="setup-section setup-section--timing">
        <h3>タイミング（自動計算）</h3>
        <div className="timing-info">
          <span>刺激表示: {(timings.stimulusDuration / 1000).toFixed(1)}s</span>
          <span>インターバル: {(timings.blankDuration / 1000).toFixed(1)}s</span>
          <span>1試行: {((timings.stimulusDuration + timings.blankDuration) / 1000).toFixed(1)}s</span>
        </div>
      </section>

      <section className="setup-section">
        <h3>表示オプション</h3>
        <label className="match-toggle">
          <input
            type="checkbox"
            checked={s.showTimerBar}
            onChange={() => setS(prev => ({ ...prev, showTimerBar: !prev.showTimerBar }))}
          />
          <span>タイマーバーを表示</span>
        </label>
      </section>

      <div className="setup-actions">
        <button className="btn-primary btn-start" onClick={handleStart}>
          スタート
        </button>
        <button className="btn-ghost" onClick={onHistory}>
          履歴を見る
        </button>
      </div>
    </div>
  );
}
