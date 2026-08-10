import re

with open('src/components/StudentProfileView.jsx', 'r') as f:
    content = f.read()

# Add getMaxMarksForSubject to imports
if 'getMaxMarksForSubject' not in content:
    content = content.replace(
        "buildStudentChartData, getStreamConfig, computeWeakSubject }",
        "buildStudentChartData, getStreamConfig, computeWeakSubject, getMaxMarksForSubject }"
    )

with open('src/components/StudentProfileView.jsx', 'w') as f:
    f.write(content)

print("Imports patched.")
