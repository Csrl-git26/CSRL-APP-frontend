with open('src/components/InsightsDashboard.jsx', 'r') as f:
    content = f.read()

old_render = """                const renderCard = (c) => {
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
                };"""

new_render = """                const renderCard = (c) => {
                  const isAlert = c.avg < 100 || (c.qualRate??0) < 80;
                  const medals = {1:'🥇',2:'🥈',3:'🥉'};
                  const rankDisplay = medals[c.rank] || `${c.rank}`;
                  
                  // Gauge chart calculations
                  const score = Math.round(c.avg);
                  const maxScore = 300; // standard JEE max, adjust if needed
                  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
                  const strokeWidth = 10;
                  const radius = 40;
                  const circumference = Math.PI * radius;
                  const dashoffset = circumference - (percentage / 100) * circumference;
                  
                  // Vibrant colors
                  const color = isAlert ? '#f97316' : '#2563eb'; // Orange if alert, Blue otherwise
                  const bg = '#e2e8f080';

                  return (
                    <div key={c.code} style={{ padding:'8px 4px 6px 4px', borderRadius:10, textAlign:'center',
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      cursor: onViewCentre ? 'pointer' : 'default',
                      display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                      onClick={() => onViewCentre && onViewCentre(c.code)}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.06)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
                    >
                      <div style={{ position: 'relative', width: '100%', maxWidth: '60px', aspectRatio: '2/1', marginBottom: '8px' }}>
                        <svg viewBox="0 0 100 50" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                          {/* Background Arc */}
                          <path
                            d={`M 10 45 A ${radius} ${radius} 0 0 1 90 45`}
                            fill="none"
                            stroke={bg}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                          />
                          {/* Value Arc (with glow filter) */}
                          <defs>
                            <filter id={`glow-${c.code}`} x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="3" result="blur" />
                              <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                          </defs>
                          <path
                            d={`M 10 45 A ${radius} ${radius} 0 0 1 90 45`}
                            fill="none"
                            stroke={color}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashoffset}
                            filter={`url(#glow-${c.code})`}
                            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                          />
                        </svg>
                        <div style={{ position: 'absolute', bottom: '-4px', left: 0, width: '100%', textAlign: 'center', fontSize: '13px', fontWeight: 800, color: color, letterSpacing: '-0.5px' }}>
                          {score}
                        </div>
                      </div>
                      
                      <div style={{ fontSize:9, fontWeight:800, color: color, letterSpacing: '0.2px', textTransform: 'uppercase', marginBottom: '2px' }}>
                        {isAlert ? 'AT RISK' : 'ON TRACK'}
                      </div>
                      <div style={{ fontSize:8, fontWeight:600, color: '#64748b', display: 'flex', alignItems: 'center', gap: 2 }}>
                        {medals[c.rank] && <span style={{fontSize:9}}>{medals[c.rank]}</span>} {c.code}
                      </div>
                    </div>
                  );
                };"""

new_content = content.replace(old_render, new_render)
with open('src/components/InsightsDashboard.jsx', 'w') as f:
    f.write(new_content)
