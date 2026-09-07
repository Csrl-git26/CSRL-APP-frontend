with open('src/components/InsightsDashboard.jsx', 'r') as f:
    content = f.read()

top_students_block = """        {/* Left Column: Top 5 Students */}
        <div style={{ background:'#fff', borderRadius:14, padding:'6px 8px',
          boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e8f0fc' }}>
          <SectionTitle Icon={Trophy} color="#2563eb">Top 5 Students — {selectedTestKey||'Overall'}</SectionTitle>
          {top5.length === 0
            ? <div style={{ color:'#94a3b8', fontSize:13, padding:'20px 0', textAlign:'center' }}>Select a test to see rankings</div>
            : top5.map((s,i) => <RankRow key={s.roll||i} rank={i+1} name={s.name||s.roll||'—'}
                center={s.center||'—'} score={s.marks??s.score} idx={i} roll={s.roll} rawScores={s.rawScores} selectedTest={selectedTestKey} onClick={() => onViewStudent && onViewStudent(s.roll)} />)
          }
        </div>"""

centres_block = """      {/* Stacked Top 10 Centres ── */}
      {centreBoard.length > 0 && (() => {
        const sorted = [...centreBoard].sort((a,b) => (b.avg||0)-(a.avg||0));
        return (
            <div style={{ background:'#fff', borderRadius:14, padding:'6px 8px',
              boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e2e8f0' }}>
              
              {(() => {
                const topCentres = sorted.slice(0,5).map((c,i) => ({...c, rank: i+1}));
                const bottomCentres = sorted.length > 5 ? sorted.slice(-5).map((c,i) => ({...c, rank: sorted.length - 5 + i + 1})) : [];
                
                const renderCard = (c) => {
                  const isAlert = c.avg < 100 || (c.qualRate??0) < 80;
                  const medals = {1:'🥇',2:'🥈',3:'🥉'};
                  const rankDisplay = medals[c.rank] || `${c.rank}`;
                  return (
                    <div key={c.code} style={{ padding:'1px 1px', borderRadius:8, textAlign:'center',
                      background: isAlert ? '#fef2f2' : '#f8fafc',
                      border: isAlert ? '1px solid #fecaca' : '1px solid #e2e8f0',
                      cursor: onViewCentre ? 'pointer' : 'default' }}
                      onClick={() => onViewCentre && onViewCentre(c.code)}>
                      <div style={{ fontSize:8, display:'flex', justifyContent:'center', alignItems:'center', gap: 4 }}>
                        {rankDisplay} <span style={{ fontWeight:800, color:'#1e293b' }}>{c.code}</span>
                      </div>
                      <div style={{ fontSize:10, fontWeight:900, color: isAlert?'#dc2626':'#1a4fa0', marginTop:0 }}>
                        {Math.round(c.avg)}
                      </div>

                    </div>
                  );
                };

                return (
                  <>
                    <SectionTitle Icon={Star} color="#2563eb">Top 5 Centres by Average Score</SectionTitle>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:3, marginBottom: bottomCentres.length > 0 ? 6 : 0 }}>
                      {topCentres.map(renderCard)}
                    </div>
                    
                    {bottomCentres.length > 0 && (
                      <>
                        <SectionTitle Icon={Star} color="#2563eb">Bottom 5 Centres</SectionTitle>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:3 }}>
                          {bottomCentres.map(renderCard)}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          );
        })()}"""

original = top_students_block + "\n\n" + centres_block
swapped = centres_block + "\n\n" + top_students_block

content = content.replace(original, swapped)

with open('src/components/InsightsDashboard.jsx', 'w') as f:
    f.write(content)
