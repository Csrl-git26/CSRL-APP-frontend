import os

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace strings exactly as identified
replacements = {
    "Active Centres": "Active CNT",
    "Top 5 Centres - Average Score": "Top 5 CNT - Average Score",
    "Bottom 5 Centres": "Bottom 5 CNT",
    "Bottom 5 Centres - Qual %": "Bottom 5 CNT - Qual %",
    "Top 5 Centres - Qual %": "Top 5 CNT - Qual %",
    "Centre Distribution - Total Average Score": "CNT Distribution - Total Average Score",
    "Centre Distribution": "CNT Distribution"
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w') as f:
    f.write(content)

file_path_subject = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/SubjectTopCentres.jsx'
with open(file_path_subject, 'r') as f:
    content_subject = f.read()

content_subject = content_subject.replace("Subject Top 3\n", "Subject Top 3 CNT\n")
with open(file_path_subject, 'w') as f:
    f.write(content_subject)

