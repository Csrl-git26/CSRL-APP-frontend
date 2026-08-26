import re

filepath = '../CSRL-APP-frontend/src/components/Login.jsx'
with open(filepath, 'r') as f:
    content = f.read()

target = r"""      \} else \{
        if \(!username\.trim\(\) \|\| !password\) \{
          setError\('Enter username and password\.'\);
          return;
        \}
        await login\(\{ role: 'admin', id: username\.trim\(\), password \}\);
        localStorage\.removeItem\('subRole'\);
      \}"""

replacement = """      } else if (role === 'admin') {
        if (!username.trim() || !password) {
          setError('Enter username and password.');
          return;
        }
        await login({ role: 'admin', id: username.trim(), password });
        localStorage.removeItem('subRole');
      } else if (role === 'data_admin') {
        if (!username.trim() || !password) {
          setError('Enter username and password.');
          return;
        }
        await login({ role: 'admin', id: username.trim(), password });
        localStorage.setItem('subRole', 'DATA_ADMIN');
      }"""

content = re.sub(target, replacement, content)

with open(filepath, 'w') as f:
    f.write(content)
print('Patched Login.jsx submit handler')
