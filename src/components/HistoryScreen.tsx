import { SessionResult, MatchType } from '../types';

const LABELS: Record<MatchType, string> = {
  position: '位置', shape: '形', color: '色', sound: '音',
};

const NLEVEL_COLORS: Record<number, string> = {
  1: '#4f8ef7', 2: '#2ecc71', 3: '#e67e22', 4: '#e74c3c', 5: '#9b59b6', 6: '#f1c40f',
};
function nlevelColor(n: number) {
  return NLEVEL_COLORS[n] ?? '#8888aa';
}

interface Props {
  history: SessionResult[];
  onBack: () => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('ja-JP', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

function ScoreChart({ data }: { data: SessionResult[] }) {
  if (data.length < 2) return null;

  const W = 460, H = 130;
  const pad = { top: 14, right: 14, bottom: 24, left: 36 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  const scores = data.map(r => r.score);
  const maxS = Math.max(...scores);
  const minS = Math.min(...scores);
  const range = maxS - minS || 1;

  const px = (i: number) => pad.left + (data.length === 1 ? iW / 2 : (i / (data.length - 1)) * iW);
  const py = (s: number) => pad.top + iH - ((s - minS) / range) * iH;

  const polyline = data.map((r, i) => `${px(i)},${py(r.score)}`).join(' ');
  const gridVals = [minS, Math.round((minS + maxS) / 2), maxS];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="score-chart" aria-label="スコア推移チャート">
      {gridVals.map((v, idx) => (
        <g key={idx}>
          <line
            x1={pad.left} y1={py(v)} x2={pad.left + iW} y2={py(v)}
            stroke="var(--border)" strokeWidth="0.8"
            strokeDasharray={idx === gridVals.length - 1 ? undefined : '4,4'}
          />
          <text x={pad.left - 5} y={py(v) + 3.5} fill="var(--text-muted)" fontSize="9" textAnchor="end">{v}</text>
        </g>
      ))}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + iH} stroke="var(--border)" strokeWidth="1" />
      <polyline points={polyline} fill="none" stroke="#ffffff25" strokeWidth="2" strokeLinejoin="round" />
      {data.map((r, i) => (
        <circle key={r.id} cx={px(i)} cy={py(r.score)} r="4.5" fill={nlevelColor(r.nLevel)} stroke="var(--bg)" strokeWidth="1.5">
          <title>{`N${r.nLevel}  スコア: ${r.score}  ${formatDate(r.date)}`}</title>
        </circle>
      ))}
      <text
        x={px(data.length - 1)} y={py(data[data.length - 1].score) - 8}
        fill="var(--accent)" fontSize="10" textAnchor="middle" fontWeight="700"
      >
        {data[data.length - 1].score}
      </text>
    </svg>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export function HistoryScreen({ history, onBack }: Props) {
  const chronological = [...history].reverse();
  const chartData = chronological.slice(-20);

  const totalSessions = history.length;
  const bestScore = totalSessions > 0 ? Math.max(...history.map(r => r.score)) : 0;
  const recent = history.slice(0, 10);
  const recentAvg = recent.length > 0
    ? Math.round(recent.reduce((s, r) => s + r.score, 0) / recent.length)
    : 0;

  const byNLevel: Record<number, number[]> = {};
  for (const r of history) {
    (byNLevel[r.nLevel] ??= []).push(r.score);
  }
  const nLevels = Object.keys(byNLevel).map(Number).sort((a, b) => a - b);

  return (
    <div className="history-screen">
      <div className="history-header">
        <h2>成長記録</h2>
        <button className="btn-secondary" onClick={onBack}>戻る</button>
      </div>

      {history.length === 0 ? (
        <p className="history-empty">まだ記録がありません。</p>
      ) : (
        <>
          <div className="stat-cards">
            <StatCard label="総セッション" value={totalSessions} />
            <StatCard label="最高スコア" value={bestScore} />
            <StatCard label="直近の平均" value={recentAvg} sub={`直近${recent.length}回`} />
          </div>

          {chartData.length >= 2 && (
            <div className="chart-section">
              <div className="chart-title">
                スコア推移
                <span className="chart-subtitle">（直近{chartData.length}セッション・ドットの色はN-level）</span>
              </div>
              <ScoreChart data={chartData} />
              <div className="chart-legend">
                {nLevels.map(n => (
                  <div key={n} className="legend-item">
                    <span className="legend-dot" style={{ background: nlevelColor(n) }} />
                    <span>N={n}</span>
                    <span className="legend-avg">
                      平均 {Math.round(byNLevel[n].reduce((s, v) => s + v, 0) / byNLevel[n].length)}
                      <span className="legend-count">（{byNLevel[n].length}回）</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                    <td style={{ color: nlevelColor(r.nLevel), fontWeight: 700 }}>{r.nLevel}</td>
                    <td>{r.boardSize}×{r.boardSize}</td>
                    <td>{r.activeMatchTypes.map(t => LABELS[t]).join('・')}</td>
                    <td>{r.trialCount}</td>
                    <td className="td-score">{r.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
