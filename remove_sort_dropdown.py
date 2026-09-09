import sys

filepath = 'src/components/AdminDashboard.jsx'
with open(filepath, 'r') as f:
    content = f.read()

block1 = """            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--gray-600)', fontWeight: 600 }}>Sort:</span>
              <select className="input select" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} style={{ width: 110, fontSize: 11, padding: '3px 6px' }}>
                <option value="Total">Total Avg</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Math">Math</option>
                <option value="Qualification">Qual. Rate</option>
              </select>
            </div>"""

block2 = """                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--gray-600)', fontWeight: 600 }}>Sort:</span>
                  <select className="input select" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} style={{ width: 110, fontSize: 11, padding: '3px 6px' }}>
                    <option value="Total">Total Avg</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Math">Math</option>
                    <option value="Qualification">Qual. Rate</option>
                  </select>
                </div>"""

content = content.replace(block1, "")
content = content.replace(block2, "")

with open(filepath, 'w') as f:
    f.write(content)
