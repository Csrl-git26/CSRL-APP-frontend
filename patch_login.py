import re

filepath = '../CSRL-APP-frontend/src/components/Login.jsx'
with open(filepath, 'r') as f:
    content = f.read()

target = r"await login\(\{ role: 'admin', id: username\.trim\(\), password \}\);"
replacement = """await login({ role: 'admin', id: username.trim(), password });
        localStorage.removeItem('subRole');"""

content = re.sub(target, replacement, content)

with open(filepath, 'w') as f:
    f.write(content)
print('Patched Login.jsx')
