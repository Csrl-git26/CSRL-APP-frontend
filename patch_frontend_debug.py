import re

filepath = 'src/components/StudentProfileView.jsx'
with open(filepath, 'r') as f:
    content = f.read()

target = """    fetchStudentChart(null, profile.ROLL_KEY, null).then((res) => {
      if (!cancelled && res) setChart(res);
    }).catch(() => {});"""

replacement = """    fetchStudentChart(null, profile.ROLL_KEY, null).then((res) => {
      console.log('DEBUG API RESPONSE:', res);
      if (!cancelled && res) setChart(res);
    }).catch(() => {});"""

content = content.replace(target, replacement)

with open(filepath, 'w') as f:
    f.write(content)
print('Frontend Debug Patched')
