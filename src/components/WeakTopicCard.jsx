// WeakTopicCard.jsx
// Displays strong/moderate/weak topic pills for one subject.
// Props:
//   subject        — "Physics" | "Chemistry" | "Mathematics"
//   strongTopics   — {topic,ar,acc}[] or string[] (legacy)
//   moderateTopics — same
//   weakTopics     — same
//   isCenter       — boolean: center view vs student view

export default function WeakTopicCard({ subject, strongTopics = [], moderateTopics = [], weakTopics = [], isCenter = false }) {
  const isEmpty = !(Array.isArray(strongTopics) && strongTopics.length) && !(Array.isArray(moderateTopics) && moderateTopics.length) && !(Array.isArray(weakTopics) && weakTopics.length);

  const subjectColor = () => {
    const map = {
      Physics:     { bg: '#e8f0fc', color: '#1a4fa0', border: '#bbd0f8' },
      Chemistry:   { bg: '#fff3e0', color: '#b45309', border: '#fcd5a0' },
      Mathematics: { bg: '#e6f5ed', color: '#1a6e3b', border: '#a8dfc0' },
    };
    return map[subject] || { bg: '#f5f5f5', color: '#333', border: '#ddd' };
  };

  const colors = subjectColor();

  // Build label from topic item (object with {topic,ar,acc} or legacy string)
  const getTopicLabel = (item) => {
    if (!item) return { key: 'unknown', name: 'Unknown', meta: null };
    if (typeof item === 'string') return { key: item, name: item, meta: null };
    const name = item.topic || String(item) || 'Unknown';
    const key  = name;
    // Show AT./AC. if we have them (new format)
    if (item.ar !== undefined && item.acc !== undefined) {
      return { key, name, meta: `AT.-${item.ar}% | AC.-${item.acc}%` };
    }
    // Legacy center format with percentage
    if (item.percentage !== undefined) {
      return { key, name, meta: `${item.percentage}%` };
    }
    return { key, name, meta: null };
  };

  const renderPill = (item, type) => {
    const { key, name, meta } = getTopicLabel(item);

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
      <span key={key} style={pillStyle} title={meta || name}>
        {name}
        {meta && (
          <span style={{
            marginLeft: 5,
            fontSize: 10,
            fontWeight: 500,
            opacity: 0.8,
            whiteSpace: 'nowrap',
          }}>
            ({meta})
          </span>
        )}
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
          {Array.isArray(strongTopics) && strongTopics.length > 0 && (
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
                {(Array.isArray(strongTopics) ? strongTopics : []).map((item) => renderPill(item, 'strong'))}
              </div>
            </div>
          )}

          {/* Moderate */}
          {Array.isArray(moderateTopics) && moderateTopics.length > 0 && (
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
                {(Array.isArray(moderateTopics) ? moderateTopics : []).map((item) => renderPill(item, 'moderate'))}
              </div>
            </div>
          )}

          {/* Weak */}
          {Array.isArray(weakTopics) && weakTopics.length > 0 && (
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
                {(Array.isArray(weakTopics) ? weakTopics : []).map((item) => renderPill(item, 'weak'))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
