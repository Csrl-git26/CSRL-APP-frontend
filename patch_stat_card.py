with open('src/components/AdminDashboard.jsx', 'r') as f:
    content = f.read()

# 1. Update statCards definition to include onClick
old_stat_card = "{ Icon: Building2,     value: Math.max(0, centersList.length - 1), label: 'Active Centres',    bg: '#fff3e0', color: '#b45309' },"
new_stat_card = "{ Icon: Building2,     value: Math.max(0, centersList.length - 1), label: 'Active Centres',    bg: '#fff3e0', color: '#b45309', onClick: () => setShowGraphsModal(true) },"
content = content.replace(old_stat_card, new_stat_card)

# 2. Update the stat-card map render to include onClick and cursor
old_render = '<div className="stat-card" key={card.label}>'
new_render = '<div className="stat-card" key={card.label} onClick={card.onClick} style={{ cursor: card.onClick ? \'pointer\' : \'default\' }}>'
content = content.replace(old_render, new_render)

# 3. Revert onViewCentre in InsightsDashboard
old_on_view_centre = "onViewCentre={(code) => { setSelectedTrendCentre(code); setShowGraphsModal(true); }}"
new_on_view_centre = "onViewCentre={(code) => { setPreviousPage(activePage); setFilterCenter(code); setActivePage('centre-overview'); }}"
content = content.replace(old_on_view_centre, new_on_view_centre)

with open('src/components/AdminDashboard.jsx', 'w') as f:
    f.write(content)
