import re

filepath = 'src/components/TestRecordsTable.jsx'
with open(filepath, 'r') as f:
    content = f.read()

target = """    <div className="card">
      <div className="section-title">📋 Complete Test Records</div>
      <div className="table-container">"""

replacement = """    <div className="card">
      <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>📋 Complete Test Records</span>
        {!isCentre && chartData.some(r => r.FALLBACK_DEBUG !== 'RAN') && (
          <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 'normal', background: '#fef2f2', padding: '4px 8px', borderRadius: 4 }}>
            ⚠️ Missing "Marks Awarded" sheet data for some tests
          </span>
        )}
      </div>
      <div className="table-container">"""

content = content.replace(target, replacement)

with open(filepath, 'w') as f:
    f.write(content)
print('UI Debug Patched')
