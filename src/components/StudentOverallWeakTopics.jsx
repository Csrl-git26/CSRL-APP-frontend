import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getStudentOverallWeakTopics } from '../services/weakTopicApi';

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics'];

export default function StudentOverallWeakTopics({ studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;

    setLoading(true);
    getStudentOverallWeakTopics(studentId)
      .then((res) => {
        if (!cancelled && res.success) {
          setData(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load student overall weak topics:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [studentId]);

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
        <div style={{ fontWeight: 600 }}>No overall weak topic data yet</div>
        <div style={{ marginTop: 4, fontSize: 13 }}>
          Complete at least 1 test to see overall results.
        </div>
      </div>
    );
  }

  const renderPill = (topic, type) => {
    const pillStyle = type === 'strong'
      ? {
          display: 'inline-flex', alignItems: 'center', padding: '4px 10px',
          borderRadius: 999, fontSize: 12, fontWeight: 600,
          background: '#fdecea', color: '#c0392b', border: '1px solid #f5a5a5',
          margin: '3px 4px 3px 0'
        }
      : {
          display: 'inline-flex', alignItems: 'center', padding: '4px 10px',
          borderRadius: 999, fontSize: 12, fontWeight: 600,
          background: '#fff8e1', color: '#b45309', border: '1px solid #fcd5a0',
          margin: '3px 4px 3px 0'
        };

    return (
      <span key={topic} style={pillStyle}>
        {topic}
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
          Overall Weak Topics
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--gray-500)' }}>
          Based on {data.totalTests} tests ({firstTest} to {lastTest})
        </p>
      </div>

      {data.totalAttempted > 0 && (
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--gray-200)',
          display: 'flex',
          gap: 24,
          flexWrap: 'wrap',
          background: '#f8fafc'
        }}>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Total Attempted</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-800)', marginTop: 2 }}>{data.totalAttempted}</div>
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Total Correct</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981', marginTop: 2 }}>{data.totalCorrect}</div>
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Total Wrong</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444', marginTop: 2 }}>{data.totalWrong}</div>
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Accuracy</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--csrl-blue)', marginTop: 2 }}>
              {Math.round((data.totalCorrect / data.totalAttempted) * 100)}%
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
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
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 8,
                borderBottom: `2px solid ${colors.border}`,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors.color, flexShrink: 0 }} />
                <span style={{ fontWeight: 700, fontSize: 14, color: colors.color }}>
                  {subject}
                </span>
              </div>

              {data.overallSubjectMetrics && data.overallSubjectMetrics[subject] && data.overallSubjectMetrics[subject].attempted > 0 && (
                <div style={{
                  display: 'flex', gap: 12, marginBottom: 16, padding: '10px 12px',
                  background: 'var(--gray-50)', borderRadius: 8, fontSize: 12, flexWrap: 'wrap'
                }}>
                  <div style={{ flex: 1, minWidth: '45%' }}>
                    <div style={{ color: 'var(--gray-500)', fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}>Attempted</div>
                    <div style={{ fontWeight: 700, color: 'var(--gray-700)' }}>{data.overallSubjectMetrics[subject].attempted}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: '45%' }}>
                    <div style={{ color: 'var(--gray-500)', fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}>Correct</div>
                    <div style={{ fontWeight: 700, color: '#10b981' }}>{data.overallSubjectMetrics[subject].correct}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: '45%' }}>
                    <div style={{ color: 'var(--gray-500)', fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}>Wrong</div>
                    <div style={{ fontWeight: 700, color: '#ef4444' }}>{data.overallSubjectMetrics[subject].wrong}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: '45%' }}>
                    <div style={{ color: 'var(--gray-500)', fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}>Accuracy</div>
                    <div style={{ fontWeight: 700, color: colors.color }}>
                      {Math.round((data.overallSubjectMetrics[subject].correct / data.overallSubjectMetrics[subject].attempted) * 100)}%
                    </div>
                  </div>
                </div>
              )}

              {subjData.strongWeak.length > 0 && (
                <div style={{ marginBottom: subjData.mediumWeak.length ? 10 : 0 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: '#c0392b',
                    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
                  }}>
                    🔴 Weakest
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {subjData.strongWeak.map((topic) => renderPill(topic, 'strong'))}
                  </div>
                </div>
              )}

              {subjData.mediumWeak.length > 0 && (
                <div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: '#b45309',
                    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
                  }}>
                    🟡 Weak
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {subjData.mediumWeak.map((topic) => renderPill(topic, 'medium'))}
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
