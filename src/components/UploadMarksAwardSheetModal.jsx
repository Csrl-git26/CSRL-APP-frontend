import { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { uploadTestSheet, uploadTopicMap, uploadMarksSheet } from '../services/weakTopicApi';

export default function UploadMarksAwardSheetModal({ onClose, testOptions = [] }) {
  const [testId, setTestId] = useState('');
  const [uploadType, setUploadType] = useState('marks'); // 'topic' or 'marks'
  
  // Single upload state
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);

  const disabled = !testId.trim();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setErrorMsg('');
      setValidationErrors([]);
      setWarnings([]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMsg('Please select a file first.');
      return;
    }
    
    setStatus('loading');
    setErrorMsg('');
    setValidationErrors([]);
    setWarnings([]);

    const formData = new FormData();
    formData.append('testId', testId.trim());
    formData.append('file', file);

    try {
      let res;
      if (uploadType === 'topic') {
        res = await uploadTopicMap(formData);
      } else {
        res = await uploadMarksSheet(formData);
      }
      if (res.success) {
        setStatus('success');
        if (res.warnings && res.warnings.length > 0) {
          setWarnings(res.warnings);
        }
      } else {
        setStatus('error');
        setErrorMsg(res.message || 'Upload failed');
        if (res.validationErrors) {
          setValidationErrors(res.validationErrors);
        }
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Network error occurred.');
      if (err.validationErrors) {
        setValidationErrors(err.validationErrors);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 650 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Upload size={16} aria-hidden="true" />
            Upload Test Data (For Weak Topics Analysis)
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        
        <div className="modal-body">
          <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 20 }}>
            Step 1: Upload the Topic Mapping CSV. Step 2: Upload the Marks Awarded CSV. You must upload the Topic Map before the Marks Sheet.
          </div>

          <div style={{ marginBottom: 20, display: 'flex', gap: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
              <input type="radio" name="uploadType" checked={uploadType === 'topic'} onChange={() => { setUploadType('topic'); setFile(null); setStatus('idle'); }} />
              1. Topic Mapping CSV
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
              <input type="radio" name="uploadType" checked={uploadType === 'marks'} onChange={() => { setUploadType('marks'); setFile(null); setStatus('idle'); }} />
              2. Marks Awarded CSV
            </label>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="label" style={{ fontSize: 12, fontWeight: 700 }}>
              Test Name / ID <span style={{ color: '#c0392b' }}>*</span>
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
              list="test-list-options"
              style={{ marginTop: 4, maxWidth: 300 }}
            />
            <datalist id="test-list-options">
              {testOptions.map((opt) => (
                <option key={opt} value={opt} />
              ))}
            </datalist>
          </div>

          {disabled && (
            <div style={{
              padding:      '10px 14px',
              borderRadius: 8,
              background:   '#fff8e1',
              border:       '1px solid #fde68a',
              color:        '#92400e',
              fontSize:     13,
              marginBottom: 16,
              fontWeight:   600,
            }}>
              ⚠️ Please enter a Test Name / ID before uploading a file.
            </div>
          )}

          {/* Upload Box */}
          <div style={{
            border: '2px dashed var(--gray-200)',
            borderRadius: 8,
            padding: 24,
            textAlign: 'center',
            background: 'var(--gray-50)',
            transition: 'all 0.2s',
            opacity: disabled ? 0.5 : 1,
            pointerEvents: disabled ? 'none' : 'auto'
          }}>
            {!file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ padding: 12, background: '#fff', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <FileText size={28} color="var(--gray-400)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--gray-800)' }}>Select Test Sheet CSV</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{uploadType === 'topic' ? 'Format: Question, Topic, Subject' : 'Format: Location, Roll No, Name, Q1, Q2...'}</div>
                </div>
                <label className="button button-outline" style={{ cursor: 'pointer', marginTop: 8 }}>
                  Browse File
                  <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileChange} />
                </label>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ padding: 12, background: '#fff', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <FileText size={28} color="var(--csrl-blue)" />
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-800)', wordBreak: 'break-all' }}>
                  {file.name}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <label className="button button-outline" style={{ cursor: 'pointer', fontSize: 13, padding: '6px 12px' }}>
                    Change File
                    <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileChange} />
                  </label>
                  <button 
                    type="button" 
                    className="button" 
                    style={{ background: 'var(--csrl-blue)', color: '#fff', fontSize: 13, padding: '6px 16px' }}
                    onClick={handleUpload}
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Loader2 size={14} className="spin" /> Uploading...</span>
                    ) : 'Upload & Compute'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Feedback Messages */}
          {status === 'error' && (
            <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: validationErrors.length > 0 ? 8 : 0 }}>
                <AlertTriangle size={16} />
                {errorMsg}
              </div>
              {validationErrors.length > 0 && (
                <ul style={{ paddingLeft: 24, margin: 0 }}>
                  {validationErrors.map((err, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {status === 'success' && (
            <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                <CheckCircle2 size={18} />
                ✅ Weak topics computed successfully for {testId}!
              </div>
              
              {warnings.length > 0 && (
                <div style={{ marginTop: 12, padding: 10, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, color: '#92400e', fontSize: 13 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>⚠️ Note:</div>
                  <ul style={{ paddingLeft: 20, margin: 0 }}>
                    {warnings.map((warn, i) => <li key={i}>{warn}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="button button-outline" onClick={onClose}>
              {status === 'success' ? 'Done' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
