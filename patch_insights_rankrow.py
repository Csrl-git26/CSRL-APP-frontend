import re

with open('src/components/InsightsDashboard.jsx', 'r') as f:
    content = f.read()

# Update RankRow props
content = content.replace(
    'function RankRow({ rank, name, center, score, idx, roll, rawScores, onClick }) {',
    'function RankRow({ rank, name, center, score, idx, roll, rawScores, selectedTest, onClick }) {'
)

# Update the subject matching logic
old_logic = """    subjects.forEach(sub => {
      // Find a key in rawScores that matches the subject (e.g. exactly 'Physics' or ends with '_Physics')
      const matchedKey = Object.keys(rawScores).find(k => k === sub || k.toLowerCase().endsWith('_' + sub.toLowerCase()));
      if (matchedKey && rawScores[matchedKey] !== undefined && rawScores[matchedKey] !== null && rawScores[matchedKey] !== '') {"""

new_logic = """    subjects.forEach(sub => {
      // Find a key in rawScores that matches the subject (e.g. exactly 'Physics' or ends with '_Physics')
      // Prefer the key that starts with the selected test
      const keys = Object.keys(rawScores);
      let matchedKey = null;
      if (selectedTest && selectedTest !== 'Multiple Tests') {
         matchedKey = keys.find(k => k === `${selectedTest}_${sub}` || k === `${selectedTest}_${sub.toUpperCase()}` || k === `${selectedTest}_${sub.toLowerCase()}`);
      }
      if (!matchedKey) {
         matchedKey = keys.find(k => k === sub || k.toLowerCase().endsWith('_' + sub.toLowerCase()));
      }
      
      if (matchedKey && rawScores[matchedKey] !== undefined && rawScores[matchedKey] !== null && rawScores[matchedKey] !== '') {"""

content = content.replace(old_logic, new_logic)

# Update where RankRow is called
content = content.replace(
    'score={s.marks??s.score} idx={i} roll={s.roll} rawScores={s.rawScores} onClick={() => onViewStudent && onViewStudent(s.roll)} />',
    'score={s.marks??s.score} idx={i} roll={s.roll} rawScores={s.rawScores} selectedTest={selectedTestKey} onClick={() => onViewStudent && onViewStudent(s.roll)} />'
)

with open('src/components/InsightsDashboard.jsx', 'w') as f:
    f.write(content)
