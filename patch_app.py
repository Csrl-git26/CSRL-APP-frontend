import re

filepath = '../CSRL-APP-frontend/src/App.jsx'
with open(filepath, 'r') as f:
    content = f.read()

target1 = r"import Login from '\./components/Login';"
replacement1 = """import Login from './components/Login';
import DataAdminLogin from './components/DataAdminLogin';"""

target2 = r"<Route path=\"/login\" element=\{<Login />\} />"
replacement2 = """<Route path="/login" element={<Login />} />
      <Route path="/data-admin" element={<DataAdminLogin />} />"""

content = re.sub(target1, replacement1, content)
content = re.sub(target2, replacement2, content)

with open(filepath, 'w') as f:
    f.write(content)
print('Patched App.jsx')
