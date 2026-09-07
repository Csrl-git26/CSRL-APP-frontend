with open('src/components/InsightsDashboard.jsx', 'r') as f:
    content = f.read()

# 1. Update InsightsDashboard props
content = content.replace(
    "export default function InsightsDashboard({ data, overview, topRanked, bottomRanked, centreBoard, selectedTestKey, onViewStudent, onViewCentre }) {",
    "export default function InsightsDashboard({ data, overview, topRanked, bottomRanked, centreBoard, selectedTestKey, onViewStudent, onViewCentre, onActiveCentresClick }) {"
)

# 2. Update KpiCard definition
content = content.replace(
    "function KpiCard({ icon: Icon, value, label, sub, bg, color }) {",
    "function KpiCard({ icon: Icon, value, label, sub, bg, color, onClick }) {"
)
content = content.replace(
    "<div style={{ background:bg, borderRadius:10, padding:'6px 12px', display:'flex',",
    "<div onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', background:bg, borderRadius:10, padding:'6px 12px', display:'flex',"
)

# 3. Add onClick to Active Centres KpiCard
content = content.replace(
    "<KpiCard icon={BarChart3} value={centreBoard.length} label=\"Active Centres\"",
    "<KpiCard icon={BarChart3} value={centreBoard.length} label=\"Active Centres\" onClick={onActiveCentresClick}"
)

with open('src/components/InsightsDashboard.jsx', 'w') as f:
    f.write(content)


with open('src/components/AdminDashboard.jsx', 'r') as f:
    admin_content = f.read()

# 4. Remove onClick from statCards
admin_content = admin_content.replace(
    "{ Icon: Building2,     value: Math.max(0, centersList.length - 1), label: 'Active Centres',    bg: '#fff3e0', color: '#b45309', onClick: () => setShowGraphsModal(true) },",
    "{ Icon: Building2,     value: Math.max(0, centersList.length - 1), label: 'Active Centres',    bg: '#fff3e0', color: '#b45309' },"
)

# 5. Add onActiveCentresClick to InsightsDashboard
admin_content = admin_content.replace(
    "onViewCentre={(code) => { setPreviousPage(activePage); setFilterCenter(code); setActivePage('centre-overview'); }} />",
    "onViewCentre={(code) => { setPreviousPage(activePage); setFilterCenter(code); setActivePage('centre-overview'); }} onActiveCentresClick={() => setShowGraphsModal(true)} />"
)

with open('src/components/AdminDashboard.jsx', 'w') as f:
    f.write(admin_content)
