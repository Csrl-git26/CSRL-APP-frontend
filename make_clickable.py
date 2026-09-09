import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update chartData object to include studentId
old_data = "let d = { name: label, total: s.marks ?? s.score, Physics: 0, Chemistry: 0, Math: 0, Mathematics: 0, Biology: 0, Botany: 0, Zoology: 0 };"
new_data = "let d = { studentId: s.roll || s.id, name: label, total: s.marks ?? s.score, Physics: 0, Chemistry: 0, Math: 0, Mathematics: 0, Biology: 0, Botany: 0, Zoology: 0 };"
content = content.replace(old_data, new_data)

# 2. Update BarChart to be clickable
old_barchart = '<BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 5, bottom: 5 }} stackOffset="sign">'
new_barchart = """<BarChart 
                        data={chartData} 
                        layout="vertical" 
                        margin={{ top: 10, right: 20, left: 5, bottom: 5 }} 
                        stackOffset="sign"
                        onClick={(e) => {
                          if (e && e.activePayload && e.activePayload.length > 0 && e.activePayload[0].payload.studentId) {
                            if (onViewStudent) onViewStudent(e.activePayload[0].payload.studentId);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >"""
content = content.replace(old_barchart, new_barchart)

with open(file_path, 'w') as f:
    f.write(content)

