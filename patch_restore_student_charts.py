file_path = "/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx"

with open(file_path, "r") as f:
    content = f.read()

bad_grid = """      {/* ── Second Row: Subject & Student Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, marginTop: 20 }}>
        <SubjectTopCentres key={selectedTestKey} centreBoard={centreBoard} onViewCentre={onViewCentre} />
      </div>"""

good_grid = """      {/* ── Second Row: Subject & Student Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 20, marginTop: 20 }}>
        <SubjectTopCentres key={selectedTestKey} centreBoard={centreBoard} onViewCentre={onViewCentre} />
        <SubjectTopStudents key={selectedTestKey} subjectTopStudents={testInsights?.subjectTopStudents} onViewStudent={onViewStudent} />
        {renderStudentChart(top5, 'Top 5 Stud', Trophy, '#2563eb', true)}
        {renderStudentChart(bottom5, 'Bottom 5 Stud', Star, '#2563eb', false)}
      </div>"""

if bad_grid in content:
    content = content.replace(bad_grid, good_grid)
    with open(file_path, "w") as f:
        f.write(content)
    print("Student charts restored successfully.")
else:
    print("Bad grid not found.")
