import { BarChart2, ChevronRight, Flag } from 'lucide-react';
import { CENTERS } from '../config/centers';

function centreLabel(code) {
  return CENTERS[code]?.name || code;
}

function getGradientColor(index, total) {
  if (total <= 1) return '#1a4fa0';
  const factor = index / (total - 1);
  const r = Math.round(26 + factor * (220 - 26));
  const g = Math.round(79 + factor * (20 - 79));
  const b = Math.round(160 + factor * (20 - 160));
  return `rgb(${r}, ${g}, ${b})`;
}

function RankBadge({ index, total }) {
  const color = getGradientColor(index, total);
  return (
    <div className="rank-badge" style={{ background: '#f8fafc', color }} aria-label={`Rank ${index + 1}`}>
      {index + 1}
    </div>
  );
}

const Empty = ({ message }) => (
  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray-400)' }}>
    <BarChart2 size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
    <div style={{ fontWeight: 600 }}>{message}</div>
  </div>
);

const pct = (a, x) => (x > 0 ? Math.round((a / x) * 100) : 0);

/**
 * CentreLeaderboard
 *
 * Props:
 *   centreStats  — array from backend /api/analytics/centre-leaderboard
 *                  [{ rank, code, avg, top, tested, studentCount, weakSubject }]
 *   selTest      — selected test key (for display only)
 */
export default function CentreLeaderboard({ centreStats = [], selTest, onCentreClick }) {
  if (!selTest) return <Empty message="Select a test to view rankings" />;
  if (!centreStats.length) return <Empty message={`No test data for ${selTest}`} />;

  const maxAvg = centreStats[0]?.avg || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 16 }}>
      {centreStats.map((centre, index) => {
        const color = getGradientColor(index, centreStats.length);
        const clickable = typeof onCentreClick === 'function';
        
        return (
          <div 
            key={centre.code} 
            className={`centre-rank-card ${clickable ? 'clickable-card' : ''}`} 
            style={{ 
              borderLeftColor: color,
              cursor: clickable ? 'pointer' : 'default',
              transition: 'transform 0.2s, box-shadow 0.2s',
              position: 'relative',
              paddingTop: (centre.avg < 100 || (centre.qualRate ?? 0) < 50) ? 32 : undefined
            }}
            onClick={() => clickable && onCentreClick(centre.code)}
          >
            {(centre.avg < 100 || (centre.qualRate ?? 0) < 50) && (
              <div style={{
                position: 'absolute',
                top: 6,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#fee2e2',
                color: '#991b1b',
                padding: '2px 12px',
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                border: '1px solid #fecaca',
                zIndex: 10
              }} title="Action Required: Low Avg or Low Qual. Rate">
                <Flag size={12} fill="currentColor" strokeWidth={2.5} /> ACTION REQUIRED
              </div>
            )}
            <RankBadge index={index} total={centreStats.length} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                {centre.code.toUpperCase().includes('OIL') ? (
                  <img src="/OIL_INDIA_logo.png" alt="OIL" style={{ height: 28, objectFit: 'contain' }} />
                ) : centre.code.toUpperCase().includes('GAIL') ? (
                  <img src="/GAIL_logo.png" alt="GAIL" style={{ height: 28, objectFit: 'contain' }} />
                ) : null}
                <span style={{ fontWeight: 800, fontSize: 16 }}>{centreLabel(centre.code)}</span>
                <span style={{ fontSize: 13, background: 'var(--csrl-blue-light)', color: 'var(--csrl-blue)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                  {centre.code}
                </span>
                <span style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600 }}>
                  {centre.tested}/{centre.studentCount} tested
                </span>
                {clickable && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--csrl-blue)', padding: '2px 10px', borderRadius: 12, fontWeight: 700, backgroundColor: 'var(--csrl-blue-light)', border: '1px solid #c7d2fe', marginLeft: 6 }}>
                    Click to overview <ChevronRight size={14} strokeWidth={3} />
                  </span>
                )}

                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                  {centre.notQualBySub && Object.keys(centre.notQualBySub).length > 0 && (
                    <span style={{ fontSize: 13, background: '#f8fafc', border: '1px solid var(--gray-200)', color: 'var(--gray-700)', padding: '2px 8px', borderRadius: 4, display: 'flex', gap: 6, alignItems: 'center', fontWeight: 700 }}>
                      <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Not Qual:</span>
                      {Object.entries(centre.notQualBySub).map(([sub, count]) => (
                        <span key={sub}>{sub === 'Mathematics' || sub === 'Math' ? 'Math' : sub.substring(0, 4)}: <strong style={{ color: 'var(--red)' }}>{count}</strong></span>
                      ))}
                    </span>
                  )}
                  <span style={{ fontSize: 13, background: '#fae8ff', color: '#86198f', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                    {centre.qualRate ?? 0}% Qual.
                  </span>
                  <span style={{ fontSize: 13, background: 'var(--red-bg)', color: 'var(--red)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                    Weak (Avg): {centre.weakSubject}
                  </span>
                  {centre.accuracyWeakSubject && (
                    <span style={{ fontSize: 13, background: '#fdf2f8', color: '#9d174d', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                      Weak (Acc): {centre.accuracyWeakSubject}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div className="progress-bar" style={{ height: 10 }}>
                    <div className="progress-fill" style={{ width: `${pct(centre.avg, maxAvg)}%`, background: color }} />
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, minWidth: 90, textAlign: 'right', color: 'var(--gray-800)' }}>
                  Avg: <span style={{ fontSize: 18, color }}>{centre.avg}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', minWidth: 60, textAlign: 'right', fontWeight: 600 }}>
                  Top: {centre.top}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
