import { SessionResult, MatchType, FeedbackType } from '../types';

const LABELS: Record<MatchType, string> = {
  position: '位置',
  shape: '形',
  color: '色',
  sound: '音',
};

interface TypeStats {
  hits: number;
  misses: number;
  falseAlarms: number;
  total: number;
}

function calcStats(result: SessionResult): Partial<Record<MatchType, TypeStats>> {
  const stats: Partial<Record<MatchType, TypeStats>> = {};
  result.activeMatchTypes.forEach(t => {
    stats[t] = { hits: 0, misses: 0, falseAlarms: 0, total: 0 };
  });
  result.records.forEach(r => {
    result.activeMatchTypes.forEach(t => {
      const fb: FeedbackType | undefined = r.feedback[t];
      const s = stats[t]!;
      s.total++;
      if (fb === 'hit') s.hits++;
      else if (fb === 'miss') s.misses++;
      else if (fb === 'falseAlarm') s.falseAlarms++;
    });
  });
  return stats;
}

interface Props {
  result: SessionResult;
  recordCelebration: {
    isNewRecord: boolean;
    previousBest: number | null;
  };
  onPlayAgain: () => void;
  onSettings: () => void;
  onHistory: () => void;
}

const CONFETTI_ITEMS = Array.from({ length: 18 }, (_, index) => index);

export function ResultsScreen({ result, recordCelebration, onPlayAgain, onSettings, onHistory }: Props) {
  const stats = calcStats(result);

  return (
    <div className="results-screen">
      {recordCelebration.isNewRecord && (
        <>
          <div className="results-confetti" aria-hidden="true">
            {CONFETTI_ITEMS.map(item => (
              <span key={item} className={`confetti-piece confetti-piece--${(item % 6) + 1}`} />
            ))}
          </div>
          <div className="results-celebration" role="status" aria-live="polite">
            <span className="results-celebration__eyebrow">NEW RECORD</span>
            <strong>記録更新おめでとう！</strong>
            <span>
              このモードの自己ベストを
              {' '}
              {recordCelebration.previousBest}
              {' '}
              → {result.score}
              に更新しました。
            </span>
          </div>
        </>
      )}

      <h2 className="results-title">セッション終了</h2>

      <div className="results-summary">
        <div className="results-item">
          <span className="results-label">N-back</span>
          <span className="results-value">{result.nLevel}</span>
        </div>
        <div className="results-item">
          <span className="results-label">問題数</span>
          <span className="results-value">{result.trialCount}</span>
        </div>
        <div className="results-item results-item--score">
          <span className="results-label">スコア</span>
          <span className="results-value results-score">{result.score}</span>
        </div>
      </div>

      <table className="results-table">
        <thead>
          <tr>
            <th>種類</th>
            <th>正解数</th>
            <th>ミス</th>
            <th>誤答</th>
            <th>正答率</th>
          </tr>
        </thead>
        <tbody>
          {result.activeMatchTypes.map(t => {
            const s = stats[t]!;
            const pct = s.total > 0 ? Math.round((s.hits / s.total) * 100) : 0;
            return (
              <tr key={t}>
                <td>{LABELS[t]}</td>
                <td className="td-hit">{s.hits}</td>
                <td className="td-miss">{s.misses}</td>
                <td className="td-fa">{s.falseAlarms}</td>
                <td>{pct}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="results-actions">
        <button className="btn-primary" onClick={onPlayAgain}>もう一度</button>
        <button className="btn-secondary" onClick={onSettings}>設定に戻る</button>
        <button className="btn-secondary" onClick={onHistory}>履歴</button>
      </div>
    </div>
  );
}
