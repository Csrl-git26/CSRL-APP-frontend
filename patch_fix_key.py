file_path = "/Users/surya/Desktop/CSRL-APP-frontend/src/components/AdminDashboard.jsx"

with open(file_path, "r") as f:
    content = f.read()

old = '<InsightsDashboard testInsights={testInsights} data={data} overview={overview} topRanked={leaderboardTopRanked} bottomRanked={leaderboardBottomRanked} centreBoard={centreBoard} selectedTestKey={selectedLeaderboardTestKeys.length > 1 ? \'Multiple Tests\' : (selectedLeaderboardTestKeys[0] || selectedTestKey)} onViewStudent={setViewingStudentId} onViewCentre={(code) => { setPreviousPage(activePage); setFilterCenter(code); setActivePage(\'centre-overview\'); }} onActiveCentresClick={() => setShowGraphsModal(true)} onTotalStudentsClick={() => { setPreviousPage(activePage); setActivePage(\'ranking\'); }} />'

new = '<InsightsDashboard key={selectedLeaderboardTestKeys.join(\',\')} testInsights={testInsights} data={data} overview={overview} topRanked={leaderboardTopRanked} bottomRanked={leaderboardBottomRanked} centreBoard={centreBoard} selectedTestKey={selectedLeaderboardTestKeys.length > 1 ? \'Multiple Tests\' : (selectedLeaderboardTestKeys[0] || selectedTestKey)} onViewStudent={setViewingStudentId} onViewCentre={(code) => { setPreviousPage(activePage); setFilterCenter(code); setActivePage(\'centre-overview\'); }} onActiveCentresClick={() => setShowGraphsModal(true)} onTotalStudentsClick={() => { setPreviousPage(activePage); setActivePage(\'ranking\'); }} />'

if old in content:
    content = content.replace(old, new)
    with open(file_path, "w") as f:
        f.write(content)
    print("Fixed key prop successfully.")
else:
    print("Could not find target string.")
