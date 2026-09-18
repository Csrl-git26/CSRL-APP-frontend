import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getCenterOverallWeakTopics } from '../services/weakTopicApi';
import WeakTopicCard from './WeakTopicCard';

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

  const isEmpty = !data || !data.subjectWise || Object.keys(data).length === 0;

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

  const firstTest = data.testsIncluded && data.testsIncluded.length > 0 ? data.testsIncluded[0] : 'N/A';
  const lastTest = data.testsIncluded && data.testsIncluded.length > 0 ? data.testsIncluded[data.testsIncluded.length - 1] : 'N/A';

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gray-200)' }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--gray-800)' }}>
          Center Overall Topic Performance
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--gray-500)' }}>
          Based on {data.totalTests} tests ({firstTest} to {lastTest}) • {data.studentCount || 0} students max
        </p>
      </div>
      
      <div style={{ padding: '16px 24px 0', display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, alignItems: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#27ae60', display: 'inline-block' }} />
          <strong style={{ color: '#27ae60' }}>Strong</strong>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f39c12', display: 'inline-block' }} />
          <strong style={{ color: '#f39c12' }}>Moderate</strong>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#c0392b', display: 'inline-block' }} />
          <strong style={{ color: '#c0392b' }}>Weak</strong>
        </span>
        <span style={{ marginLeft: 'auto', color: 'var(--gray-400)', fontSize: 11, fontStyle: 'italic' }}>
          AT. = Attempted %, AC. = Accuracy %
        </span>
      </div>

      <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        {SUBJECTS.map((subject) => {
          const subjectKey = subject.toUpperCase();
          const subData = data.subjectWise ? (data.subjectWise[subjectKey] || { strong: [], moderate: [], weak: [] }) : { strong: [], moderate: [], weak: [] };
          return (
            <WeakTopicCard
              key={subject}
              subject={subject}
              strongTopics={subData.strong || []}
              moderateTopics={subData.moderate || []}
              weakTopics={subData.weak || []}
              isCenter={true}
            />
          );
        })}
      </div>
    </div>
  );
}
