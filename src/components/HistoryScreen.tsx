import { SessionResult, MatchType } from '../types';

const LABELS: Record<MatchType, string> = {
  position: '位置',
  shape: '形',
  color: '色',
  sound: '音',
};

interface Props {
  history: SessionResult[];
  onBack: () => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('ja-JP', {
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export function HistoryScreen({ history, onBack }: Props) {
  return (
    <div className="history-screen">
      <div className="history-header">
        <h2>スコア履歴</h2>
        <button className="btn-secondary" onClick={onBack}>戻る</button>
      </div>

      {history.length === 0 ? (
        <p className="history-empty">まだ記録がありません。</p>
      ) : (
        <div className="history-table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>日時</th>
                <th>N</th>
                <th>盤面</th>
                <th>種類</th>
                <th>問題数</th>
                <th>スコア</th>
              </tr>
            </thead>
            <tbody>
              {history.map(r => (
                <tr key={r.id}>
                  <td>{formatDate(r.date)}</td>
                  <td>{r.nLevel}</td>
                  <td>{r.boardSize}×{r.boardSize}</td>
                  <td>{r.activeMatchTypes.map(t => LABELS[t]).join('・')}</td>
                  <td>{r.trialCount}</td>
                  <td className="td-score">{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
