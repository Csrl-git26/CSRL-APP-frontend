import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update margin and YAxis width
old_barchart = """                    <ResponsiveContainer width="100%" height={210}>
                      <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 60, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />
                        <XAxis type="number" domain={[0, 'auto']} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={renderCustomTick} interval={0} width={80} />"""

new_barchart = """                    <ResponsiveContainer width="100%" height={210}>
                      <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />
                        <XAxis type="number" domain={[0, 'auto']} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={renderCustomTick} interval={0} width={95} />"""

content = content.replace(old_barchart, new_barchart)

# 2. Unwrap Top & Bottom 5 Students
old_layout = """      {/* Top & Bottom 5 Students */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 10 }}>
        {renderStudentChart(top5, 'Top 5 Students', Trophy, '#2563eb')}
        {renderStudentChart(bottom5, 'Bottom 5 Students', Star, '#ef4444')}
      </div>"""

new_layout = """      {/* Top & Bottom 5 Students (Each taking 1 column in the 4-col grid) */}
      {renderStudentChart(top5, 'Top 5 Students', Trophy, '#2563eb')}
      {renderStudentChart(bottom5, 'Bottom 5 Students', Star, '#ef4444')}"""

content = content.replace(old_layout, new_layout)

with open(file_path, 'w') as f:
    f.write(content)

