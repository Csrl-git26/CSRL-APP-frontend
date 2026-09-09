import os

files_to_check = {
    'SubjectTopCentres': '/Users/surya/Desktop/CSRL-APP-frontend/src/components/SubjectTopCentres.jsx',
    'SubjectTopStudents': '/Users/surya/Desktop/CSRL-APP-frontend/src/components/SubjectTopStudents.jsx',
}

old_grid = '<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />'
new_grid = '<CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />'

for name, path in files_to_check.items():
    if os.path.exists(path):
        with open(path, 'r') as f:
            content = f.read()
        
        content = content.replace(old_grid, new_grid)
        
        with open(path, 'w') as f:
            f.write(content)
            
