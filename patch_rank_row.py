with open('src/components/InsightsDashboard.jsx', 'r') as f:
    content = f.read()

old_rank_row = """function RankRow({ rank, name, center, score, idx, roll, rawScores, selectedTest, onClick }) {
  const [fg, bg] = AVATAR_COLORS[0];
  const medals = { 1:'🥇', 2:'🥈', 3:'🥉' };
  
  const subjects = ['Physics', 'Chemistry', 'Math', 'Mathematics', 'Biology', 'Botany', 'Zoology'];
  const subjectScores = [];
  if (rawScores) {
    subjects.forEach(sub => {
      // Find a key in rawScores that matches the subject (e.g. exactly 'Physics' or ends with '_Physics')
      // Prefer the key that starts with the selected test
      const keys = Object.keys(rawScores);
      let matchedKey = null;
      if (selectedTest && selectedTest !== 'Multiple Tests') {
         matchedKey = keys.find(k => k === `${selectedTest}_${sub}` || k === `${selectedTest}_${sub.toUpperCase()}` || k === `${selectedTest}_${sub.toLowerCase()}`);
      }
      if (!matchedKey) {
         matchedKey = keys.find(k => k === sub || k.toLowerCase().endsWith('_' + sub.toLowerCase()));
      }
      
      if (matchedKey && rawScores[matchedKey] !== undefined && rawScores[matchedKey] !== null && rawScores[matchedKey] !== '') {
        let abbr = sub.substring(0, 3);
        if (sub === 'Mathematics') abbr = 'Mat';
        subjectScores.push(`${abbr}: ${rawScores[matchedKey]}`);
      }
    });
  }

  return (
    <div 
      onClick={onClick}
      style={{ display:'flex', alignItems:'center', gap:10, padding:'2px 4px',
      borderRadius:8, background: rank % 2 === 0 ? '#f8fafc' : '#fff',
      marginBottom:2, border:'none', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.15s ease' }}
      onMouseEnter={(e) => { if(onClick) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; } }}
      onMouseLeave={(e) => { if(onClick) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; } }}
    >
      <div style={{ width:16, textAlign:'center', fontSize:10, fontWeight:800, flexShrink:0,
        color: rank <= 3 ? '#f59e0b' : '#94a3b8' }}>{medals[rank] || `${rank}`}</div>
      <div style={{ flex:1, minWidth:0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
        <div style={{ fontSize:10, fontWeight:700, color:'#1e293b', whiteSpace:'nowrap' }}>{name}</div>
        <div style={{ fontSize:8, color:'#64748b', fontWeight:600 }}>{center}</div>
        {subjectScores.length > 0 && (
          <div style={{ fontSize: 8, color: '#64748b', display: 'flex', gap: 4, alignItems: 'center' }}>
            {subjectScores.map((sc, i) => (
              <span key={i} style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 3, fontWeight: 700, border: '1px solid #e2e8f0', color: '#334155' }}>{sc}</span>
            ))}
          </div>
        )}
      </div>
      <div style={{ background:fg+'20', color:fg, fontWeight:800,
        fontSize:10, padding:'2px 6px', borderRadius:20, flexShrink:0 }}>{score}</div>
    </div>
  );
}"""

