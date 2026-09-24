import { useExamScope } from '../context/ExamScopeContext';
const style = { border: '1px solid #bac9df', borderRadius: 8, padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#173d75', background: '#fff' };
export function BranchSelector({ stream, light = false }) {
  const scope = useExamScope();
  if (String(stream || scope.stream).trim().toUpperCase() !== 'JEE') return null;
  return <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: light ? '#fff' : '#173d75' }}>Branch:
    <select aria-label="Branch" style={style} value={scope.branch} onChange={e => scope.setBranch(e.target.value)}>
      <option value="MAIN">Main</option><option value="ADVANCED">Advanced</option>
    </select>
  </label>;
}
export function UploadScopeSelectors({ stream, branch, onStreamChange, onBranchChange, disabled = false }) {
  return <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
    <label>Stream: <select aria-label="Upload stream" style={style} value={stream} disabled={disabled} onChange={e => onStreamChange(e.target.value)}><option value="JEE">JEE</option><option value="NEET">NEET</option></select></label>
    {stream === 'JEE' && <label>Branch: <select aria-label="Upload branch" style={style} value={branch} disabled={disabled} onChange={e => onBranchChange(e.target.value)}><option value="MAIN">Main</option><option value="ADVANCED">Advanced</option></select></label>}
  </div>;
}

export function ProfileBranchSelector({ stream }) {
  const scope = useExamScope();
  if (String(stream || scope.stream).trim().toUpperCase() !== 'JEE') return null;
  return <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
    <div>
      <div className="section-title" style={{ marginBottom: 4 }}>JEE Test Performance</div>
      <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>Choose Main or Advanced to view this student's test records, charts and topic analysis.</div>
    </div>
    <BranchSelector stream={stream} />
  </div>;
}
