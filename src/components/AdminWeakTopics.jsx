// AdminWeakTopics.jsx
// Admin panel for uploading topic maps and marks CSVs,
// and viewing center weak topics.
//
import { useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import CenterWeakTopics from './CenterWeakTopics';
import { clearWeakTopicsApi, recomputeAllTopicsApi } from '../services/weakTopicApi';

export default function AdminWeakTopics({ centersList = [], selectedTestKey, stream = 'JEE' }) {
  const [viewCenterId, setViewCenterId] = useState('');
  const [clearing, setClearing] = useState(false);
  const [recomputing, setRecomputing] = useState(false);
  const [recomputeMsg, setRecomputeMsg] = useState('');

  // Drop 'ALL' from centers list if it exists
  const validCenters = centersList.filter(c => c !== 'ALL');

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear ALL computed weak topics data? This will reset the weak topics dashboard for all centers and students.')) return;
    setClearing(true);
    try {
      await clearWeakTopicsApi();
      alert('All weak topics data cleared successfully. Please refresh the page.');
      window.location.reload();
    } catch (e) {
      alert('Failed to clear data: ' + e.message);
    } finally {
      setClearing(false);
    }
  };

  const handleRecompute = async () => {
    if (!window.confirm('This will recompute AT. (Attempt Rate) and AC. (Accuracy) for all tests and overall data. It may take 1-2 minutes. Continue?')) return;
    setRecomputing(true);
    setRecomputeMsg('');
    try {
      const result = await recomputeAllTopicsApi();
      const msg = `Done! ${result.step1?.message || ''} ${result.step2?.message || ''}`.trim();
      setRecomputeMsg(msg);
      alert('Recomputation complete! Refresh the page to see updated AT./AC. values.');
      window.location.reload();
    } catch (e) {
      setRecomputeMsg('Error: ' + e.message);
      alert('Recomputation failed: ' + e.message);
    } finally {
      setRecomputing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── SECTION: Clear Data ─────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: '8px', borderRadius: 8, background: '#fdecea', flexShrink: 0 }}>
              <Trash2 size={18} color="#c0392b" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Reset Weak Topics Data</div>
              <div style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 2 }}>
                Clear all computed weak topics if you deleted a test and need to start fresh.
              </div>
            </div>
          </div>
          <button 
            className="btn btn-outline" 
            style={{ color: '#c0392b', borderColor: '#c0392b' }}
            onClick={handleClear}
            disabled={clearing}
          >
            {clearing ? 'Clearing...' : 'Clear All Data'}
          </button>
        </div>
      </div>

      {/* ── SECTION: Recompute AT./AC. ─────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: '8px', borderRadius: 8, background: '#e8f0fc', flexShrink: 0 }}>
              <span style={{ fontSize: 18 }}>📊</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Recompute AT./AC. Values</div>
              <div style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 2 }}>
                Recalculates Attempt Rate and Accuracy for all tests and overall data.
                {recomputeMsg && <span style={{ marginLeft: 8, color: 'var(--csrl-blue)', fontWeight: 600 }}>{recomputeMsg}</span>}
              </div>
            </div>
          </div>
          <button
            className="btn btn-outline"
            style={{ color: '#1a4fa0', borderColor: '#1a4fa0' }}
            onClick={handleRecompute}
            disabled={recomputing}
          >
            {recomputing ? 'Recomputing...' : 'Recompute Now'}
          </button>
        </div>
      </div>

      {/* ── SECTION: View Center Weak Topics ─────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ padding: '8px', borderRadius: 8, background: '#fdecea', flexShrink: 0 }}>
            <Eye size={18} color="#c0392b" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>View Center Weak Topics</div>
            <div style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 2 }}>
              View computed weak topic analysis for any center
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="label" style={{ fontSize: 12, fontWeight: 700 }}>
            Center
          </label>
          <select
            className="input select"
            value={viewCenterId}
            onChange={(e) => setViewCenterId(e.target.value)}
            style={{ marginTop: 4, maxWidth: 240 }}
          >
            <option value="">-- Select Center --</option>
            {validCenters.map(c => {
              let display = c;
              const normalized = String(c).trim().toUpperCase();
              if (normalized === 'GAIL') display = 'KNP';
              if (normalized === 'OIL_INDIA') display = 'JDH';
              return <option key={c} value={c}>{display}</option>;
            })}
          </select>
        </div>

        {viewCenterId ? (
          <CenterWeakTopics centerId={viewCenterId} activeTestKey={selectedTestKey} stream={stream} />
        ) : (
          <div style={{
            padding:      24,
            textAlign:    'center',
            color:        'var(--gray-400)',
            fontSize:     13,
            borderRadius: 8,
            background:   'var(--gray-50)',
            border:       '1px dashed var(--gray-200)',
          }}>
            Select a center above to view its weak topic analysis.
          </div>
        )}
      </div>
    </div>
  );
}
