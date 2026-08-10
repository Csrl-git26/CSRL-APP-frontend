import re

with open('src/components/StudentProfileView.jsx', 'r') as f:
    content = f.read()

# Add computeWeakSubject to imports
if 'computeWeakSubject' not in content:
    content = content.replace(
        "buildStudentChartData, getStreamConfig }",
        "buildStudentChartData, getStreamConfig, computeWeakSubject }"
    )

# Insert weakSubject definition
weak_sub_code = """
  const weakSubject = React.useMemo(
    () => chart?.weakSubject ?? computeWeakSubject(studentTests, testColumns),
    [chart, studentTests, testColumns]
  );
"""

if 'const weakSubject =' not in content:
    content = content.replace(
        "const mappedTestList = chartData;",
        "const mappedTestList = chartData;\n" + weak_sub_code
    )

with open('src/components/StudentProfileView.jsx', 'w') as f:
    f.write(content)

print("Weak subject patched.")
