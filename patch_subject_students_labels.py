import sys

filepath = 'src/components/SubjectTopStudents.jsx'
with open(filepath, 'r') as f:
    content = f.read()

# We will define renderCustomizedLabel before the export default function
custom_label_code = """const renderCustomLabel = (props) => {
  const { x, y, width, value } = props;
  if (!value) return null;
  return (
    <text 
      x={x + width / 2} 
      y={y - 2} 
      fill="#475569" 
      fontSize={7.5} 
      fontWeight={800} 
      textAnchor="start" 
      transform={`rotate(-45 ${x + width / 2} ${y - 2})`}
    >
      {value}
    </text>
  );
};

export default function"""

content = content.replace("export default function", custom_label_code)

# Now we replace the LabelList for names
# <LabelList dataKey="top1Code" position="top" fill="#475569" fontSize={8} fontWeight={700} formatter={(v) => v || ''} />
content = content.replace(
    '<LabelList dataKey="top1Code" position="top" fill="#475569" fontSize={8} fontWeight={700} formatter={(v) => v || \'\'} />',
    '<LabelList dataKey="top1Code" content={renderCustomLabel} />'
)
content = content.replace(
    '<LabelList dataKey="top2Code" position="top" fill="#475569" fontSize={8} fontWeight={700} formatter={(v) => v || \'\'} />',
    '<LabelList dataKey="top2Code" content={renderCustomLabel} />'
)
content = content.replace(
    '<LabelList dataKey="top3Code" position="top" fill="#475569" fontSize={8} fontWeight={700} formatter={(v) => v || \'\'} />',
    '<LabelList dataKey="top3Code" content={renderCustomLabel} />'
)

# I should also adjust margin to prevent the rotated labels from being cut off at the top
content = content.replace('margin={{ top: 15, right: 5, left: -20, bottom: 0 }}', 'margin={{ top: 30, right: 10, left: -20, bottom: 0 }}')

with open(filepath, 'w') as f:
    f.write(content)
