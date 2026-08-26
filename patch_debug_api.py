import re

filepath = '../CSRL-APP-backed/server.js'
with open(filepath, 'r') as f:
    content = f.read()

target = """    return res.json({
      chartData,
      weakTopics: formattedWeakTopics,
    });"""

replacement = """    return res.json({
      chartData,
      weakTopics: formattedWeakTopics,
      debug: {
        rollKey: rollKey,
        rawMarksLength: rawMarks ? rawMarks.length : 0,
        topicMapsLength: topicMaps ? topicMaps.length : 0,
        foundTestIdsInRawMarks: rawMarks ? rawMarks.map(m => m.testId) : [],
        foundTestIdsInTopicMaps: topicMaps ? topicMaps.map(m => m.testId) : [],
        rawMarkDocFMT02: rawMarks ? rawMarks.find(m => m.testId === 'FMT02' || m.testId === 'fmt02') : null
      }
    });"""

content = content.replace(target, replacement)

with open(filepath, 'w') as f:
    f.write(content)
print('API Debug Patched')
