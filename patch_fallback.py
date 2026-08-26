import re

filepath = '../CSRL-APP-backed/server.js'
with open(filepath, 'r') as f:
    content = f.read()

target = """            let totalCorrect = 0;
            
            Object.entries(rawMarkDoc.marks).forEach(([q, mark]) => {
              const sub = qToSub[q];"""

replacement = """            let totalCorrect = 0;
            
            let marksEntries = [];
            if (rawMarkDoc.marks instanceof Map) {
              marksEntries = Array.from(rawMarkDoc.marks.entries());
            } else if (typeof rawMarkDoc.marks === 'object' && rawMarkDoc.marks !== null) {
              marksEntries = Object.entries(rawMarkDoc.marks);
            }
            
            marksEntries.forEach(([q, mark]) => {
              const sub = qToSub[q];"""

content = content.replace(target, replacement)

with open(filepath, 'w') as f:
    f.write(content)
print('Patched successfully')
