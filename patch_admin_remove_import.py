import re

# 1. Update AdminDashboard.jsx
filepath_admin = '../CSRL-APP-frontend/src/components/AdminDashboard.jsx'
with open(filepath_admin, 'r') as f:
    content_admin = f.read()

target_admin = r"const TABS = isDataAdmin \? ALL_TABS\.filter\(t => t\.key === 'import'\) : ALL_TABS;"
replacement_admin = "const TABS = isDataAdmin ? ALL_TABS.filter(t => t.key === 'import') : ALL_TABS.filter(t => t.key !== 'import');"
content_admin = re.sub(target_admin, replacement_admin, content_admin)

with open(filepath_admin, 'w') as f:
    f.write(content_admin)

# 2. Update Layout.jsx
filepath_layout = '../CSRL-APP-frontend/src/components/Layout.jsx'
with open(filepath_layout, 'r') as f:
    content_layout = f.read()

target_layout = r"""const ADMIN_NAV = \[
  \{ section: 'Overview' \},
  \{ key: 'leaderboard', Icon: Trophy,         label: 'Centre Leaderboard' \},
  \{ key: 'ranking',     Icon: TrendingUp,      label: 'Rankings'           \},
  \{ section: 'Data Management' \},
  \{ key: 'students',    Icon: Users,           label: 'Students'           \},
  \{ key: 'pastyear',    Icon: Archive,         label: 'Past Year Data'     \},
  \{ section: 'Import' \},
  \{ key: 'import',      Icon: Upload,          label: 'Import Excel'       \},
\];"""
replacement_layout = """const ADMIN_NAV = [
  { section: 'Overview' },
  { key: 'leaderboard', Icon: Trophy,         label: 'Centre Leaderboard' },
  { key: 'ranking',     Icon: TrendingUp,      label: 'Rankings'           },
  { section: 'Data Management' },
  { key: 'students',    Icon: Users,           label: 'Students'           },
  { key: 'pastyear',    Icon: Archive,         label: 'Past Year Data'     },
];"""
content_layout = re.sub(target_layout, replacement_layout, content_layout)

with open(filepath_layout, 'w') as f:
    f.write(content_layout)

print('Patched AdminDashboard.jsx and Layout.jsx')
