import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# The incorrect block placed outside the grid
old_block = """      </div> {/* End Main Dashboard Layout */}

      {/* Subject Top 3 Centres */}
      <SubjectTopCentres centreBoard={centreBoard} onViewCentre={onViewCentre} />
      
      {/* Subject Top 3 Students & Top/Bottom 5 Students Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Subject Top 3 Students */}
        <SubjectTopStudents subjectTopStudents={testInsights?.subjectTopStudents} onViewStudent={onViewStudent} />

        {/* Top & Bottom 5 Students */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 10 }}>
          {renderStudentChart(top5, 'Top 5 Students', Trophy, '#2563eb')}
          {renderStudentChart(bottom5, 'Bottom 5 Students', Star, '#ef4444')}
        </div>
      </div>"""

# Put them back INSIDE the grid (before the closing div)
new_block = """      {/* Subject Top 3 Centres */}
      <SubjectTopCentres centreBoard={centreBoard} onViewCentre={onViewCentre} />
      
      {/* Subject Top 3 Students */}
      <SubjectTopStudents subjectTopStudents={testInsights?.subjectTopStudents} onViewStudent={onViewStudent} />

      {/* Top & Bottom 5 Students */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 10 }}>
        {renderStudentChart(top5, 'Top 5 Students', Trophy, '#2563eb')}
        {renderStudentChart(bottom5, 'Bottom 5 Students', Star, '#ef4444')}
      </div>

      </div> {/* End Main Dashboard Layout */}"""

content = content.replace(old_block, new_block)

with open(file_path, 'w') as f:
    f.write(content)

