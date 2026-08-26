import re

filepath = '../CSRL-APP-backed/server.js'
with open(filepath, 'r') as f:
    content = f.read()

target = r"""              if \(mark !== undefined && mark !== null\) \{
                metrics\[sub\]\.attempted\+\+;
                totalAttempted\+\+;
                if \(Number\(mark\) > 0\) \{
                  metrics\[sub\]\.correct\+\+;
                  totalCorrect\+\+;
                \}
              \}"""

replacement = """              if (mark !== undefined && mark !== null && mark !== 0) {
                metrics[sub].attempted++;
                totalAttempted++;
                if (Number(mark) > 0) {
                  metrics[sub].correct++;
                  totalCorrect++;
                }
              }"""

content = re.sub(target, replacement, content)

with open(filepath, 'w') as f:
    f.write(content)
print('Patched server.js')
