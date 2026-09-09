import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Extract Top & Bottom 5 Students
top_bottom_marker = """        {/* Left Column: Top & Bottom 5 Students */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 10 }}>
          {renderStudentChart(top5, 'Top 5 Students', Trophy, '#2563eb')}
          {renderStudentChart(bottom5, 'Bottom 5 Students', Star, '#ef4444')}
        </div>"""

if top_bottom_marker in content:
    content = content.replace(top_bottom_marker, "")
else:
    print("Could not find Top & Bottom 5 Students")

# 2. Extract Subject components
subject_marker = """      {/* Subject Top 3 Centres */}
      <SubjectTopCentres centreBoard={centreBoard} onViewCentre={onViewCentre} />
      {/* Subject Top 3 Students */}
      <SubjectTopStudents subjectTopStudents={testInsights?.subjectTopStudents} onViewStudent={onViewStudent} />"""

if subject_marker in content:
    content = content.replace(subject_marker, "")
else:
    print("Could not find Subject components")

# 3. Insert them after the main grid
insertion_point = "      </div> {/* End Main Dashboard Layout */}"

new_blocks = """      </div> {/* End Main Dashboard Layout */}

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

content = content.replace(insertion_point, new_blocks)

with open(file_path, 'w') as f:
    f.write(content)

