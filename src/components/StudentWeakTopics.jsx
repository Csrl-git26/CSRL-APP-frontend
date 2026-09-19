// StudentWeakTopics.jsx
// Shows weak topic analysis for a student across tests.
// Fetches all test results on mount, shows tab per test.

import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { getStudentWeakTopics } from '../services/weakTopicApi';
import WeakTopicCard from './WeakTopicCard';


export default function StudentWeakTopics({ studentId, activeTestKey, stream = 'JEE' }) {
  const [results,      setResults]      = useState([]);  // array of StudentWeakTopics docs
  const [selectedTest, setSelectedTest] = useState('');
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  // Fetch all weak topic results for this student
  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;

    setLoading(true);
    setError('');

    getStudentWeakTopics(studentId)
      .then((res) => {
        if (cancelled) return;
        const docs = Array.isArray(res.data) ? res.data : [];
        setResults(docs);
        // Default to most recent test
        if (docs.length > 0) {
          setSelectedTest(docs[docs.length - 1].testId);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load weak topic data');
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
        <p style={{ fontWeight: 600, margin: 0 }}>Loading weak topic analysis…</p>
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
          Weak topic analysis will appear here once the admin uploads test data.
        </div>
      </div>
    );
  }

  // Build test list from results
  const testList = results.map((r) => r.testId);

  // Use external test key if provided, else internal state
  const resolvedTest = activeTestKey || selectedTest;

  // Find current test doc
  const currentDoc = results.find((r) => r.testId === resolvedTest);
  const subjectWise  = currentDoc?.subjectWise || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Test selector (Hidden if external test key active) */}
      {!activeTestKey && (
        <div className="card" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
            Select Test
          </div>
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
        </div>
      )}

      {/* Subject cards */}
      {currentDoc ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {(() => {
              const isNeet = stream === 'NEET' ||
                (resolvedTest && (resolvedTest.toUpperCase().startsWith('NCT') || resolvedTest.toUpperCase().includes('NEET'))) ||
                (subjectWise && ((subjectWise.BOTANY?.strong?.length > 0 || subjectWise.BOTANY?.weak?.length > 0 || subjectWise.BOTANY?.moderate?.length > 0) || (subjectWise.ZOOLOGY?.strong?.length > 0 || subjectWise.ZOOLOGY?.weak?.length > 0 || subjectWise.ZOOLOGY?.moderate?.length > 0)));
              const subjects = isNeet ? ['Physics', 'Chemistry', 'Botany', 'Zoology'] : ['Physics', 'Chemistry', 'Mathematics'];
              return subjects.map((subject) => {
                const subjectKey = subject.toUpperCase();
                const subData = subjectWise[subjectKey] || { strong: [], moderate: [], weak: [] };
                return (
                  <WeakTopicCard
                    key={subject}
                    subject={subject}
                    strongTopics={subData.strong || []}
                    moderateTopics={subData.moderate || []}
                    weakTopics={subData.weak || []}
                    isCenter={false}
                  />
                );
              });
            })()}
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, alignItems: 'center', marginTop: 10 }}>
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
        </>
      ) : (
        <div style={{ color: 'var(--gray-400)', padding: 20, textAlign: 'center' }}>
          No data for selected test.
        </div>
      )}
    </div>
  );
}
