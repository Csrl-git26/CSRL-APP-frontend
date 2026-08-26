import re

filepath = '../CSRL-APP-backed/server.js'
with open(filepath, 'r') as f:
    content = f.read()

target = r"await StudentWeakTopics\.deleteMany\(\{ testId \}\);"
replacement = "await StudentWeakTopics.deleteMany({ testId });\n      await CenterWeakTopics.deleteMany({ testId });"

new_content = re.sub(target, replacement, content)

with open(filepath, 'w') as f:
    f.write(new_content)
print('Fixed clear-raw-marks')
