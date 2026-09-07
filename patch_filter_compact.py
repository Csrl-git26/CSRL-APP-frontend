with open('src/components/AdminDashboard.jsx', 'r') as f:
    content = f.read()

old = """        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Test:</span>
              <MultiSelectDropdown 
                options={allTestOptions.filter(o => o !== 'ALL_FMT')} 
                selectedOptions={selectedLeaderboardTestKeys} 
                onChange={setSelectedLeaderboardTestKeys} 
              />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Sort By Subject:</span>
              <select className="input select" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} style={{ width: 140, fontSize: 13 }}>
                <option value="Total">Total Average</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Math">Math</option>
                <option value="Qualification">Qualification Rate</option>
              </select>
            </div>
          </div>
        </div>"""

new = """        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
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

content = content.replace(old, new)
with open('src/components/AdminDashboard.jsx', 'w') as f:
    f.write(content)
