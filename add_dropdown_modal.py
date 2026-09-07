with open('src/components/AdminDashboard.jsx', 'r') as f:
    content = f.read()

target_content = """            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 800, color: '#2563eb', letterSpacing: '-0.3px', borderBottom: '2px solid #2563eb20', paddingBottom: 4, margin: '0 0 10px 0' }}>
                  <Trophy size={18} aria-hidden="true" />Centre Rankings — {selectedLeaderboardTestKeys.length > 1 ? 'Multiple Tests' : (selectedLeaderboardTestKeys[0] || selectedTestKey)}
                </div>
              </div>
            </div>"""

replacement_content = """            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 800, color: '#2563eb', letterSpacing: '-0.3px', borderBottom: '2px solid #2563eb20', paddingBottom: 4, margin: '0 0 10px 0' }}>
                  <Trophy size={18} aria-hidden="true" />Centre Rankings — {selectedLeaderboardTestKeys.length > 1 ? 'Multiple Tests' : (selectedLeaderboardTestKeys[0] || selectedTestKey)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--gray-600)', fontWeight: 600 }}>Test:</span>
                  <MultiSelectDropdown 
                    options={allTestOptions.filter(o => o !== 'ALL_FMT')} 
                    selectedOptions={selectedLeaderboardTestKeys} 
                    onChange={setSelectedLeaderboardTestKeys} 
                  />
                </div>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--gray-600)', fontWeight: 600 }}>Sort:</span>
                  <select className="input select" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} style={{ width: 110, fontSize: 11, padding: '3px 6px' }}>
                    <option value="Total">Total Avg</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Math">Math</option>
                    <option value="Qualification">Qual. Rate</option>
                  </select>
                </div>
              </div>
            </div>"""

# Need to only replace the one inside the modal...
# But this block only exists once now, because we didn't duplicate the grid, we just moved it!
# Wait, did I duplicate the grid or move it? Let's check `AdminDashboard.jsx`.

content = content.replace(target_content, replacement_content)

with open('src/components/AdminDashboard.jsx', 'w') as f:
    f.write(content)
