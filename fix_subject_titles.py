import os

files_to_check = {
    'SubjectTopCentres': '/Users/surya/Desktop/CSRL-APP-frontend/src/components/SubjectTopCentres.jsx',
    'SubjectTopStudents': '/Users/surya/Desktop/CSRL-APP-frontend/src/components/SubjectTopStudents.jsx',
}

old_title = "<div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: '#2563eb', letterSpacing: '-0.3px', borderBottom: '2px solid #2563eb20', paddingBottom: 4, marginBottom: 12 }}>\n        <Activity size={16} aria-hidden=\"true\" />"

new_title = "<div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', borderBottom: '1px solid #f1f5f9', paddingBottom: 6, marginBottom: 14 }}>\n        <Activity size={18} color=\"#3b82f6\" aria-hidden=\"true\" />"

for name, path in files_to_check.items():
    if os.path.exists(path):
        with open(path, 'r') as f:
            content = f.read()
        
        content = content.replace(old_title, new_title)
        
        with open(path, 'w') as f:
            f.write(content)

