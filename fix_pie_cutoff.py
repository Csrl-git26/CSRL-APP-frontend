import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update InteractivePieChart to accept compareKey and cutoff
old_component = """const InteractivePieChart = ({ sorted, overallAvg, onViewCentre }) => {"""
new_component = """const InteractivePieChart = ({ sorted, cutoff, compareKey, onViewCentre }) => {"""
content = content.replace(old_component, new_component)

old_label_is_above = """const isAbove = (sorted[index]?.avg !== undefined ? sorted[index].avg : sorted[index]?.qualRate || 0) >= overallAvg;"""
new_label_is_above = """const val = sorted[index]?.[compareKey] || 0;
          const isAbove = val >= cutoff;"""
content = content.replace(old_label_is_above, new_label_is_above)

old_cell_is_above = """const isAbove = (entry.avg !== undefined ? entry.avg : entry.qualRate || 0) >= overallAvg;"""
new_cell_is_above = """const val = entry[compareKey] || 0;
           const isAbove = val >= cutoff;"""
content = content.replace(old_cell_is_above, new_cell_is_above)

old_tooltip_is_above = """const isAbove = (data.avg !== undefined ? data.avg : data.qualRate || 0) >= overallAvg;"""
new_tooltip_is_above = """const val = data[compareKey] || 0;
            const isAbove = val >= cutoff;"""
content = content.replace(old_tooltip_is_above, new_tooltip_is_above)

# 2. Update the two instances of InteractivePieChart
# First chart (Average Score)
old_first_chart = """<InteractivePieChart sorted={sorted} overallAvg={overallAvg} onViewCentre={onViewCentre} />"""
new_first_chart = """<InteractivePieChart sorted={sorted} cutoff={overallAvg} compareKey="avg" onViewCentre={onViewCentre} />"""
content = content.replace(old_first_chart, new_first_chart, 1)

# Second chart (Qualification)
old_second_chart = """<InteractivePieChart sorted={sorted} overallAvg={overallAvg} onViewCentre={onViewCentre} />"""
new_second_chart = """<InteractivePieChart sorted={sorted} cutoff={80} compareKey="qualRate" onViewCentre={onViewCentre} />"""
content = content.replace(old_second_chart, new_second_chart, 1)

# 3. Update the legend for the second chart
old_qual_legend = """<div style={{ display: 'flex', gap: 16, marginTop: 15, fontSize: 13, color: '#475569', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3b82f6', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>Above Average</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f97316', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>Below Average</span>
                  </div>
                </div>"""

new_qual_legend = """<div style={{ display: 'flex', gap: 16, marginTop: 15, fontSize: 13, color: '#475569', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3b82f6', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>&ge; 80% Qual</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f97316', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>&lt; 80% Qual</span>
                  </div>
                </div>"""

# Since both charts have the exact same legend block, we will replace the LAST occurrence
# by rsplitting and rejoining.
parts = content.rsplit(old_qual_legend, 1)
if len(parts) == 2:
    content = parts[0] + new_qual_legend + parts[1]

with open(file_path, 'w') as f:
    f.write(content)

