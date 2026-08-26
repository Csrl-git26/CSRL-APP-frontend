import re

filepath = '../CSRL-APP-frontend/src/components/AdminDashboard.jsx'
with open(filepath, 'r') as f:
    content = f.read()

target1 = r"""const TABS = \[
  \{ key: 'leaderboard', Icon: Trophy,         label: 'Centre Leaderboard' \},
  \{ key: 'centre-overview', Icon: Building2, label: 'Centre Overview'      \},
  \{ key: 'ranking',     Icon: TrendingUp,      label: 'Rankings'           \},
  \{ key: 'students',    Icon: Users,           label: 'Students'           \},
  \{ key: 'pastyear',    Icon: Package,         label: 'Past Year Data'     \},
  \{ key: 'import',      Icon: Upload,          label: 'Import / Export'    \},
\];"""

replacement1 = """const ALL_TABS = [
  { key: 'leaderboard', Icon: Trophy,         label: 'Centre Leaderboard' },
  { key: 'centre-overview', Icon: Building2, label: 'Centre Overview'      },
  { key: 'ranking',     Icon: TrendingUp,      label: 'Rankings'           },
  { key: 'students',    Icon: Users,           label: 'Students'           },
  { key: 'pastyear',    Icon: Package,         label: 'Past Year Data'     },
  { key: 'import',      Icon: Upload,          label: 'Import / Export'    },
];
const isDataAdmin = typeof window !== 'undefined' && localStorage.getItem('subRole') === 'DATA_ADMIN';
const TABS = isDataAdmin ? ALL_TABS.filter(t => t.key === 'import') : ALL_TABS;"""

content = re.sub(target1, replacement1, content)

with open(filepath, 'w') as f:
    f.write(content)
print('Patched AdminDashboard.jsx')
