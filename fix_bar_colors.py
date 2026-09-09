import os

file_paths = ['src/components/SubjectTopCentres.jsx', 'src/components/SubjectTopStudents.jsx']

old_shape = """const renderBarShape = (props, dataKey, activeItem) => {
  const { fill, x, y, width, height, index } = props;
  const isActive = activeItem && activeItem.index === index && activeItem.dataKey === dataKey;
  
  const adjustedX = isActive ? x - 2 : x;
  const adjustedY = isActive ? y - 2 : y;
  const adjustedWidth = isActive ? width + 4 : width;
  const adjustedHeight = isActive ? height + 2 : height;
  
  return (
    <g>
      <rect x={adjustedX} y={adjustedY} width={adjustedWidth} height={adjustedHeight} fill={fill} rx={6} ry={6} style={{ filter: isActive ? 'drop-shadow(0px 4px 8px rgba(0,0,0,0.25)) brightness(1.15)' : 'drop-shadow(0px 2px 4px rgba(0,0,0,0.12))', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      <rect x={adjustedX} y={adjustedY} width={adjustedWidth} height={adjustedHeight} fill="url(#bar3DVertical)" rx={6} ry={6} style={{ transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', pointerEvents: 'none', mixBlendMode: 'overlay' }} />
    </g>
  );
};"""

new_shape = """const renderBarShape = (props, dataKey, activeItem) => {
  const { fill, x, y, width, height, index, payload } = props;
  const isActive = activeItem && activeItem.index === index && activeItem.dataKey === dataKey;
  
  let barFill = fill;
  if (payload && payload.subject) {
    if (payload.subject === 'PHY') barFill = '#3b82f6';
    else if (payload.subject === 'CHEM') barFill = '#8b5cf6';
    else if (payload.subject === 'MATH') barFill = '#0ea5e9';
  }
  
  const adjustedX = isActive ? x - 2 : x;
  const adjustedY = isActive ? y - 2 : y;
  const adjustedWidth = isActive ? width + 4 : width;
  const adjustedHeight = isActive ? height + 2 : height;
  
  return (
    <g>
      <rect x={adjustedX} y={adjustedY} width={adjustedWidth} height={adjustedHeight} fill={barFill} rx={6} ry={6} style={{ filter: isActive ? 'drop-shadow(0px 4px 8px rgba(0,0,0,0.25)) brightness(1.15)' : 'drop-shadow(0px 2px 4px rgba(0,0,0,0.12))', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      <rect x={adjustedX} y={adjustedY} width={adjustedWidth} height={adjustedHeight} fill="url(#bar3DVertical)" rx={6} ry={6} style={{ transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', pointerEvents: 'none', mixBlendMode: 'overlay' }} />
    </g>
  );
};"""

for path in file_paths:
    with open(path, 'r') as f:
        content = f.read()
    content = content.replace(old_shape, new_shape)
    with open(path, 'w') as f:
        f.write(content)
