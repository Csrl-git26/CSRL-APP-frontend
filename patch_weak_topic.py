import re

filepath = '../CSRL-APP-backed/services/weakTopicService.js'
with open(filepath, 'r') as f:
    content = f.read()

target = r"""        // Since mark !== null, the question was attempted \(even if the mark is 0\)
        attempted\+\+;
        if \(subj && subjectMetrics\[subj\]\) \{
          subjectMetrics\[subj\]\.attempted\+\+;
        \}"""

replacement = """        // A mark of 0 indicates unattempted in standard OMR output, only count if mark != 0
        if (mark !== 0) {
          attempted++;
          if (subj && subjectMetrics[subj]) {
            subjectMetrics[subj].attempted++;
          }
        }"""

content = re.sub(target, replacement, content)

with open(filepath, 'w') as f:
    f.write(content)
print('Patched weakTopicService.js')
