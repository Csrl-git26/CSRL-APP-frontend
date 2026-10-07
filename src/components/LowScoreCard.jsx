import { useEffect, useState } from 'react';
import { fetchTestInsights } from '../services/dataService';

export default function LowScoreCard({ testKey, stream, branch, onViewStudent }) {
  const scope = JSON.stringify([testKey, stream, branch]);
  const [result, setResult] = useState(null);
  const [selection, setSelection] = useState(null);
  useEffect(() => {
    let cancelled = false;
    setResult(null);
    setSelection(null);
    if (!testKey) return;
    fetchTestInsights(null, testKey, null, stream, 'ALL')
      .then(data => { if (!cancelled) setResult({ scope, data }); })
      .catch(error => { if (!cancelled) setResult({ scope, error: error.message || 'Unable to load test data.' }); });
    return () => { cancelled = true; };
  }, [testKey, stream, branch, scope]);
  const current = result?.scope === scope ? result : null;
  const insights = current?.data;
  const subjects = Object.keys(insights?.notQualifiedBySubject || {});
  const activeSelection = selection?.scope === scope ? selection : null;
  const rows = activeSelection ? insights?.lowScoringStudentsBySubject?.[activeSelection.subject]?.[activeSelection.centre] : null;
  return (
    <section className="card" style={{ marginTop: 16 }}>
      <h2 style={{ color: '#2563eb', fontSize: 16 }}>STUDENT NO. SUBJECTWISE MARKS &lt;={stream === 'NEET' ? 100 : 30}</h2>
      <p style={{ color: '#64748b' }}>Test: {testKey || 'None selected'}</p>
      {!testKey ? <p>Select a test to see student counts.</p> : !current ? <p role="status">Loading student counts…</p> : current.error ? <p role="alert">{current.error}</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {subjects.map(subject => (
            <div key={subject}>
              <h3 style={{ fontSize: 14 }}>{subject}</h3>
              <ul style={{ listStyle: 'none', padding: 0, maxHeight: 260, overflowY: 'auto' }}>
                {Object.entries(insights.notQualifiedBySubject[subject] || {}).filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]).map(([centre, count]) => (
                  <li key={centre} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px' }}>
                    <span>{centre}</span>
                    <button type="button" className="btn btn-ghost btn-sm" aria-label={`View ${count} students in ${centre} for ${subject}`} onClick={() => setSelection({ scope, subject, centre })} style={{ color: '#ea580c', textDecoration: 'underline' }}>{count}</button>
                  </li>
                ))}
                {!Object.values(insights.notQualifiedBySubject[subject] || {}).some(count => count > 0) && <li>None</li>}
              </ul>
            </div>
          ))}
          {!subjects.length && <p>No marks data for the selected test.</p>}
        </div>
      )}
      {activeSelection && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setSelection(null)}>
          <div className="card" role="dialog" aria-modal="true" aria-labelledby="centre-low-score-title" onClick={event => event.stopPropagation()} style={{ width: 'min(720px, 95vw)', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <h3 id="centre-low-score-title">{activeSelection.centre} — {activeSelection.subject} — {testKey}</h3>
              <button type="button" className="btn btn-ghost" onClick={() => setSelection(null)}>Close</button>
            </div>
            {rows?.length ? (
              <table className="table"><thead><tr><th>Student name</th><th>Roll number</th><th>Marks</th></tr></thead>
                <tbody>{rows.map(row => <tr key={row.roll}><td><button type="button" className="btn btn-ghost" onClick={() => { setSelection(null); onViewStudent?.(row.roll); }}>{row.name || 'Name unavailable'}</button></td><td>{row.roll}</td><td>{row.marks}</td></tr>)}</tbody>
              </table>
            ) : <p>Student details are unavailable. Please refresh and try again.</p>}
          </div>
        </div>
      )}
    </section>
  );
}
