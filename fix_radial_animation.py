import os

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

old_radial = """<RadialBar 
                      minAngle={15} 
                      background={{ fill: '#f1f5f9' }} 
                      clockWise={true} 
                      dataKey="value" 
                      shape={(props) => renderRadialBarShape(props, activeRadialIndex)}"""

new_radial = """<RadialBar 
                      isAnimationActive={false}
                      minAngle={15} 
                      background={{ fill: '#f1f5f9' }} 
                      clockWise={true} 
                      dataKey="value" 
                      shape={(props) => renderRadialBarShape(props, activeRadialIndex)}"""

content = content.replace(old_radial, new_radial)

with open(file_path, 'w') as f:
    f.write(content)

