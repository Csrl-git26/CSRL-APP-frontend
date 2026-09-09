import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update renderCustomTick
old_tick = """                const renderCustomTick = (props) => {
                  const { x, y, payload } = props;
                  const nameParts = payload.value.split(' (');
                  const name = nameParts[0];
                  const extra = nameParts.length > 1 ? '(' + nameParts[1] : '';
                  const total = chartData.find(d => d.name === payload.value)?.total || '';
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text x={0} y={12} dy={0} textAnchor="middle" fill="#64748b" fontSize={7} fontWeight={700}>{name}</text>
                      {extra && <text x={0} y={22} dy={0} textAnchor="middle" fill="#64748b" fontSize={6}>{extra}</text>}
                      <text x={0} y={34} dy={0} textAnchor="middle" fill="#1e293b" fontSize={9} fontWeight={900}>{total}</text>
                    </g>
                  );
                };"""

new_tick = """                const renderCustomTick = (props) => {
                  const { x, y, payload } = props;
                  const nameParts = payload.value.split(' (');
                  const name = nameParts[0];
                  const extra = nameParts.length > 1 ? '(' + nameParts[1] : '';
                  const total = chartData.find(d => d.name === payload.value)?.total || '';
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text x={-5} y={-4} textAnchor="end" fill="#64748b" fontSize={9} fontWeight={700}>{name} {extra}</text>
                      <text x={-5} y={8} textAnchor="end" fill="#1e293b" fontSize={10} fontWeight={900}>{total}</text>
                    </g>
                  );
                };"""

content = content.replace(old_tick, new_tick)

# 2. Update BarChart layout and Axes
old_chart = """                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={renderCustomTick} interval={0} />
                        <YAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />"""

new_chart = """                      <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 10, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={renderCustomTick} interval={0} width={70} />"""

content = content.replace(old_chart, new_chart)

with open(file_path, 'w') as f:
    f.write(content)

