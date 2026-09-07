import re

with open('src/components/InsightsDashboard.jsx', 'r') as f:
    content = f.read()

# Define the markers
top_students_start = content.find('{/* Left Column: Top 5 Students */}')
top_students_end = content.find('</div>', top_students_start) + len('</div>') + 1
# Need to make sure we got the right closing div for top students
top_students_block = content[top_students_start:top_students_end]

centres_start = content.find('{/* Stacked Top 10 Centres ── */}')
centres_end = content.find('})()}', centres_start) + len('})()}') + 1
# Actually there might be more to the centres block, let's look at the original content string
centres_end = content.find('})()}', centres_start)
centres_end = content.find('</div>', centres_end) + len('</div>') + 1

centres_block = content[centres_start:centres_end]

# Verify we got the blocks right
# print(top_students_block)
# print("---")
# print(centres_block)

# Perform the swap by replacing the entire section
full_section_start = top_students_start
full_section_end = centres_end

new_section = centres_block + '\n\n        ' + top_students_block

new_content = content[:full_section_start] + new_section + content[full_section_end:]

with open('src/components/InsightsDashboard.jsx', 'w') as f:
    f.write(new_content)
