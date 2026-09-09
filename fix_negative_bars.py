import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Remove clamping to 0
old_clamp = "                             d[sub] = val > 0 ? val : 0; // clamp to 0 to prevent downward bars breaking layout"
new_clamp = "                             d[sub] = val;"
content = content.replace(old_clamp, new_clamp)

# 2. Change XAxis domain from [0, 'auto'] to ['auto', 'auto']
old_domain = "domain={[0, 'auto']}"
new_domain = "domain={['auto', 'auto']}"
content = content.replace(old_domain, new_domain)

# 3. Update Label formatter to show negative values too!
old_formatter = "formatter={(v) => v > 0 ? `P${v}` : ''}"
new_formatter = "formatter={(v) => v !== 0 ? `P${v}` : ''}"
content = content.replace(old_formatter, new_formatter)

old_formatter_c = "formatter={(v) => v > 0 ? `C${v}` : ''}"
new_formatter_c = "formatter={(v) => v !== 0 ? `C${v}` : ''}"
content = content.replace(old_formatter_c, new_formatter_c)

old_formatter_m = "formatter={(v) => v > 0 ? `M${v}` : ''}"
new_formatter_m = "formatter={(v) => v !== 0 ? `M${v}` : ''}"
content = content.replace(old_formatter_m, new_formatter_m)

old_formatter_b = "formatter={(v) => v > 0 ? `B${v}` : ''}"
new_formatter_b = "formatter={(v) => v !== 0 ? `B${v}` : ''}"
content = content.replace(old_formatter_b, new_formatter_b)

old_formatter_z = "formatter={(v) => v > 0 ? `Z${v}` : ''}"
new_formatter_z = "formatter={(v) => v !== 0 ? `Z${v}` : ''}"
content = content.replace(old_formatter_z, new_formatter_z)

with open(file_path, 'w') as f:
    f.write(content)

