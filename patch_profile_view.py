import re

with open('src/components/StudentProfileView.jsx', 'r') as f:
    content = f.read()

# 1. Imports
if 'getStreamConfig' not in content:
    content = content.replace(
        "import { getJeePercentile, getNeetScore, parseTestColumn, resolveStudentPhotoUrl } from '../services/dataService';",
        "import { getJeePercentile, getNeetScore, parseTestColumn, resolveStudentPhotoUrl, fetchStudentChart, buildStudentChartData, getStreamConfig } from '../services/dataService';"
    )

# 2. Add state and effect for chart
state_code = """
  const [overallWeakSubjects, setOverallWeakSubjects] = React.useState(null);
  const [overallWeakTopicsData, setOverallWeakTopicsData] = React.useState(null);
  const [isExportingPDF, setIsExportingPDF] = React.useState(false);
  
  const [chart, setChart] = React.useState(null);
  const [chartMetric, setChartMetric] = React.useState('MARKS');
  const [chartSubjects, setChartSubjects] = React.useState(['Physics', 'Chemistry', 'Math', 'Biology', 'Total']);
"""
content = re.sub(
    r'const \[overallWeakSubjects, setOverallWeakSubjects\] = React\.useState\(null\);\s*const \[overallWeakTopicsData, setOverallWeakTopicsData\] = React\.useState\(null\);\s*const \[isExportingPDF, setIsExportingPDF\] = React\.useState\(false\);',
    state_code.strip(),
    content
)

effect_code = """
  React.useEffect(() => {
    if (!profile?.ROLL_KEY) return;
    let cancelled = false;
    getStudentOverallWeakTopics(profile.ROLL_KEY).then((res) => {
      if (!cancelled && res.success && res.data) {
        if (res.data.overallWeakSubjects) setOverallWeakSubjects(res.data.overallWeakSubjects);
        setOverallWeakTopicsData(res.data);
      }
    });
    
    fetchStudentChart(null, profile.ROLL_KEY, null).then((res) => {
      if (!cancelled && res) setChart(res);
    }).catch(() => {});
    
    return () => { cancelled = true; };
  }, [profile?.ROLL_KEY]);
"""
content = re.sub(
    r'React\.useEffect\(\(\) => \{[\s\S]*?return \(\) => \{ cancelled = true; \};\s*\}, \[profile\?\.ROLL_KEY\]\);',
    effect_code.strip(),
    content
)

# 3. Replace chartData useMemo
# Wait, let's extract the one from StudentDashboard.jsx
with open('src/components/StudentDashboard.jsx', 'r') as f:
    dashboard = f.read()

chart_data_memo = re.search(r'const chartData = useMemo\(\(\) => \{[\s\S]*?\}, \[chart, studentTests, testColumns, stream\]\);', dashboard).group(0)

# The old useMemo in StudentProfileView computes `mappedTestList, weakSubject, chartData, subjects`
# We will compute them using the dashboard logic.
new_memo = f"""
  const streamCfg = getStreamConfig(stream);
  
{chart_data_memo}

  const subjects = useMemo(() => streamCfg.subjects.filter((sub) => chartData.some((row) => 
      row[sub] != null || 
      row[`${{sub}}_Accuracy`] != null || 
      row[`${{sub}}_Attempted`] != null || 
      row[`${{sub}}_Correct`] != null
    )), [chartData, streamCfg.subjects]
  );
  
  const mappedTestList = chartData; // Fallback mapping for older uses if any
"""

# Let's replace the old `const { mappedTestList, weakSubject, chartData, subjects } = useMemo(() => { ... });`
# It ends at line 150.
content = re.sub(r'const \{ mappedTestList, weakSubject, chartData, subjects \} = useMemo\(\(\) => \{[\s\S]*?return \{ mappedTestList, weakSubject: weakSub, chartData, subjects: Array\.from\(allSubs\) \};\s*\}, \[studentTests, testColumns\]\);', new_memo.strip(), content)

# 4. Replace Graph and Table JSX
# The old graph is in <div className="card">\n <div className="section-title">📈 Performance Trend</div> ...
# The old table is in <div className="card">\n <div className="section-title">📋 Complete Test Records</div> ...

graph_jsx = re.search(r'(<div style=\{\{ display: \'flex\', gap: 8, marginBottom: 12, flexWrap: \'wrap\' \}\}>[\s\S]*?</ResponsiveContainer>\n\s*</>)', dashboard).group(1)

# SUBJECT_COLORS constant is needed for the new graph code.
if 'const SUBJECT_COLORS' not in content:
    content = content.replace("function displayCenter(code)", "const SUBJECT_COLORS = ['#ea580c', '#16a34a', '#2563eb', '#9333ea', '#0d9488'];\n\nfunction displayCenter(code)")

table_jsx = re.search(r'(<div className="table-wrap">\n\s*<table className="table">[\s\S]*?</table>\n\s*</div>)', dashboard).group(1)

# Now inject these into content
# Graph replacement:
# Find: <div className="section-title">📈 Performance Trend</div>\n          <div style={{ height: 280 }}>\n            <ResponsiveContainer width="100%" height="100%">[\s\S]*?</ResponsiveContainer>\n          </div>
new_graph = f"""<div className="section-title">📈 Performance Trend</div>
          <div style={{{{ height: 280 }}}}>
            {graph_jsx}
          </div>"""
content = re.sub(r'<div className="section-title">📈 Performance Trend</div>\s*<div style=\{\{ height: 280 \}\}>\s*<ResponsiveContainer width="100%" height="100%">[\s\S]*?</ResponsiveContainer>\s*</div>', new_graph, content)

# Table replacement:
new_table = f"""<div className="section-title">📋 Complete Test Records</div>
        {table_jsx}"""
content = re.sub(r'<div className="section-title">📋 Complete Test Records</div>\s*<div className="table-wrap">\s*<table className="table">[\s\S]*?</table>\s*</div>', new_table, content)

with open('src/components/StudentProfileView.jsx', 'w') as f:
    f.write(content)

print("Patch generated!")
