with open('src/components/InsightsDashboard.jsx', 'r') as f:
    content = f.read()

old_block = """        {/* Left Column: Top 5 Students */}
        <div style={{ background:'#fff', borderRadius:14, padding:'6px 8px',
          boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e8f0fc' }}>
          <SectionTitle Icon={Trophy} color="#2563eb">Top 5 Students — {selectedTestKey||'Overall'}</SectionTitle>
          {top5.length === 0
            ? <div style={{ color:'#94a3b8', fontSize:13, padding:'20px 0', textAlign:'center' }}>Select a test to see rankings</div>
            : top5.map((s,i) => <RankRow key={s.roll||i} rank={i+1} name={s.name||s.roll||'—'}
                center={s.center||'—'} score={s.marks??s.score} idx={i} roll={s.roll} rawScores={s.rawScores} selectedTest={selectedTestKey} onClick={() => onViewStudent && onViewStudent(s.roll)} />)
          }
        </div>"""

new_block = """        {/* Left Column: Top 5 Students */}
        <div style={{ background:'#fff', borderRadius:14, padding:'6px 8px',
          boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e8f0fc' }}>
          <SectionTitle Icon={Trophy} color="#2563eb">Top 5 Students — {selectedTestKey||'Overall'}</SectionTitle>
          {top5.length === 0
            ? <div style={{ color:'#94a3b8', fontSize:13, padding:'20px 0', textAlign:'center' }}>Select a test to see rankings</div>
            : (() => {
                const chartData = top5.map(s => {
                   let nameSplit = (s.name || s.roll || '—').split(' ');
                   let shortName = nameSplit[0];
                   if (shortName.length < 3 && nameSplit.length > 1) shortName += ' ' + nameSplit[1];
                   
                   let d = { name: shortName, total: s.marks ?? s.score };
                   if (s.rawScores) {
                      ['Physics','Chemistry','Math','Mathematics','Biology','Botany','Zoology'].forEach(sub => {
                          const keys = Object.keys(s.rawScores);
                          let matchedKey = null;
                          if (selectedTestKey && selectedTestKey !== 'Multiple Tests') {
                             matchedKey = keys.find(k => k === `${selectedTestKey}_${sub}` || k === `${selectedTestKey}_${sub.toUpperCase()}` || k === `${selectedTestKey}_${sub.toLowerCase()}`);
                          }
                          if (!matchedKey) {
                             matchedKey = keys.find(k => k === sub || k.toLowerCase().endsWith('_' + sub.toLowerCase()));
                          }
                          if (matchedKey && !isNaN(Number(s.rawScores[matchedKey]))) {
                             d[sub] = Number(s.rawScores[matchedKey]);
                          }
                      });
                   }
                   return d;
                });
                return (
                  <div style={{ height: 155, width: '100%', marginTop: 8 }}>
                    <ResponsiveContainer>
                      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} interval={0} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <Tooltip 
                           contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: 12, fontWeight: 600 }}
                           cursor={{ fill: '#f8fafc' }}
                        />
                        <Bar dataKey="Physics" stackId="a" fill="#3b82f6" />
                        <Bar dataKey="Chemistry" stackId="a" fill="#8b5cf6" />
                        <Bar dataKey="Math" stackId="a" fill="#10b981" />
                        <Bar dataKey="Mathematics" stackId="a" fill="#10b981" />
                        <Bar dataKey="Biology" stackId="a" fill="#ec4899" />
                        <Bar dataKey="Botany" stackId="a" fill="#14b8a6" />
                        <Bar dataKey="Zoology" stackId="a" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()
          }
        </div>"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('src/components/InsightsDashboard.jsx', 'w') as f:
        f.write(content)
    print("Success")
else:
    print("Old block not found!")
