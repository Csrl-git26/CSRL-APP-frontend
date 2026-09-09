import os

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

old_tooltip = """<Tooltip 
                      cursor={{ fill: 'transparent' }} 
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12, fontWeight: 600 }} 
                      labelFormatter={(label, payload) => `Rank ${payload?.[0]?.payload?.rank || (5 - Number(label))}`}
                      formatter={(val, name, props) => [`${val}%`, props?.payload?.name || 'Qual Rate']}
                    />"""

new_tooltip = """<Tooltip 
                      cursor={{ fill: 'transparent' }} 
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12, fontWeight: 600 }} 
                      labelStyle={{ display: 'none' }}
                      formatter={(val, name, props) => [`${val}%`, props?.payload?.name || 'Qual Rate']}
                    />"""

content = content.replace(old_tooltip, new_tooltip)

with open(file_path, 'w') as f:
    f.write(content)

