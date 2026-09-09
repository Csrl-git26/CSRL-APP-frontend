import os

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update renderStudentBarShape
old_shape = """const renderStudentBarShape = (props, dataKey, chartId, activeStudentBar) => {
  const { fill, x, y, width, height, index } = props;
  const isActive = activeStudentBar && activeStudentBar.chartId === chartId && activeStudentBar.index === index;
  if (isActive) {
    return <rect x={x} y={y - 2} width={width} height={height + 4} fill={fill} style={{ filter: 'brightness(1.1)', transition: 'all 0.2s' }} />;
  }
  return <rect x={x} y={y} width={width} height={height} fill={fill} style={{ transition: 'all 0.2s' }} />;
};"""

new_shape = """const renderStudentBarShape = (props, dataKey, chartId, activeStudentBar) => {
  const { fill, x, y, width, height, index } = props;
  const isActive = activeStudentBar && activeStudentBar.chartId === chartId && activeStudentBar.index === index;
  
  const gap = 2;
  const adjustedX = x + gap/2;
  const adjustedWidth = Math.max(0, width - gap);
  
  const adjustedY = isActive ? y - 2 : y;
  const adjustedHeight = isActive ? height + 4 : height;
  
  return (
    <g>
      <rect x={adjustedX} y={adjustedY} width={adjustedWidth} height={adjustedHeight} fill={fill} rx={6} ry={6} style={{ filter: isActive ? 'drop-shadow(0px 4px 8px rgba(0,0,0,0.25)) brightness(1.15)' : 'drop-shadow(0px 2px 4px rgba(0,0,0,0.12))', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      <rect x={adjustedX} y={adjustedY} width={adjustedWidth} height={adjustedHeight} fill="url(#bar3D)" rx={6} ry={6} style={{ transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', pointerEvents: 'none', mixBlendMode: 'overlay' }} />
    </g>
  );
};"""

content = content.replace(old_shape, new_shape)

# 2. Inject <defs> block inside BarChart
old_barchart = """<CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />"""
new_barchart = """<defs>
                          <linearGradient id="bar3D" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.5} />
                            <stop offset="30%" stopColor="#ffffff" stopOpacity={0.1} />
                            <stop offset="100%" stopColor="#000000" stopOpacity={0.2} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />"""

content = content.replace(old_barchart, new_barchart)

with open(file_path, 'w') as f:
    f.write(content)

