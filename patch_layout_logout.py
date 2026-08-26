import re

filepath = '../CSRL-APP-frontend/src/components/Layout.jsx'
with open(filepath, 'r') as f:
    content = f.read()

target1 = r"""  const handleLogout = async \(\) => \{
    await logout\(\);
    navigate\('/login'\);
  \};"""

replacement1 = """  const handleLogout = async () => {
    localStorage.removeItem('subRole');
    await logout();
    navigate('/login');
  };"""

content = re.sub(target1, replacement1, content)

with open(filepath, 'w') as f:
    f.write(content)
print('Patched Layout logout')
