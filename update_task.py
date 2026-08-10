import re

with open('/Users/surya/.gemini/antigravity-ide/brain/567b3099-b6f3-42e8-b895-bacad9ca8f38/task.md', 'r') as f:
    content = f.read()

content = content.replace("[/] 1. Backend (`server.js`)", "[x] 1. Backend (`server.js`)")
content = content.replace("- [ ] Add ranking logic inside `/api/analytics/student-chart`.", "- [x] Add ranking logic inside `/api/analytics/student-chart`.")
content = content.replace("- [ ] Apply `rankStudentsByTest` to each subject/total and attach to chartData rows.", "- [x] Apply `rankStudentsByTest` to each subject/total and attach to chartData rows.")

content = content.replace("- [ ] 2. Frontend (`StudentProfileView.jsx`)", "- [x] 2. Frontend (`StudentProfileView.jsx`)")
content = content.replace("- [ ] Update table headers to include \"RANK\".", "- [x] Update table headers to include \"RANK\".")
content = content.replace("- [ ] Add `Qualification` column and logic.", "- [x] Add `Qualification` column and logic.")
content = content.replace("- [ ] Display the metrics in the new format: `M | AT. | AC. | RANK`.", "- [x] Display the metrics in the new format: `M | AT. | AC. | RANK`.")

with open('/Users/surya/.gemini/antigravity-ide/brain/567b3099-b6f3-42e8-b895-bacad9ca8f38/task.md', 'w') as f:
    f.write(content)
