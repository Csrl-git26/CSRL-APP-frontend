import os

files = {
    'SubjectTopCentres': '/Users/surya/Desktop/CSRL-APP-frontend/src/components/SubjectTopCentres.jsx',
    'SubjectTopStudents': '/Users/surya/Desktop/CSRL-APP-frontend/src/components/SubjectTopStudents.jsx',
}

for name, path in files.items():
    if os.path.exists(path):
        with open(path, 'r') as f:
            content = f.read()

        if "SubjectTopCentres" in name:
            broken_signature = "export default function SubjectTopCentres({\n  const [activeItem, setActiveItem] = useState(null); centreBoard, onViewCentre }) {"
            fixed_signature = "export default function SubjectTopCentres({ centreBoard, onViewCentre }) {\n  const [activeItem, setActiveItem] = useState(null);"
            content = content.replace(broken_signature, fixed_signature)
        elif "SubjectTopStudents" in name:
            broken_signature = "export default function SubjectTopStudents({\n  const [activeItem, setActiveItem] = useState(null); subjectTopStudents, onViewStudent }) {"
            fixed_signature = "export default function SubjectTopStudents({ subjectTopStudents, onViewStudent }) {\n  const [activeItem, setActiveItem] = useState(null);"
            content = content.replace(broken_signature, fixed_signature)

        with open(path, 'w') as f:
            f.write(content)

