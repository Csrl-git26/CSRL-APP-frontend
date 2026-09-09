import os

files = [
    '/Users/surya/Desktop/CSRL-APP-frontend/src/components/SubjectTopCentres.jsx',
    '/Users/surya/Desktop/CSRL-APP-frontend/src/components/SubjectTopStudents.jsx'
]

old_shape = """const renderBarShape = (props, dataKey, activeItem) => {
  const { fill, x, y, width, height, index } = props;
  const isActive = activeItem && activeItem.index === index && activeItem.dataKey === dataKey;
  if (isActive) {
    return <rect x={x - 3} y={y - 3} width={width + 6} height={height + 3} fill={fill} rx={4} ry={4} style={{ filter: 'brightness(1.1)', transition: 'all 0.2s' }} />;
  }
  return <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} ry={4} style={{ transition: 'all 0.2s' }} />;
};"""

new_shape = """const renderBarShape = (props, dataKey, activeItem) => {
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

old_grid = """<CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />"""
new_grid = """<defs>
              <linearGradient id="bar3DVertical" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.4} />
                <stop offset="30%" stopColor="#ffffff" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#000000" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />"""


for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()
    
    content = content.replace(old_shape, new_shape)
    
    # ensure defs is only added once
    if "<defs>" not in content:
        content = content.replace(old_grid, new_grid)
    
    with open(file_path, 'w') as f:
        f.write(content)

