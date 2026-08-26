import re

filepath = '../CSRL-APP-frontend/src/components/Layout.jsx'
with open(filepath, 'r') as f:
    content = f.read()

target1 = r"""  const role = auth\?\.role;
  const navItems = auth\?\.role === 'ADMIN' \? ADMIN_NAV
                 : auth\?\.role === 'CENTRE' \? CENTRE_NAV
                 : STUDENT_NAV;

  useEffect\(\(\) => \{
    if \(role === 'ADMIN'\)   setActivePage\('leaderboard'\);"""

replacement1 = """  const role = auth?.role;
  const isDataAdmin = role === 'ADMIN' && localStorage.getItem('subRole') === 'DATA_ADMIN';
  const DATA_ADMIN_NAV = [
    { section: 'Import' },
    { key: 'import',      Icon: Upload,          label: 'Import Excel'       },
  ];

  const navItems = isDataAdmin ? DATA_ADMIN_NAV
                 : auth?.role === 'ADMIN' ? ADMIN_NAV
                 : auth?.role === 'CENTRE' ? CENTRE_NAV
                 : STUDENT_NAV;

  useEffect(() => {
    if (role === 'ADMIN')   setActivePage(isDataAdmin ? 'import' : 'leaderboard');"""

content = re.sub(target1, replacement1, content)

with open(filepath, 'w') as f:
    f.write(content)
print('Patched Layout.jsx')
