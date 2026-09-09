import os

files_to_check = {
    'SubjectTopCentres': '/Users/surya/Desktop/CSRL-APP-frontend/src/components/SubjectTopCentres.jsx',
    'SubjectTopStudents': '/Users/surya/Desktop/CSRL-APP-frontend/src/components/SubjectTopStudents.jsx',
}

custom_active_bar_code = """
const CustomActiveBar = (props) => {
  const { fill, x, y, width, height } = props;
  return (
    <rect 
      x={x - 3} 
      y={y - 3} 
      width={width + 6} 
      height={height + 3} 
      fill={fill} 
      rx={4} 
      ry={4} 
      style={{ filter: 'brightness(1.1)' }}
    />
  );
};
"""

for name, path in files_to_check.items():
    if os.path.exists(path):
        with open(path, 'r') as f:
            content = f.read()
        
        # Inject the custom bar component if not present
        if "CustomActiveBar" not in content:
            # find where to inject: after the last import
            parts = content.split('\n\n', 1)
            if len(parts) == 2:
                content = parts[0] + "\n" + custom_active_bar_code + "\n" + parts[1]
                
        # Add activeBar prop to all <Bar ... />
        content = content.replace("<Bar dataKey=", "<Bar activeBar={<CustomActiveBar />} dataKey=")
        
        with open(path, 'w') as f:
            f.write(content)

