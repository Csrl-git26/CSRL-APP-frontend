import os

files = [
    '/Users/surya/Desktop/CSRL-APP-frontend/src/components/SubjectTopStudents.jsx',
    '/Users/surya/Desktop/CSRL-APP-frontend/src/components/SubjectTopCentres.jsx'
]

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # We want to change barCategoryGap="15%" to barCategoryGap="5%" and barGap={2} to barGap={4}
    # and maybe explicitly provide maxBarSize={28}
    content = content.replace('barGap={2} barCategoryGap="15%"', 'barGap={4} barCategoryGap="5%" maxBarSize={30}')

    with open(file_path, 'w') as f:
        f.write(content)

