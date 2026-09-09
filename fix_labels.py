import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Let's insert the CustomLabel component right before the InsightsDashboard default export
custom_label_code = """
const CustomBarLabel = (props) => {
  const { x, y, width, height, value, prefix } = props;
  if (!value || value === 0) return null;
  // If the bar is physically too thin on the screen, hide the text to prevent overlapping
  if (width < 18) return null;
  return (
    <text 
       x={x + width / 2} 
       y={y + height / 2} 
       fill="#fff" 
       fontSize={8} 
       fontWeight={700} 
       textAnchor="middle" 
       dominantBaseline="central"
    >
      {prefix}{value}
    </text>
  );
};

export default function InsightsDashboard"""

content = content.replace("export default function InsightsDashboard", custom_label_code)

# Replace all LabelLists with the custom content
old_p = '<LabelList dataKey="Physics" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v !== 0 && v !== undefined ? `P${v}` : \'\'} />'
new_p = '<LabelList dataKey="Physics" content={(props) => <CustomBarLabel {...props} prefix="P" />} />'
content = content.replace(old_p, new_p)

old_c = '<LabelList dataKey="Chemistry" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v !== 0 && v !== undefined ? `C${v}` : \'\'} />'
new_c = '<LabelList dataKey="Chemistry" content={(props) => <CustomBarLabel {...props} prefix="C" />} />'
content = content.replace(old_c, new_c)

old_m = '<LabelList dataKey="Math" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v !== 0 && v !== undefined ? `M${v}` : \'\'} />'
new_m = '<LabelList dataKey="Math" content={(props) => <CustomBarLabel {...props} prefix="M" />} />'
content = content.replace(old_m, new_m)

old_math = '<LabelList dataKey="Mathematics" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v !== 0 && v !== undefined ? `M${v}` : \'\'} />'
new_math = '<LabelList dataKey="Mathematics" content={(props) => <CustomBarLabel {...props} prefix="M" />} />'
content = content.replace(old_math, new_math)

old_b = '<LabelList dataKey="Biology" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v !== 0 && v !== undefined ? `B${v}` : \'\'} />'
new_b = '<LabelList dataKey="Biology" content={(props) => <CustomBarLabel {...props} prefix="B" />} />'
content = content.replace(old_b, new_b)

old_bo = '<LabelList dataKey="Botany" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v !== 0 && v !== undefined ? `Bo${v}` : \'\'} />'
new_bo = '<LabelList dataKey="Botany" content={(props) => <CustomBarLabel {...props} prefix="Bo" />} />'
content = content.replace(old_bo, new_bo)

old_z = '<LabelList dataKey="Zoology" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v !== 0 && v !== undefined ? `Z${v}` : \'\'} />'
new_z = '<LabelList dataKey="Zoology" content={(props) => <CustomBarLabel {...props} prefix="Z" />} />'
content = content.replace(old_z, new_z)

with open(file_path, 'w') as f:
    f.write(content)

