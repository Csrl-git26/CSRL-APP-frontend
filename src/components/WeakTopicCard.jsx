// WeakTopicCard.jsx
// Displays strong/weak topic pills for one subject.
// Props:
//   subject    — "Physics" | "Chemistry" | "Mathematics"
//   strongWeak — string[] (student view) or {topic,count,percentage}[] (center view)
//   mediumWeak — same
//   isCenter   — boolean: center view vs student view

export default function WeakTopicCard({ subject, strongWeak = [], mediumWeak = [], isCenter = false }) {
  const isEmpty = !strongWeak.length && !mediumWeak.length;

  const subjectColor = () => {
    const map = {
      Physics:     { bg: '#e8f0fc', color: '#1a4fa0', border: '#bbd0f8' },
      Chemistry:   { bg: '#fff3e0', color: '#b45309', border: '#fcd5a0' },
      Mathematics: { bg: '#e6f5ed', color: '#1a6e3b', border: '#a8dfc0' },
    };
    return map[subject] || { bg: '#f5f5f5', color: '#333', border: '#ddd' };
  };

  const colors = subjectColor();

  const renderPill = (item, type) => {
    const label = isCenter
      ? `${item.topic} (${item.percentage}%)`
      : item;
    const key   = isCenter ? item.topic : item;

    const pillStyle = type === 'strong'
      ? {
          display:      'inline-flex',
          alignItems:   'center',
          padding:      '4px 10px',
          borderRadius: 999,
          fontSize:     12,
          fontWeight:   600,
          background:   '#fdecea',
          color:        '#c0392b',
          border:       '1px solid #f5a5a5',
          margin:       '3px 4px 3px 0',
        }
      : {
          display:      'inline-flex',
          alignItems:   'center',
          padding:      '4px 10px',
          borderRadius: 999,
          fontSize:     12,
          fontWeight:   600,
          background:   '#fff8e1',
          color:        '#b45309',
          border:       '1px solid #fcd5a0',
          margin:       '3px 4px 3px 0',
        };

    return (
      <span key={key} style={pillStyle}>
        {label}
      </span>
    );
  };

  return (
    <div style={{
      border:       `1px solid ${colors.border}`,
      borderRadius: 10,
      padding:      '14px 16px',
      background:   '#fff',
    }}>
      {/* Subject heading */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        gap:            8,
        marginBottom:   10,
        paddingBottom:  8,
        borderBottom:   `2px solid ${colors.border}`,
      }}>
        <div style={{
          width:        10,
          height:       10,
          borderRadius: '50%',
          background:   colors.color,
          flexShrink:   0,
        }} />
        <span style={{ fontWeight: 700, fontSize: 14, color: colors.color }}>
          {subject}
        </span>
      </div>

      {isEmpty ? (
        <p style={{ color: 'var(--gray-400)', fontSize: 13, margin: 0 }}>
          No weak topics
        </p>
      ) : (
        <>
          {/* Strong Weak */}
          {strongWeak.length > 0 && (
            <div style={{ marginBottom: mediumWeak.length ? 10 : 0 }}>
              <div style={{
                fontSize:     11,
                fontWeight:   700,
                color:        '#c0392b',
                textTransform:'uppercase',
                letterSpacing:0.5,
                marginBottom: 6,
              }}>
                🔴 Weakest
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {strongWeak.map((item) => renderPill(item, 'strong'))}
              </div>
            </div>
          )}

          {/* Medium Weak */}
          {mediumWeak.length > 0 && (
            <div>
              <div style={{
                fontSize:     11,
                fontWeight:   700,
                color:        '#b45309',
                textTransform:'uppercase',
                letterSpacing:0.5,
                marginBottom: 6,
              }}>
                🟡 Weak
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {mediumWeak.map((item) => renderPill(item, 'medium'))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
