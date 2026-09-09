import os

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

old_shape = """const renderStudentBarShape = (props, dataKey, chartId, activeStudentBar) => {
  const { fill, x, y, width, height, index } = props;
  const isActive = activeStudentBar && activeStudentBar.chartId === chartId && activeStudentBar.index === index && activeStudentBar.dataKey === dataKey;
  if (isActive) {
    return <rect x={x - 2} y={y - 2} width={width + 4} height={height + 4} fill={fill} style={{ filter: 'brightness(1.1)', transition: 'all 0.2s' }} />;
  }
  return <rect x={x} y={y} width={width} height={height} fill={fill} style={{ transition: 'all 0.2s' }} />;
};"""

new_shape = """const renderStudentBarShape = (props, dataKey, chartId, activeStudentBar) => {
  const { fill, x, y, width, height, index } = props;
  const isActive = activeStudentBar && activeStudentBar.chartId === chartId && activeStudentBar.index === index;
  if (isActive) {
    return <rect x={x} y={y - 2} width={width} height={height + 4} fill={fill} style={{ filter: 'brightness(1.1)', transition: 'all 0.2s' }} />;
  }
  return <rect x={x} y={y} width={width} height={height} fill={fill} style={{ transition: 'all 0.2s' }} />;
};"""

content = content.replace(old_shape, new_shape)

with open(file_path, 'w') as f:
    f.write(content)

