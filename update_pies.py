import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Import Sector
if "import { Sector" not in content:
    content = content.replace("import { PieChart,", "import { Sector, PieChart,")

# 2. Add activeShape renderer
active_shape_code = """
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};
"""
if "const renderActiveShape" not in content:
    content = content.replace("export default function InsightsDashboard", active_shape_code + "\nexport default function InsightsDashboard")

# 3. Add state variables inside InsightsDashboard
states = """  const [activeAvgIndex, setActiveAvgIndex] = useState(-1);
  const [activeQualIndex, setActiveQualIndex] = useState(-1);"""
if "const [activeAvgIndex" not in content:
    content = content.replace("const [showBottom5Qual, setShowBottom5Qual] = useState(false);", "const [showBottom5Qual, setShowBottom5Qual] = useState(false);\n" + states)

# 4. Update the first Pie (Avg)
old_pie_1 = """                    <Pie 
                      data={sorted} 
                      dataKey="equalSlice"
                      startAngle={180}
                      endAngle={-180} 
                      nameKey="code" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={35} 
                      outerRadius={55} 
                      paddingAngle={1}
                      label="""

new_pie_1 = """                    <Pie 
                      data={sorted} 
                      dataKey="equalSlice"
                      startAngle={180}
                      endAngle={-180} 
                      nameKey="code" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={35} 
                      outerRadius={55} 
                      paddingAngle={1}
                      activeIndex={activeAvgIndex}
                      activeShape={renderActiveShape}
                      onMouseEnter={(_, index) => setActiveAvgIndex(index)}
                      onMouseLeave={() => setActiveAvgIndex(-1)}
                      onClick={(entry) => onViewCentre && onViewCentre(entry.code)}
                      style={{ cursor: 'pointer' }}
                      label="""
# We will just replace it once, but wait, both pies look exactly the same textually!
# So we can find the two instances and replace them individually.

# Let's find occurrences of `<PieChart>` block for Avg and Qual.
import re

# Avg Pie
avg_match = re.search(r'(Centre Distribution - Total Average Score.*?)<Pie(\s+data={sorted}\s+dataKey="equalSlice"\s+startAngle={180}\s+endAngle={-180}\s+nameKey="code"\s+cx="50%"\s+cy="50%"\s+innerRadius={35}\s+outerRadius={55}\s+paddingAngle={1})', content, flags=re.DOTALL)

if avg_match:
    new_avg = avg_match.group(1) + "<Pie" + avg_match.group(2) + """
                      activeIndex={activeAvgIndex}
                      activeShape={renderActiveShape}
                      onMouseEnter={(_, index) => setActiveAvgIndex(index)}
                      onMouseLeave={() => setActiveAvgIndex(-1)}
                      onClick={(entry) => onViewCentre && onViewCentre(entry.code)}
                      style={{ cursor: 'pointer' }}"""
    content = content.replace(avg_match.group(0), new_avg)

# Qual Pie
qual_match = re.search(r'(Centre Distribution - Total qualification %.*?)<Pie(\s+data={sorted}\s+dataKey="equalSlice"\s+startAngle={180}\s+endAngle={-180}\s+nameKey="code"\s+cx="50%"\s+cy="50%"\s+innerRadius={35}\s+outerRadius={55}\s+paddingAngle={1})', content, flags=re.DOTALL)

if qual_match:
    new_qual = qual_match.group(1) + "<Pie" + qual_match.group(2) + """
                      activeIndex={activeQualIndex}
                      activeShape={renderActiveShape}
                      onMouseEnter={(_, index) => setActiveQualIndex(index)}
                      onMouseLeave={() => setActiveQualIndex(-1)}
                      onClick={(entry) => onViewCentre && onViewCentre(entry.code)}
                      style={{ cursor: 'pointer' }}"""
    content = content.replace(qual_match.group(0), new_qual)

with open(file_path, 'w') as f:
    f.write(content)

