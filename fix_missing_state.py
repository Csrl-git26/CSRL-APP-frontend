import os

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# insert state right after the component declaration
old_decl = "export default function InsightsDashboard({ testInsights, data, overview, topRanked, bottomRanked, centreBoard, selectedTestKey, onViewStudent, onViewCentre, onActiveCentresClick, onTotalStudentsClick }) {"
new_decl = old_decl + "\n  const [activeStudentBar, setActiveStudentBar] = useState(null);"

if old_decl in content and "const [activeStudentBar, setActiveStudentBar] = useState(null);" not in content:
    content = content.replace(old_decl, new_decl)
    with open(file_path, 'w') as f:
        f.write(content)
        print("Success")
else:
    print("Could not find declaration or already injected.")
