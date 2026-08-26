import re

filepath = '../CSRL-APP-backed/server.js'
with open(filepath, 'r') as f:
    content = f.read()

target = """    await StudentWeakTopics.deleteMany({ testId });"""

replacement = """    await StudentWeakTopics.deleteMany({ testId });
    await mongoose.connection.db.collection('centerweaktopics').deleteMany({ testId });"""

content = content.replace(target, replacement)

with open(filepath, 'w') as f:
    f.write(content)
print('Fixed Clear Data API')
