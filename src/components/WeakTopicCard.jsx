// WeakTopicCard.jsx
// Displays strong/moderate/weak topic pills for one subject.
// Props:
//   subject        — "Physics" | "Chemistry" | "Mathematics"
//   strongTopics   — string[] (student view) or {topic,count,percentage}[] (center view)
//   moderateTopics — same
//   weakTopics     — same
//   isCenter       — boolean: center view vs student view

export default function WeakTopicCard({ subject, strongTopics = [], moderateTopics = [], weakTopics = [], isCenter = false }) {
  const isEmpty = !strongTopics.length && !moderateTopics.length && !weakTopics.length;

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
    const isString = typeof item === 'string';
    let label = item;
    let key = item;
    
    if (!isString) {
      label = isCenter && item.percentage ? `${item.topic} (${item.percentage}%)` : item.topic;
      key = item.topic;
    }

    let pillStyle = {
      display:      'inline-flex',
      alignItems:   'center',
      padding:      '4px 10px',
      borderRadius: 999,
      fontSize:     12,
      fontWeight:   600,
      margin:       '3px 4px 3px 0',
    };

    if (type === 'weak') {
      pillStyle = { ...pillStyle, background: '#fdecea', color: '#c0392b', border: '1px solid #f5a5a5' };
    } else if (type === 'moderate') {
      pillStyle = { ...pillStyle, background: '#fff8e1', color: '#b45309', border: '1px solid #fcd5a0' };
    } else if (type === 'strong') {
      pillStyle = { ...pillStyle, background: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7' };
    }

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
          No topics evaluated
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Strong */}
          {strongTopics.length > 0 && (
            <div>
              <div style={{
                fontSize:     11,
                fontWeight:   700,
                color:        '#2e7d32',
                textTransform:'uppercase',
                letterSpacing:0.5,
                marginBottom: 6,
              }}>
                🟢 Strong
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {strongTopics.map((item) => renderPill(item, 'strong'))}
              </div>
            </div>
          )}

          {/* Moderate */}
          {moderateTopics.length > 0 && (
            <div>
              <div style={{
                fontSize:     11,
                fontWeight:   700,
                color:        '#b45309',
                textTransform:'uppercase',
                letterSpacing:0.5,
                marginBottom: 6,
              }}>
                🟡 Moderate
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {moderateTopics.map((item) => renderPill(item, 'moderate'))}
              </div>
            </div>
          )}

          {/* Weak */}
          {weakTopics.length > 0 && (
            <div>
              <div style={{
                fontSize:     11,
                fontWeight:   700,
                color:        '#c0392b',
                textTransform:'uppercase',
                letterSpacing:0.5,
                marginBottom: 6,
              }}>
                🔴 Weak
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {weakTopics.map((item) => renderPill(item, 'weak'))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
