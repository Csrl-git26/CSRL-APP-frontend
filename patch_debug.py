import re

filepath = '../CSRL-APP-backed/server.js'
with open(filepath, 'r') as f:
    content = f.read()

target = r"return res\.json\(\{[\s\S]*?\}\);"
replacement = """
    const rawFMT02 = await StudentRawMarks.findOne({ testId: 'FMT02', studentId: rollKey }).lean();
    const topicMapFMT02 = await TopicMap.findOne({ testId: 'FMT02' }).lean();
    const weakFMT02 = await StudentWeakTopics.findOne({ testId: 'FMT02', studentId: rollKey }).lean();
    
    // Simulate the fallback logic
    let marksEntries = [];
    if (rawFMT02 && rawFMT02.marks) {
      if (rawFMT02.marks instanceof Map) marksEntries = Array.from(rawFMT02.marks.entries());
      else if (typeof rawFMT02.marks === 'object' && rawFMT02.marks !== null) marksEntries = Object.entries(rawFMT02.marks);
    }
    
    let qToSub = {};
    if (topicMapFMT02) {
      (topicMapFMT02.topics || []).forEach(t => {
        (t.questions || []).forEach(q => {
          qToSub[q] = t.subject;
        });
      });
    }

    return res.json({ 
      hasRaw: !!rawFMT02,
      rawMarksKeys: rawFMT02 ? Object.keys(rawFMT02.marks || {}).slice(0, 5) : [],
      marksEntriesCount: marksEntries.length,
      hasTopicMap: !!topicMapFMT02,
      topicMapTopicsCount: topicMapFMT02 ? (topicMapFMT02.topics || []).length : 0,
      qToSubKeysCount: Object.keys(qToSub).length,
      weakTopics: weakFMT02
    });
"""

# Replace only the first return res.json inside debug-state
new_content = re.sub(r"(app\.get\('/api/debug-state/:rollKey'[\s\S]*?)return res\.json\(\{[\s\S]*?\}\);", r"\1" + replacement, content)

with open(filepath, 'w') as f:
    f.write(new_content)
print('Patched debug route')
