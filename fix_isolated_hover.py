import os

files = {
    'SubjectTopCentres': '/Users/surya/Desktop/CSRL-APP-frontend/src/components/SubjectTopCentres.jsx',
    'SubjectTopStudents': '/Users/surya/Desktop/CSRL-APP-frontend/src/components/SubjectTopStudents.jsx',
}

old_custom_active_bar = """const CustomActiveBar = (props) => {
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
};"""

new_shape_renderer = """const renderBarShape = (props, dataKey, activeItem) => {
  const { fill, x, y, width, height, index } = props;
  const isActive = activeItem && activeItem.index === index && activeItem.dataKey === dataKey;
  if (isActive) {
    return <rect x={x - 3} y={y - 3} width={width + 6} height={height + 3} fill={fill} rx={4} ry={4} style={{ filter: 'brightness(1.1)', transition: 'all 0.2s' }} />;
  }
  return <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} ry={4} style={{ transition: 'all 0.2s' }} />;
};"""

for name, path in files.items():
    if os.path.exists(path):
        with open(path, 'r') as f:
            content = f.read()

        # Update import to include useState
        content = content.replace("import React, { useMemo } from 'react';", "import React, { useMemo, useState } from 'react';")

        # Replace CustomActiveBar with renderBarShape
        content = content.replace(old_custom_active_bar, new_shape_renderer)

        # Add state to component
        export_decl = f"export default function {name}("
        if export_decl in content:
            parts = content.split(export_decl)
            component_body = parts[1]
            component_body_parts = component_body.split("{", 1)
            
            # insert state right after opening brace
            new_component_body = "{\n  const [activeItem, setActiveItem] = useState(null);" + component_body_parts[1]
            content = parts[0] + export_decl + new_component_body

        # Update Bar props
        content = content.replace('<Bar activeBar={<CustomActiveBar />} dataKey="top1Val"', '<Bar shape={(props) => renderBarShape(props, "top1Val", activeItem)} onMouseEnter={(_, index) => setActiveItem({index, dataKey: "top1Val"})} onMouseLeave={() => setActiveItem(null)} dataKey="top1Val"')
        content = content.replace('<Bar activeBar={<CustomActiveBar />} dataKey="top2Val"', '<Bar shape={(props) => renderBarShape(props, "top2Val", activeItem)} onMouseEnter={(_, index) => setActiveItem({index, dataKey: "top2Val"})} onMouseLeave={() => setActiveItem(null)} dataKey="top2Val"')
        content = content.replace('<Bar activeBar={<CustomActiveBar />} dataKey="top3Val"', '<Bar shape={(props) => renderBarShape(props, "top3Val", activeItem)} onMouseEnter={(_, index) => setActiveItem({index, dataKey: "top3Val"})} onMouseLeave={() => setActiveItem(null)} dataKey="top3Val"')
        
        with open(path, 'w') as f:
            f.write(content)

