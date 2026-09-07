import sys

filepath = 'src/components/AdminDashboard.jsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Import SubjectTopCentres
if "import SubjectTopCentres" not in content:
    content = content.replace(
        "import CentreLeaderboard from './CentreLeaderboard';",
        "import CentreLeaderboard from './CentreLeaderboard';\nimport SubjectTopCentres from './SubjectTopCentres';"
    )

# 2. Modify grid layout in the modal
old_grid = "<div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px', height: '100%' }}>"
new_grid = "<div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr) minmax(0, 0.7fr)', gap: '15px', height: '100%' }}>"
content = content.replace(old_grid, new_grid)

# 3. Add the third column
old_col_end = """              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {trendChartLoading ? (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>Loading trend data...</div>
                ) : trendChartData.length > 0 ? (
                  <PerformanceChart data={trendChartData} title="" />
                ) : (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>No past data available for this centre to show a trend.</div>
                )}
              </div>
            </div>
          </div>"""

new_col_end = """              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {trendChartLoading ? (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>Loading trend data...</div>
                ) : trendChartData.length > 0 ? (
                  <PerformanceChart data={trendChartData} title="" />
                ) : (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>No past data available for this centre to show a trend.</div>
                )}
              </div>
            </div>

            {/* Right Side 2: Subject Top Centres */}
            <SubjectTopCentres data={data} selectedTestKeys={selectedLeaderboardTestKeys.length > 1 ? selectedLeaderboardTestKeys : (selectedLeaderboardTestKeys[0] ? [selectedLeaderboardTestKeys[0]] : [selectedTestKey])} />
          </div>"""

content = content.replace(old_col_end, new_col_end)

with open(filepath, 'w') as f:
    f.write(content)
