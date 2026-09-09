import sys

filepath = 'src/components/SubjectTopCentres.jsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("export default function SubjectTopCentres({ centreBoard }) {", "export default function SubjectTopCentres({ centreBoard, onViewCentre }) {")

content = content.replace(
    '<Bar dataKey="top1Val" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Rank 1">',
    '<Bar dataKey="top1Val" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Rank 1" onClick={(data) => onViewCentre && data.top1Code && onViewCentre(data.top1Code)} style={{ cursor: \'pointer\' }}>'
)
content = content.replace(
    '<Bar dataKey="top2Val" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Rank 2">',
    '<Bar dataKey="top2Val" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Rank 2" onClick={(data) => onViewCentre && data.top2Code && onViewCentre(data.top2Code)} style={{ cursor: \'pointer\' }}>'
)
content = content.replace(
    '<Bar dataKey="top3Val" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Rank 3">',
    '<Bar dataKey="top3Val" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Rank 3" onClick={(data) => onViewCentre && data.top3Code && onViewCentre(data.top3Code)} style={{ cursor: \'pointer\' }}>'
)

with open(filepath, 'w') as f:
    f.write(content)


filepath_dash = 'src/components/InsightsDashboard.jsx'
with open(filepath_dash, 'r') as f:
    content_dash = f.read()

content_dash = content_dash.replace(
    "<SubjectTopCentres centreBoard={centreBoard} />",
    "<SubjectTopCentres centreBoard={centreBoard} onViewCentre={onViewCentre} />"
)

with open(filepath_dash, 'w') as f:
    f.write(content_dash)

