import os
import glob

def replace_in_file(filepath, old_str, new_str):
    if not os.path.exists(filepath):
        print(f"Skipping {filepath}, does not exist.")
        return
    with open(filepath, 'r') as f:
        content = f.read()
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath}")

# 1. dataService.js
dataService = "/Users/surya/Desktop/CSRL-APP-frontend/src/services/dataService.js"
replace_in_file(dataService, 
    "subjects: ['Physics', 'Chemistry', 'Biology']",
    "subjects: ['Physics', 'Chemistry', 'Botany', 'Zoology']")
replace_in_file(dataService,
    "maxBySubject: { Physics: 180, Chemistry: 180, Biology: 360 }",
    "maxBySubject: { Physics: 180, Chemistry: 180, Botany: 180, Zoology: 180 }")

# 2. Dashboards abbreviation logic
abbr_old = "const abbr = s === 'Physics' ? 'P' : s === 'Chemistry' ? 'C' : (s === 'Math' || s === 'Mathematics') ? 'M' : s === 'Biology' ? 'B' : s.substring(0, 3);"
abbr_new = "const abbr = s === 'Physics' ? 'P' : s === 'Chemistry' ? 'C' : (s === 'Math' || s === 'Mathematics') ? 'M' : s === 'Botany' ? 'Bot' : s === 'Zoology' ? 'Zoo' : s === 'Biology' ? 'B' : s.substring(0, 3);"

for path in glob.glob("/Users/surya/Desktop/CSRL-APP-frontend/src/components/*.jsx"):
    replace_in_file(path, abbr_old, abbr_new)

# 3. Student Profile / Dashboard logic
for file in ["StudentProfileView.jsx", "StudentDashboard.jsx"]:
    filepath = f"/Users/surya/Desktop/CSRL-APP-frontend/src/components/{file}"
    # Change initial state
    replace_in_file(filepath, 
        "['Physics', 'Chemistry', 'Math', 'Biology', 'Total']", 
        "['Physics', 'Chemistry', 'Math', 'Botany', 'Zoology', 'Total']")
    # Remove Biology merge block
    with open(filepath, 'r') as f:
        content = f.read()
    if "const biology = toNum(normalized.Biology);" in content:
        import re
        content = re.sub(
            r"const biology = toNum\(normalized\.Biology\);\s*const botany = toNum\(normalized\.Botany\);\s*const zoology = toNum\(normalized\.Zoology\);\s*const mergedBiology = biology \?\? \(\(botany \?\? 0\) \+ \(zoology \?\? 0\) \|\| null\);\s*normalized\.Biology = mergedBiology;",
            "const biology = toNum(normalized.Biology);\n        const botany = toNum(normalized.Botany);\n        const zoology = toNum(normalized.Zoology);",
            content
        )
        content = content.replace(
            "const parts = [physics, chemistry, mergedBiology].filter((v) => v !== null);",
            "const parts = [physics, chemistry, math, botany, zoology, biology].filter((v) => v !== null);"
        )
        # Fix logic for missing
        content = content.replace(
            "(['a', 'A', 'absent', 'Absent'].includes(String(row.Biology).trim()) || ['a', 'A', 'absent', 'Absent'].includes(String(row.Botany).trim())))",
            "(['a', 'A', 'absent', 'Absent'].includes(String(row.Botany).trim()) || ['a', 'A', 'absent', 'Absent'].includes(String(row.Zoology).trim())))"
        )
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched biology merging in {filepath}")

# 4. InsightsDashboard
for file in ["InsightsDashboard.jsx", "InsightsDashboard_check.jsx"]:
    filepath = f"/Users/surya/Desktop/CSRL-APP-frontend/src/components/{file}"
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # In check file, Botany and Zoology are already in arrays, but need to make sure rendering logic is updated
    # It has a block for "Biology" bar chart, let's duplicate for Botany and Zoology
    if "dataKey=\"Biology\"" in content:
        bio_bar_str = """<Bar shape={(props) => renderStudentBarShape(props, "Biology", title, activeStudentBar)} onMouseEnter={(_, index) => setActiveStudentBar({chartId: title, index, dataKey: "Biology"})} onMouseLeave={() => setActiveStudentBar(null)} dataKey="Biology" stackId="a" fill="#ec4899" barSize={24} isAnimationActive={shouldAnimate} animationDuration={2000} animationEasing="ease-out" onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Biology_orig" content={(props) => <CustomBarLabel {...props} prefix="B" />} />
                        </Bar>"""
        if bio_bar_str in content:
            new_bars = bio_bar_str.replace("Biology", "Botany").replace("prefix=\"B\"", "prefix=\"Bot\"").replace("#ec4899", "#059669") + "\n" + bio_bar_str.replace("Biology", "Zoology").replace("prefix=\"B\"", "prefix=\"Zoo\"").replace("#ec4899", "#0891b2")
            content = content.replace(bio_bar_str, new_bars)
        
        bio_bar_str2 = """<Bar shape={(props) => renderStudentBarShape(props, "Biology", title, activeStudentBar)} onMouseEnter={(_, index) => setActiveStudentBar({chartId: title, index, dataKey: "Biology"})} onMouseLeave={() => setActiveStudentBar(null)} dataKey="Biology" stackId="a" fill="#ec4899" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Biology_orig" content={(props) => <CustomBarLabel {...props} prefix="B" />} />
                        </Bar>"""
        if bio_bar_str2 in content:
            new_bars2 = bio_bar_str2.replace("Biology", "Botany").replace("prefix=\"B\"", "prefix=\"Bot\"").replace("#ec4899", "#059669") + "\n" + bio_bar_str2.replace("Biology", "Zoology").replace("prefix=\"B\"", "prefix=\"Zoo\"").replace("#ec4899", "#0891b2")
            content = content.replace(bio_bar_str2, new_bars2)
            
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched bar charts in {filepath}")

# 5. PerformanceChart.jsx
perf = "/Users/surya/Desktop/CSRL-APP-frontend/src/components/PerformanceChart.jsx"
replace_in_file(perf, 
    "['Physics', 'Chemistry', 'Math', 'Biology', 'Total']", 
    "['Physics', 'Chemistry', 'Math', 'Botany', 'Zoology', 'Total']")

# 6. TestRecordsTable.jsx
tr = "/Users/surya/Desktop/CSRL-APP-frontend/src/components/TestRecordsTable.jsx"
with open(tr, 'r') as f:
    content = f.read()
if "const b = Number(row.Biology || 0);" in content:
    content = content.replace(
        "const b = Number(row.Biology || 0);",
        "const bot = Number(row.Botany || 0);\n                const zoo = Number(row.Zoology || 0);"
    )
    content = content.replace(
        "return p + c + m + b;",
        "return p + c + m + bot + zoo;"
    )
    content = content.replace(
        "threshold = (subject === 'Biology' || subject === 'Botany' || subject === 'Zoology') ? 126 : 63;",
        "threshold = 63;" # All subjects are 180 max for NEET (except maybe some tests, but typically 180 max, 63 is 35%. Biology was 360, so 126 was 35%. 63 is 35% of 180.)
    )
    with open(tr, 'w') as f:
        f.write(content)
    print(f"Patched {tr}")

# 7. StudentReportCard.jsx
src = "/Users/surya/Desktop/CSRL-APP-frontend/src/components/StudentReportCard.jsx"
replace_in_file(src,
    "['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Botany', 'Zoology']",
    "['Physics', 'Chemistry', 'Mathematics', 'Botany', 'Zoology']")
    
print("All patches applied.")
