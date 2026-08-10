import re

with open('src/components/StudentProfileView.jsx', 'r') as f:
    content = f.read()

# We need to see if it imports getStreamConfig
print("Imports getStreamConfig:", "getStreamConfig" in content)

