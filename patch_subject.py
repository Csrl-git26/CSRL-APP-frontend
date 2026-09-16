import re

with open('/Users/surya/Desktop/CSRL-APP-frontend/src/components/SubjectTopStudents.jsx', 'r') as f:
    content = f.read()

old_code = """  if (payload && payload.subject) {
    if (payload.subject === 'PHY') barFill = '#3b82f6';
    else if (payload.subject === 'CHEM') barFill = '#8b5cf6';
    else if (payload.subject === 'MATH') barFill = '#0ea5e9';
  }"""

new_code = """  if (payload && payload.subject) {
    if (payload.subject === 'PHY') barFill = '#3b82f6';
    else if (payload.subject === 'CHEM') barFill = '#8b5cf6';
    else if (payload.subject === 'MATH') barFill = '#0ea5e9';
    else if (payload.subject === 'BIO') barFill = '#10b981';
    else if (payload.subject === 'BOT') barFill = '#fbbf24';
    else if (payload.subject === 'ZOO') barFill = '#34d399';
  }"""

if old_code in content:
    content = content.replace(old_code, new_code)
    with open('/Users/surya/Desktop/CSRL-APP-frontend/src/components/SubjectTopStudents.jsx', 'w') as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Old code not found")
