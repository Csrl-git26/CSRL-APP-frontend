import os

files = {
    'SubjectTopCentres': '/Users/surya/Desktop/CSRL-APP-frontend/src/components/SubjectTopCentres.jsx',
    'SubjectTopStudents': '/Users/surya/Desktop/CSRL-APP-frontend/src/components/SubjectTopStudents.jsx',
}

for name, path in files.items():
    if os.path.exists(path):
        with open(path, 'r') as f:
            content = f.read()

        # Add isAnimationActive={false} to all Bar elements if not present
        if 'isAnimationActive={false}' not in content:
            content = content.replace('<Bar shape=', '<Bar isAnimationActive={false} shape=')

        with open(path, 'w') as f:
            f.write(content)

