import re

filepath = '../CSRL-APP-backed/server.js'
with open(filepath, 'r') as f:
    content = f.read()

target = """app.get('/api/analytics/test-columns', authenticateToken, async (req, res) => {"""

replacement = """app.get('/api/debug-state/:rollKey', async (req, res) => {
  try {
    const rollKey = req.params.rollKey;
    const rawMarks = await StudentRawMarks.find({ studentId: rollKey }).lean();
    const weakTopics = await StudentWeakTopics.find({ studentId: rollKey }).lean();
    const allRaw = await StudentRawMarks.find({ testId: 'FMT02' }).select('studentId').lean();
    
    res.json({
      rollKey,
      rawMarksCount: rawMarks.length,
      weakTopicsCount: weakTopics.length,
      rawMarksTests: rawMarks.map(m => m.testId),
      weakTopicsTests: weakTopics.map(w => w.testId),
      isFMT02InRaw: rawMarks.some(m => m.testId === 'FMT02' || m.testId === 'fmt02'),
      totalStudentsInFMT02: allRaw.length,
      allRollsInFMT02: allRaw.map(m => m.studentId).slice(0, 10) // just a sample
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/analytics/test-columns', authenticateToken, async (req, res) => {"""

if "app.get('/api/debug-state/:rollKey'" not in content:
    content = content.replace(target, replacement)
    with open(filepath, 'w') as f:
        f.write(content)
    print("Debug route added.")
else:
    print("Already added.")