new_rank_row = """function RankRow({ rank, name, center, score, idx, roll, rawScores, selectedTest, onClick }) {
  const [fg, bg] = AVATAR_COLORS[0];
  const medals = { 1:'🥇', 2:'🥈', 3:'🥉' };
  
  const subjects = ['Physics', 'Chemistry', 'Math', 'Mathematics', 'Biology', 'Botany', 'Zoology'];
  
  const subColors = {
    'Physics': '#3b82f6',     // blue
    'Chemistry': '#8b5cf6',   // purple
    'Math': '#10b981',        // emerald
    'Mathematics': '#10b981', // emerald
    'Biology': '#ec4899',     // pink
    'Botany': '#14b8a6',      // teal
    'Zoology': '#f59e0b'      // amber
  };

  const parsedScores = [];
  let maxPossibleTotal = 0; // typically 300 for JEE, 720 for NEET

  if (rawScores) {
    subjects.forEach(sub => {
      const keys = Object.keys(rawScores);
      let matchedKey = null;
      if (selectedTest && selectedTest !== 'Multiple Tests') {
         matchedKey = keys.find(k => k === `${selectedTest}_${sub}` || k === `${selectedTest}_${sub.toUpperCase()}` || k === `${selectedTest}_${sub.toLowerCase()}`);
      }
      if (!matchedKey) {
         matchedKey = keys.find(k => k === sub || k.toLowerCase().endsWith('_' + sub.toLowerCase()));
      }
      
      if (matchedKey && rawScores[matchedKey] !== undefined && rawScores[matchedKey] !== null && rawScores[matchedKey] !== '') {
        const val = Number(rawScores[matchedKey]);
        if (!isNaN(val)) {
          let abbr = sub.substring(0, 3);
          if (sub === 'Mathematics') abbr = 'Mat';
          parsedScores.push({ abbr, val, color: subColors[sub] || '#94a3b8' });
          maxPossibleTotal += 100; // assuming each subject is out of 100 roughly
        }
      }
    });
  }
  
  // fallback max if no subjects parsed
  if (maxPossibleTotal === 0) maxPossibleTotal = 300;
  
  // if total parsed subjects > 3 (like NEET), it might be 720. Let's just use sum of subjects max.
  // Actually, standard is: total max = Math.max(300, maxPossibleTotal)
  const maxBarVal = Math.max(score || 0, maxPossibleTotal);

  return (
    <div 
      onClick={onClick}
      style={{ display:'flex', alignItems:'center', gap:10, padding:'2px 4px',
      borderRadius:8, background: rank % 2 === 0 ? '#f8fafc' : '#fff',
      marginBottom:2, border:'none', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.15s ease' }}
      onMouseEnter={(e) => { if(onClick) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; } }}
      onMouseLeave={(e) => { if(onClick) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; } }}
    >
      <div style={{ width:16, textAlign:'center', fontSize:10, fontWeight:800, flexShrink:0,
        color: rank <= 3 ? '#f59e0b' : '#94a3b8' }}>{medals[rank] || `${rank}`}</div>
      <div style={{ flex:1, minWidth:0, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ fontSize:10, fontWeight:700, color:'#1e293b', whiteSpace:'nowrap', flexShrink:0 }}>{name}</div>
        <div style={{ fontSize:8, color:'#64748b', fontWeight:600, flexShrink:0, marginRight: 'auto' }}>{center}</div>
        
        {parsedScores.length > 0 && (
          <div style={{ 
            flexShrink: 0, 
            width: '100px', 
            height: '14px', 
            background: '#f1f5f9', 
            borderRadius: '4px', 
            display: 'flex', 
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            marginLeft: '8px'
          }}>
            {parsedScores.map((sc, i) => {
              const widthPct = Math.max(0, Math.min(100, (sc.val / maxBarVal) * 100));
              return (
                <div 
                  key={i} 
                  title={`${sc.abbr}: ${sc.val}`}
                  style={{ 
                    height: '100%', 
                    width: `${widthPct}%`, 
                    background: sc.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: i < parsedScores.length - 1 ? '1px solid rgba(255,255,255,0.3)' : 'none',
                  }}
                >
                  {widthPct > 15 && <span style={{fontSize: 7, color: '#fff', fontWeight: 800, letterSpacing: '-0.2px'}}>{sc.val}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ background:fg+'20', color:fg, fontWeight:800,
        fontSize:10, padding:'2px 6px', borderRadius:20, flexShrink:0, minWidth: 32, textAlign: 'center' }}>{score}</div>
    </div>
  );
}"""

content = content.replace(old_rank_row, new_rank_row)

with open('src/components/InsightsDashboard.jsx', 'w') as f:
    f.write(content)
