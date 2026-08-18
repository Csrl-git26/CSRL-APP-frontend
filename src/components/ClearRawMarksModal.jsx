import React, { useState } from 'react';
import { Trash2, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { clearRawMarksApi } from '../services/weakTopicApi';

export default function ClearRawMarksModal({ onClose, testOptions = [] }) {
  const [testId, setTestId] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('');

  const handleClear = async () => {
    if (!testId.trim()) {
      setErrorMsg('Please enter a Test Name / ID.');
      setStatus('error');
      return;
    }

    if (!window.confirm(`Are you sure you want to completely remove the Marks Awarded and Weak Topics data for test "${testId.trim()}"?\n\nNote: This does NOT delete the flat Test Scores (Total, Physics, Chemistry, Math marks) imported via the other sheet.`)) {
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await clearRawMarksApi(testId.trim());
      if (res.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(res.message || 'Failed to clear data.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Network error occurred.');
    }
  };

  const disabled = testId.trim() === '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#991b1b' }}>
            <Trash2 size={18} aria-hidden="true" />
            Clear Marks Awarded Sheet Data
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        
        <div className="modal-body">
          <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 20, lineHeight: 1.5 }}>
            This action will permanently delete the uploaded <strong>Marks Awarded Sheet</strong> (raw question-by-question marks) and the <strong>Topic Mappings</strong> for the specified test. It will also erase computed weak topics.
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="label" style={{ fontSize: 12, fontWeight: 700 }}>
              Test Name / ID to Clear <span style={{ color: '#c0392b' }}>*</span>
            </label>
            <input
              className="input"
              type="text"
              placeholder="e.g. CAT-1(TEST)"
              value={testId}
              onChange={(e) => {
                setTestId(e.target.value);
                setStatus('idle');
              }}
              list="test-list-options-clear"
              style={{ marginTop: 4, width: '100%' }}
            />
            <datalist id="test-list-options-clear">
              {testOptions.map((opt) => (
                <option key={opt} value={opt} />
              ))}
            </datalist>
          </div>

          {/* Feedback Messages */}
          {status === 'error' && (
            <div style={{ marginTop: 16, marginBottom: 16, padding: 14, borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                <AlertTriangle size={16} />
                {errorMsg}
              </div>
            </div>
          )}

          {status === 'success' && (
            <div style={{ marginTop: 16, marginBottom: 16, padding: 14, borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                <CheckCircle2 size={18} />
                ✅ Data cleared successfully for {testId.trim()}!
              </div>
            </div>
          )}
          
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="button button-outline" onClick={onClose} disabled={status === 'loading'}>
              {status === 'success' ? 'Done' : 'Cancel'}
            </button>
            {status !== 'success' && (
              <button 
                type="button" 
                className="button" 
                style={{ background: '#dc2626', color: '#fff', padding: '6px 16px' }}
                onClick={handleClear}
                disabled={status === 'loading' || disabled}
              >
                {status === 'loading' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Loader2 size={14} className="spin" /> Clearing...</span>
                ) : 'Clear Data'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
