// CenterWeakTopics.jsx
// Shows center-level weak topic analysis across tests.
// Fetches all test results on mount, shows tab per test.
// Displays totalStudents count and center-level percentages.

import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, Users } from 'lucide-react';
import { getCenterWeakTopics } from '../services/weakTopicApi';
import WeakTopicCard from './WeakTopicCard';

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics'];

export default function CenterWeakTopics({ centerId, activeTestKey }) {
  const [results,      setResults]      = useState([]); // array of CenterWeakTopics docs
  const [selectedTest, setSelectedTest] = useState('');
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  useEffect(() => {
    if (!centerId) return;
    let cancelled = false;

    setLoading(true);
    setError('');

    getCenterWeakTopics(centerId)
      .then((res) => {
        if (cancelled) return;
        const docs = Array.isArray(res.data) ? res.data : [];
        setResults(docs);
        if (docs.length > 0) {
          setSelectedTest(docs[docs.length - 1].testId);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load center weak topic data');
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
        <p style={{ fontWeight: 600, margin: 0 }}>Loading center weak topic analysis…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--red)', padding: '20px 0' }}>
        <AlertTriangle size={18} />
        <span>{error}</span>
      </div>
    );
  }

  if (!results.length) {
    return (
      <div style={{
        padding:      32,
        textAlign:    'center',
        color:        'var(--gray-400)',
        fontSize:     14,
        borderRadius: 10,
        background:   'var(--gray-50)',
        border:       '1px dashed var(--gray-200)',
      }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
        <div style={{ fontWeight: 600 }}>No weak topic data yet</div>
        <div style={{ marginTop: 4, fontSize: 13 }}>
          Upload topic maps and marks CSVs to compute center weak topics.
        </div>
      </div>
    );
  }

  const testList    = results.map((r) => r.testId);
  const resolvedTest = activeTestKey || selectedTest;
  const currentDoc  = results.find((r) => r.testId === resolvedTest);
  const weakTopics  = currentDoc?.weakTopics || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Test selector + total students */}
      <div className="card" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {activeTestKey ? `Test: ${activeTestKey}` : 'Select Test'}
          </div>
          {currentDoc && (
            <div style={{
              display:      'inline-flex',
              alignItems:   'center',
              gap:          6,
              padding:      '4px 12px',
              borderRadius: 999,
              background:   '#e8f0fc',
              color:        '#1a4fa0',
              fontSize:     12,
              fontWeight:   700,
            }}>
              <Users size={12} />
              Total Students: {currentDoc.totalStudentsTested}
            </div>
          )}
        </div>
        {!activeTestKey && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {testList.map((testId) => (
              <button
                key={testId}
                type="button"
                onClick={() => setSelectedTest(testId)}
                style={{
                  padding:      '6px 14px',
                  borderRadius: 999,
                  border:       selectedTest === testId ? '2px solid var(--csrl-blue)' : '1px solid var(--gray-200)',
                  background:   selectedTest === testId ? 'var(--csrl-blue-light)' : '#fff',
                  color:        selectedTest === testId ? 'var(--csrl-blue)' : 'var(--gray-600)',
                  fontWeight:   selectedTest === testId ? 700 : 500,
                  fontSize:     13,
                  cursor:       'pointer',
                  transition:   'all 0.15s',
                }}
              >
                {testId}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#c0392b', display: 'inline-block' }} />
          <strong style={{ color: '#c0392b' }}>Strong Weak</strong>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#b45309', display: 'inline-block' }} />
          <strong style={{ color: '#b45309' }}>Medium Weak</strong>
        </span>
      </div>

      {/* Subject cards */}
      {currentDoc ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {SUBJECTS.map((subject) => {
            const subData = weakTopics[subject] || { strongWeak: [], mediumWeak: [] };
            return (
              <WeakTopicCard
                key={subject}
                subject={subject}
                strongWeak={subData.strongWeak || []}
                mediumWeak={subData.mediumWeak || []}
                isCenter={true}
              />
            );
          })}
        </div>
      ) : (
        <div style={{ color: 'var(--gray-400)', padding: 20, textAlign: 'center' }}>
          No data for selected test.
        </div>
      )}
    </div>
  );
}
