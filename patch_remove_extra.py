file_path = "/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx"

with open(file_path, "r") as f:
    content = f.read()

old_grid = """      {/* ── Second Row: Subject & Student Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 20, marginTop: 20 }}>
        <SubjectTopCentres key={selectedTestKey} centreBoard={centreBoard} onViewCentre={onViewCentre} />
        <SubjectTopStudents key={selectedTestKey} subjectTopStudents={testInsights?.subjectTopStudents} onViewStudent={onViewStudent} />
        {renderStudentChart(top5, 'Top 5 Stud', Trophy, '#2563eb', true)}
        {renderStudentChart(bottom5, 'Bottom 5 Stud', Star, '#2563eb', false)}
      </div>"""

new_grid = """      {/* ── Second Row: Subject & Student Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, marginTop: 20 }}>
        <SubjectTopCentres key={selectedTestKey} centreBoard={centreBoard} onViewCentre={onViewCentre} />
      </div>"""

if old_grid in content:
    content = content.replace(old_grid, new_grid)
    with open(file_path, "w") as f:
        f.write(content)
    print("Removed extra cards successfully.")
else:
    print("Could not find the target code block.")
