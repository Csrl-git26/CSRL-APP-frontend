import re

filepath = '../CSRL-APP-frontend/src/components/Login.jsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Update imports
target_imports = r"import \{ GraduationCap, Building2, ShieldCheck, LogIn, AlertCircle \} from 'lucide-react';"
replacement_imports = "import { GraduationCap, Building2, ShieldCheck, LogIn, AlertCircle, Database } from 'lucide-react';"
content = re.sub(target_imports, replacement_imports, content)

# 2. Update ROLES array
target_roles = r"""const ROLES = \[
  \{ key: 'student', Icon: GraduationCap, label: 'Student' \},
  \{ key: 'centre',  Icon: Building2,      label: 'Centre'  \},
  \{ key: 'admin',   Icon: ShieldCheck,    label: 'CSRL Management'   \},
\];"""
replacement_roles = """const ROLES = [
  { key: 'student', Icon: GraduationCap, label: 'Student' },
  { key: 'centre',  Icon: Building2,      label: 'Centre'  },
  { key: 'admin',   Icon: ShieldCheck,    label: 'CSRL Management'   },
  { key: 'data_admin', Icon: Database,    label: 'Admin' },
];"""
content = re.sub(target_roles, replacement_roles, content)

# 3. Update handleSubmit
target_submit = r"""      \} else if \(role === 'admin'\) \{
        if \(!username\.trim\(\) \|\| !password\) \{
          setError\('Enter username and password\.'\);
          return;
        \}
        await login\(\{ role: 'admin', id: username\.trim\(\), password \}\);
        localStorage\.removeItem\('subRole'\);
      \}
      navigate\('/'\);"""
replacement_submit = """      } else if (role === 'admin') {
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
      }
      navigate('/');"""
content = re.sub(target_submit, replacement_submit, content)

# 4. Update the form rendering logic to allow 'data_admin' to show the username/password fields
target_form = r"\{role === 'admin' && \("
replacement_form = "{(role === 'admin' || role === 'data_admin') && ("
content = re.sub(target_form, replacement_form, content)

with open(filepath, 'w') as f:
    f.write(content)
print('Patched Login.jsx for 4th tab')
