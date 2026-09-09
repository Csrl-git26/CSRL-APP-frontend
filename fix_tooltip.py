import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

custom_tooltip = """
const CustomStudentTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Recharts passes 'name' as the label from YAxis, which includes "(PTN)".
    // The payload array contains all the bars.
    return (
      <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid #f1f5f9' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 700, color: '#1e293b', fontSize: '13px' }}>{label}</p>
        {payload.map((entry, index) => {
          let val = entry.value;
          if (Array.isArray(val)) {
             val = val[1] - val[0]; // Recover original value for stackOffset="sign"
          }
          if (!val || val === 0) return null; // Hide 0s to keep it clean!
          
          return (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }}></div>
              <span style={{ color: '#475569', fontSize: '12px', fontWeight: 600 }}>{entry.name}:</span>
              <span style={{ color: entry.color, fontSize: '12px', fontWeight: 800 }}>{val}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function InsightsDashboard"""

content = content.replace("export default function InsightsDashboard", custom_tooltip)

old_tooltip = """                                                <Tooltip 
                           contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: 12, fontWeight: 600 }}
                           cursor={{ fill: '#f8fafc' }}
                        />"""

new_tooltip = """                        <Tooltip 
                           content={<CustomStudentTooltip />}
                           cursor={{ fill: '#f8fafc' }}
                        />"""

content = content.replace(old_tooltip, new_tooltip)

with open(file_path, 'w') as f:
    f.write(content)

