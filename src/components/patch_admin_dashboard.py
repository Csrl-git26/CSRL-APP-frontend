import re

file_path = "src/components/AdminDashboard.jsx"

with open(file_path, "r") as f:
    content = f.read()

start_str = "function MultiSelectDropdown({ options, selectedOptions, onChange }) {"
end_str = "  );\n}\n"

start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx) + len(end_str)

block_to_remove = content[start_idx:end_idx]

import_stmt = "import MultiSelectDropdown from './MultiSelectDropdown';\n"

content = content.replace(block_to_remove, import_stmt)

with open(file_path, "w") as f:
    f.write(content)
print("Patched AdminDashboard.jsx successfully")
