import sys

filepath = 'src/components/InsightsDashboard.jsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add import
import_subject = "import SubjectTopCentres from './SubjectTopCentres';"
content = content.replace(import_subject, "import SubjectTopCentres from './SubjectTopCentres';\nimport SubjectTopStudents from './SubjectTopStudents';")

# Change props signature
content = content.replace("export default function InsightsDashboard({ data, overview, topRanked, bottomRanked, centreBoard", "export default function InsightsDashboard({ testInsights, data, overview, topRanked, bottomRanked, centreBoard")

# Add component to layout
# Right now, the SubjectTopCentres is added like this:
old_tag = "{/* Subject Top 3 Centres */}\n      <SubjectTopCentres centreBoard={centreBoard} onViewCentre={onViewCentre} />"
new_tag = """{/* Subject Top 3 Centres */}
      <SubjectTopCentres centreBoard={centreBoard} onViewCentre={onViewCentre} />
      {/* Subject Top 3 Students */}
      <SubjectTopStudents subjectTopStudents={testInsights?.subjectTopStudents} onViewStudent={onViewStudent} />"""
      
content = content.replace(old_tag, new_tag)

with open(filepath, 'w') as f:
    f.write(content)
