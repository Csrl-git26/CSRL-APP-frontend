import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

old_label = """const CustomBarLabel = (props) => {
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
};"""

new_label = """const CustomBarLabel = (props) => {
  const { x, y, width, height, value, prefix } = props;
  // In Recharts stackOffset="sign", value can be an array [baseline, actualValue]
  const val = Array.isArray(value) ? value[1] - value[0] : value; 
  // We use the raw value from the original dataset mapping instead of Recharts calculated array to be safe,
  // but since we only pass the raw value to dataKey, `value` is usually the raw value.
  // Actually, props.value is always the array in stacked bar charts!
  // Wait, no. If we mapped `d.Physics = 4`, `value` is the array `[0, 4]`.
  // Let's just use `props.value` if it's a number, or extract it if it's an array.
  const displayValue = Array.isArray(value) ? (value[1] > value[0] ? value[1] - value[0] : value[1] - value[0]) : value;
  
  // Recharts passes negative width for negative bars!
  const absWidth = Math.abs(width);
  if (!displayValue || displayValue === 0 || absWidth < 0.1) return null;
  
  // Hide extremely tiny bars where even vertical text wouldn't fit
  if (absWidth < 6) return null;

  const cx = x + width / 2;
  const cy = y + height / 2;
  
  // Rotate text 90 degrees if the bar is too thin for horizontal text
  const isThin = absWidth < 18;

  // Extract the original sign for the display label
  const labelVal = Array.isArray(value) ? (value[1] >= value[0] ? (value[1] - value[0]) : (value[1] - value[0])) : value;

  return (
    <text 
       x={cx} 
       y={cy} 
       fill="#fff" 
       fontSize={8} 
       fontWeight={700} 
       textAnchor="middle" 
       dominantBaseline="central"
       transform={isThin ? `rotate(-90, ${cx}, ${cy})` : ''}
    >
      {prefix}{labelVal > 0 ? labelVal : labelVal}
    </text>
  );
};"""

# A cleaner version of the CustomBarLabel
clean_label = """const CustomBarLabel = (props) => {
  const { x, y, width, height, value, prefix } = props;
  
  // In Recharts with stackOffset="sign", `value` is passed as an array [base, current]
  let val = value;
  if (Array.isArray(value)) {
    val = value[1] - value[0]; // Recover the original value
  }
  
  if (!val || val === 0) return null;
  
  const absWidth = Math.abs(width);
  
  // Hide completely if less than 6 pixels wide
  if (absWidth < 6) return null;

  const cx = x + width / 2;
  const cy = y + height / 2;
  
  // Rotate 90 degrees if it's too thin to fit horizontal text
  const isThin = absWidth < 18;

  return (
    <text 
       x={cx} 
       y={cy} 
       fill="#fff" 
       fontSize={8} 
       fontWeight={700} 
       textAnchor="middle" 
       dominantBaseline="central"
       transform={isThin ? `rotate(-90, ${cx}, ${cy})` : ''}
    >
      {prefix}{val}
    </text>
  );
};"""

content = content.replace(old_label, clean_label)

with open(file_path, 'w') as f:
    f.write(content)

