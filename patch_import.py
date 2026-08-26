import re

filepath = '../CSRL-APP-backed/server.js'
with open(filepath, 'r') as f:
    content = f.read()

target = r"  buildCentreChartData,\n} from '\./services/analyticsService\.js';"
replacement = "  buildCentreChartData,\n  buildStudentChartData,\n} from './services/analyticsService.js';"

new_content = re.sub(target, replacement, content)

with open(filepath, 'w') as f:
    f.write(new_content)
print('Patched import')
