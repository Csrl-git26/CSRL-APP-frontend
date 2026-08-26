import re

filepath = '../CSRL-APP-backed/server.js'
with open(filepath, 'r') as f:
    content = f.read()

target = r"app\.get\('/api/analytics/student-chart', authenticateToken, async \(req, res\) => \{"
replacement = "app.get('/api/analytics/student-chart', async (req, res) => {"

new_content = re.sub(target, replacement, content)

with open(filepath, 'w') as f:
    f.write(new_content)
print('Patched auth')
