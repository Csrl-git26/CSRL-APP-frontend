import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

old_chart = """                    <ResponsiveContainer>
                      <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 10, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={renderCustomTick} interval={0} width={70} />"""

new_chart = """                    <ResponsiveContainer width="100%" height={210}>
                      <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 60, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />
                        <XAxis type="number" domain={[0, 'dataMax + 20']} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={renderCustomTick} interval={0} width={80} />"""

content = content.replace(old_chart, new_chart)

with open(file_path, 'w') as f:
    f.write(content)

