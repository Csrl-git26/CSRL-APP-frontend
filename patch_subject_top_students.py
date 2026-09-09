import sys

filepath = 'src/components/SubjectTopStudents.jsx'
with open(filepath, 'r') as f:
    content = f.read()

# Replace component name
content = content.replace("SubjectTopCentres", "SubjectTopStudents")

# Replace props
content = content.replace("{ centreBoard, onViewCentre }", "{ subjectTopStudents, onViewStudent }")

# Remove the useMemo computation block since subjectTopStudents is already the chartData
old_usememo = """  const chartData = useMemo(() => {
    if (!centreBoard || centreBoard.length === 0) return [];
    
    // Sort by Physics
    const topPhy = [...centreBoard].sort((a,b) => (b.Physics || 0) - (a.Physics || 0)).slice(0, 3);
    // Sort by Chemistry
    const topChe = [...centreBoard].sort((a,b) => (b.Chemistry || 0) - (a.Chemistry || 0)).slice(0, 3);
    // Sort by Math
    const topMath = [...centreBoard].sort((a,b) => (b.Math || 0) - (a.Math || 0)).slice(0, 3);
    
    return [
      {
        subject: 'PHY',
        top1Code: topPhy[0]?.code || '', top1Val: Math.round(topPhy[0]?.Physics || 0),
        top2Code: topPhy[1]?.code || '', top2Val: Math.round(topPhy[1]?.Physics || 0),
        top3Code: topPhy[2]?.code || '', top3Val: Math.round(topPhy[2]?.Physics || 0),
      },
      {
        subject: 'CHEM',
        top1Code: topChe[0]?.code || '', top1Val: Math.round(topChe[0]?.Chemistry || 0),
        top2Code: topChe[1]?.code || '', top2Val: Math.round(topChe[1]?.Chemistry || 0),
        top3Code: topChe[2]?.code || '', top3Val: Math.round(topChe[2]?.Chemistry || 0),
      },
      {
        subject: 'MATH',
        top1Code: topMath[0]?.code || '', top1Val: Math.round(topMath[0]?.Math || 0),
        top2Code: topMath[1]?.code || '', top2Val: Math.round(topMath[1]?.Math || 0),
        top3Code: topMath[2]?.code || '', top3Val: Math.round(topMath[2]?.Math || 0),
      }
    ];
  }, [centreBoard]);"""

content = content.replace(old_usememo, "  const chartData = subjectTopStudents || [];")

# Change title
content = content.replace("Subject Top 3", "Subject Top 3 Students")

# Change onClick handler
content = content.replace("onViewCentre(data.top1Code)", "onViewStudent(data.top1Roll)")
content = content.replace("onViewCentre(data.top2Code)", "onViewStudent(data.top2Roll)")
content = content.replace("onViewCentre(data.top3Code)", "onViewStudent(data.top3Roll)")
content = content.replace("onViewCentre && data.top1Code", "onViewStudent && data.top1Roll")
content = content.replace("onViewCentre && data.top2Code", "onViewStudent && data.top2Roll")
content = content.replace("onViewCentre && data.top3Code", "onViewStudent && data.top3Roll")

with open(filepath, 'w') as f:
    f.write(content)
