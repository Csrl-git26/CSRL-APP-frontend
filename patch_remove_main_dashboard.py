file_path = "/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx"

with open(file_path, "r") as f:
    content = f.read()

import re

# We want to remove everything from {/* ── Main Dashboard Layout ── */} to {/* End Main Dashboard Layout */}
# Including those comments.
pattern = re.compile(r'\{/\*\s*── Main Dashboard Layout ──\s*\*/\}.*?\{/\*\s*End Main Dashboard Layout\s*\*/\}', re.DOTALL)

if pattern.search(content):
    new_content = pattern.sub('', content)
    with open(file_path, "w") as f:
        f.write(new_content)
    print("Main Dashboard Layout removed successfully.")
else:
    print("Could not find Main Dashboard Layout.")

