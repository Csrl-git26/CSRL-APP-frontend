import re

filepath = '../CSRL-APP-frontend/src/components/Login.jsx'
with open(filepath, 'r') as f:
    content = f.read()

target1 = r"import \{ GraduationCap, Building2, ShieldCheck, LogIn, AlertCircle, Database \} from 'lucide-react';"
replacement1 = "import { GraduationCap, Building2, ShieldCheck, LogIn, AlertCircle, FileText } from 'lucide-react';"
content = re.sub(target1, replacement1, content)

target2 = r"\{ key: 'data_admin', Icon: Database,    label: 'Admin' \},"
replacement2 = "{ key: 'data_admin', Icon: FileText,    label: 'Admin' },"
content = re.sub(target2, replacement2, content)

with open(filepath, 'w') as f:
    f.write(content)
print('Patched Login.jsx icon')
