import os

# Update InsightsDashboard.jsx
file_path_1 = 'src/components/InsightsDashboard.jsx'
with open(file_path_1, 'r') as f:
    content_1 = f.read()

old_section_title = """function SectionTitle({ Icon, children, color = '#3b82f6' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10,
      fontSize:15, fontWeight:800, color: '#0f172a', letterSpacing:0.2, whiteSpace: 'nowrap' }}>
      <Icon size={18} color={color} />{children}
    </div>
  );
}"""

new_section_title = """function SectionTitle({ Icon, children, color = '#3b82f6' }) {
  return (
    <div style={{ position: 'relative', paddingBottom: 8, marginBottom: 14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, 
        fontSize:15, fontWeight:800, color: '#0f172a', letterSpacing:0.2, whiteSpace: 'nowrap' }}>
        <Icon size={18} color={color} />{children}
      </div>
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 2,
        background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.5), transparent)',
        boxShadow: '0 1px 3px rgba(59, 130, 246, 0.3)'
      }} />
    </div>
  );
}"""

content_1 = content_1.replace(old_section_title, new_section_title)
with open(file_path_1, 'w') as f:
    f.write(content_1)


# Update SubjectTopCentres.jsx
file_path_2 = 'src/components/SubjectTopCentres.jsx'
with open(file_path_2, 'r') as f:
    content_2 = f.read()

old_sub_title_1 = """<div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', borderBottom: '1px solid #f1f5f9', paddingBottom: 6, marginBottom: 14 }}>
        <Activity size={18} color="#3b82f6" aria-hidden="true" />
        Subject Top 3 CNT
      </div>"""

new_sub_title_1 = """<div style={{ position: 'relative', paddingBottom: 8, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
          <Activity size={18} color="#3b82f6" aria-hidden="true" />
          Subject Top 3 CNT
        </div>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, width: '100%', height: 2,
          background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.5), transparent)',
          boxShadow: '0 1px 3px rgba(59, 130, 246, 0.3)'
        }} />
      </div>"""

content_2 = content_2.replace(old_sub_title_1, new_sub_title_1)
with open(file_path_2, 'w') as f:
    f.write(content_2)


# Update SubjectTopStudents.jsx
file_path_3 = 'src/components/SubjectTopStudents.jsx'
with open(file_path_3, 'r') as f:
    content_3 = f.read()

old_sub_title_2 = """<div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', borderBottom: '1px solid #f1f5f9', paddingBottom: 6, marginBottom: 14 }}>
        <Activity size={18} color="#3b82f6" aria-hidden="true" />
        Subject Top 3 Students
      </div>"""

new_sub_title_2 = """<div style={{ position: 'relative', paddingBottom: 8, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
          <Activity size={18} color="#3b82f6" aria-hidden="true" />
          Subject Top 3 Students
        </div>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, width: '100%', height: 2,
          background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.5), transparent)',
          boxShadow: '0 1px 3px rgba(59, 130, 246, 0.3)'
        }} />
      </div>"""

content_3 = content_3.replace(old_sub_title_2, new_sub_title_2)
with open(file_path_3, 'w') as f:
    f.write(content_3)

