import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getCenterOverallWeakTopics } from '../services/weakTopicApi';

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics'];

export default function CenterOverallWeakTopics({ centerId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!centerId) return;
    let cancelled = false;

    setLoading(true);
    getCenterOverallWeakTopics(centerId)
      .then((res) => {
        if (!cancelled && res.success) {
          setData(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load center overall weak topics:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [centerId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 40, color: 'var(--gray-400)' }}>
        <Loader2 size={28} className="spin" />
        <p style={{ fontWeight: 600, margin: 0 }}>Loading overall weak topics…</p>
      </div>
    );
  }

  const isEmpty = !data || !data.overallWeakTopics || Object.keys(data).length === 0;

  if (isEmpty) {
    return (
      <div style={{
        padding: 32,
        textAlign: 'center',
        color: 'var(--gray-400)',
        fontSize: 14,
        borderRadius: 10,
        background: 'var(--gray-50)',
        border: '1px dashed var(--gray-200)',
        marginTop: 20
      }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
        <div style={{ fontWeight: 600 }}>No overall weak topic data yet for this center.</div>
      </div>
    );
  }

  const renderPill = (entry, type) => {
    const isStrong = type === 'strong';
    const pillStyle = isStrong
      ? {
          display: 'inline-flex', flexDirection: 'column', padding: '6px 12px',
          borderRadius: 8, background: '#fdecea', border: '1px solid #f5a5a5',
          margin: '4px 6px 4px 0'
        }
      : {
          display: 'inline-flex', flexDirection: 'column', padding: '6px 12px',
          borderRadius: 8, background: '#fff8e1', border: '1px solid #fcd5a0',
          margin: '4px 6px 4px 0'
        };

    const titleColor = isStrong ? '#c0392b' : '#b45309';

    return (
      <span key={entry.topic} style={pillStyle}>
        <span style={{ fontSize: 13, fontWeight: 700, color: titleColor }}>{entry.topic}</span>
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--gray-600)', marginTop: 2 }}>
          {entry.avgWeakPercentage}% avg students affected
        </span>
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--gray-500)', marginTop: 2 }}>
          ({entry.strongWeakCount + entry.mediumWeakCount} / {entry.testedCount} tests)
        </span>
      </span>
    );
  };

  const subjectColor = (subject) => {
    const map = {
      Physics:     { bg: '#e8f0fc', color: '#1a4fa0', border: '#bbd0f8' },
      Chemistry:   { bg: '#fff3e0', color: '#b45309', border: '#fcd5a0' },
      Mathematics: { bg: '#e6f5ed', color: '#1a6e3b', border: '#a8dfc0' },
    };
    return map[subject] || { bg: '#f5f5f5', color: '#333', border: '#ddd' };
  };

  const firstTest = data.testsIncluded[0];
  const lastTest = data.testsIncluded[data.testsIncluded.length - 1];

  return (
    <div className="card" style={{ marginTop: 20 }}>
      {/* Header section */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gray-200)' }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--gray-800)' }}>
          Center Overall Weak Topics
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--gray-500)' }}>
          Based on {data.totalTests} tests ({firstTest} to {lastTest})
        </p>
      </div>

      <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {SUBJECTS.map((subject) => {
          const subjData = data.overallWeakTopics[subject];
          if (!subjData) return null;
          if (!subjData.strongWeak.length && !subjData.mediumWeak.length) return null;

          const colors = subjectColor(subject);

          return (
            <div key={subject} style={{
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              padding: '14px 16px',
              background: '#fff',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 8,
                borderBottom: `2px solid ${colors.border}`,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors.color, flexShrink: 0 }} />
                <span style={{ fontWeight: 700, fontSize: 14, color: colors.color }}>
                  {subject}
                </span>
              </div>

              {subjData.strongWeak.length > 0 && (
                <div style={{ marginBottom: subjData.mediumWeak.length ? 14 : 0 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: '#c0392b',
                    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
                  }}>
                    🔴 Weakest
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {subjData.strongWeak.map((entry) => renderPill(entry, 'strong'))}
                  </div>
                </div>
              )}

              {subjData.mediumWeak.length > 0 && (
                <div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: '#b45309',
                    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
                  }}>
                    🟡 Weak
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {subjData.mediumWeak.map((entry) => renderPill(entry, 'medium'))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
