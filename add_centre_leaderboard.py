import re

with open('src/components/CentreDashboard.jsx', 'r') as f:
    content = f.read()

# 1. Imports
if 'fetchCentreLeaderboard' not in content:
    content = content.replace(
        'fetchSubjectAverages,',
        'fetchSubjectAverages,\n  fetchCentreLeaderboard,'
    )

if 'CentreLeaderboard' not in content:
    content = content.replace(
        "import StudentProfileView from './StudentProfileView';",
        "import StudentProfileView from './StudentProfileView';\nimport CentreLeaderboard from './CentreLeaderboard';"
    )

# 2. Add Tab
if "{ key: 'leaderboard'" not in content:
    content = content.replace(
        "const TABS = [",
        "const TABS = [\n  { key: 'leaderboard', Icon: Trophy,         label: 'Centre Leaderboard' },"
    )

# 3. Add state
if 'const [centreBoard, setCentreBoard] = useState([]);' not in content:
    content = content.replace(
        "const [testInsightsError, setTestInsightsError]   = useState('');",
        "const [testInsightsError, setTestInsightsError]   = useState('');\n  const [centreBoard, setCentreBoard] = useState([]);"
    )

# 4. Fetch data in useEffect
if 'fetchCentreLeaderboard(' not in content:
    # Find the Promise.all in useEffect
    fetch_code = """
    fetchCentreLeaderboard(null, selectedTestKey)
      .then(board => setCentreBoard(Array.isArray(board) ? board : []))
      .catch(() => setCentreBoard([]));
    """
    content = content.replace(
        "fetchSubjectAverages(null, selectedCenterCode, selectedTestKey)",
        f"{fetch_code}\n    fetchSubjectAverages(null, selectedCenterCode, selectedTestKey)"
    )

# 5. Add LeaderboardSection
leaderboard_section = """
  const LeaderboardSection = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 800, color: 'var(--gray-800)' }}>
            <Trophy size={18} aria-hidden="true" />Centre Rankings — {selectedTestKey}
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>Sorted descending by average score</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Test:</span>
          <select className="input select" value={selectedTestKey} onChange={(e) => setSelectedTestKey(e.target.value)} style={{ width: 170, fontSize: 13 }}>
            {(data?.testColumns || []).map((col) => <option key={col} value={col}>{col}</option>)}
          </select>
        </div>
      </div>
      <CentreLeaderboard centreStats={centreBoard} selTest={selectedTestKey} />
    </div>
  );
"""

if 'const LeaderboardSection' not in content:
    content = content.replace(
        "const OverviewSection = () => (",
        leaderboard_section + "\n  const OverviewSection = () => ("
    )

# 6. Render the section
if "activePage === 'leaderboard'" not in content:
    content = content.replace(
        "{activePage === 'overview'    && <OverviewSection />}",
        "{activePage === 'leaderboard' && <LeaderboardSection />}\n          {activePage === 'overview'    && <OverviewSection />}"
    )

with open('src/components/CentreDashboard.jsx', 'w') as f:
    f.write(content)

print("Added CentreLeaderboard")
